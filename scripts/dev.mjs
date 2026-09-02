#!/usr/bin/env node
/**
 * The dev server, with a memory budget and no orphans.
 *
 * What this project actually costs, measured on this machine:
 *
 *   idle                   276MB
 *   after the gallery     1191MB
 *   after any one preview 2395MB
 *
 * The jump is not a leak. `/preview/[category]/[slug]` reaches its component
 * through a path built at runtime, so the bundler compiles every entry the
 * pattern can match — all ninety-six, three.js and both animation libraries
 * included — in order to serve one. That is also what makes dropping a .tsx
 * into src/registry work with no registration step, which is the point of the
 * repository, so it stays.
 *
 * Three things were tried against that number and none of them moved it:
 *
 *   --max-old-space-size=1536    2335MB — the weight is Turbopack's module
 *                                graph, which lives on the Rust side
 *   turbopackMemoryLimit         2315MB — accepted, reported at startup, no
 *                                measurable effect
 *   a generated map of explicit  2395MB — identical; the route's server graph
 *   imports in place of the glob  is compiled either way
 *
 * Webpack rather than Turbopack was worse: 3373MB for the same one preview.
 *
 * So the ceiling is the ceiling, and what is left is not paying it twice. The
 * real cost on a 16GB laptop was never one server — it was three, because
 * Ctrl+C kills this wrapper and leaves the server it forked holding the port.
 * The signal forwarding at the bottom is the fix that matters. The watchdog
 * above it catches growth past the plateau, which is a different problem and
 * a rarer one.
 *
 *   DEV_MEM_LIMIT_MB=2000 npm run dev   # a tighter budget
 *   DEV_MEM_LIMIT_MB=0    npm run dev   # no watchdog
 *   DEV_HEAP_MB=2048      npm run dev   # a bigger JS heap
 */
import { spawn, execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const HEAP_MB = Number(process.env.DEV_HEAP_MB ?? 1536);
/** Above the ~2.4GB plateau, so this fires on growth rather than normal use. */
const LIMIT_MB = Number(process.env.DEV_MEM_LIMIT_MB ?? 2800);
const CHECK_EVERY_MS = 30_000;
const PORT = "3333";

if (!Number.isFinite(HEAP_MB) || HEAP_MB < 512) {
  console.error(`DEV_HEAP_MB must be a number of at least 512 — got ${process.env.DEV_HEAP_MB}`);
  process.exit(1);
}
if (!Number.isFinite(LIMIT_MB) || LIMIT_MB < 0) {
  console.error(`DEV_MEM_LIMIT_MB must be a number — got ${process.env.DEV_MEM_LIMIT_MB}`);
  process.exit(1);
}

const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
const passthrough = process.argv.slice(2);
const port = passthrough.includes("-p") || passthrough.includes("--port") ? [] : ["-p", PORT];

let child = null;
let watchdog = null;
let stopping = false;
let restarts = 0;

/**
 * Every node process below `rootPid`, summed.
 *
 * The number that matters is not this launcher's — `next dev` forks the actual
 * server, and the forked one is where the memory is. So the whole subtree is
 * measured, workers included.
 */
function readProcessTable() {
  return new Promise((resolve) => {
    const done = (rows) => resolve(rows);

    if (process.platform === "win32") {
      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | " +
            "ForEach-Object { \"$($_.ProcessId) $($_.ParentProcessId) $($_.WorkingSetSize)\" }",
        ],
        { windowsHide: true, maxBuffer: 1 << 20 },
        (err, stdout) => {
          if (err) return done([]);
          done(parseRows(stdout, 1));
        },
      );
      return;
    }

    // rss is in KB here, hence the divisor.
    execFile("ps", ["-eo", "pid=,ppid=,rss="], { maxBuffer: 1 << 20 }, (err, stdout) => {
      if (err) return done([]);
      done(parseRows(stdout, 1024));
    });
  });
}

function parseRows(stdout, byteScale) {
  const rows = [];
  for (const line of stdout.split("\n")) {
    const [pid, ppid, mem] = line.trim().split(/\s+/).map(Number);
    if (Number.isFinite(pid) && Number.isFinite(ppid) && Number.isFinite(mem)) {
      rows.push({ pid, ppid, bytes: mem * byteScale });
    }
  }
  return rows;
}

async function treeMemoryMB(rootPid) {
  const rows = await readProcessTable();
  if (rows.length === 0) return 0;

  const byParent = new Map();
  for (const row of rows) {
    const siblings = byParent.get(row.ppid);
    if (siblings) siblings.push(row);
    else byParent.set(row.ppid, [row]);
  }

  let total = rows.find((r) => r.pid === rootPid)?.bytes ?? 0;
  const queue = [rootPid];
  const seen = new Set(queue);
  while (queue.length > 0) {
    for (const row of byParent.get(queue.pop()) ?? []) {
      if (seen.has(row.pid)) continue;
      seen.add(row.pid);
      total += row.bytes;
      queue.push(row.pid);
    }
  }
  return Math.round(total / (1024 * 1024));
}

function start() {
  child = spawn(process.execPath, [nextBin, "dev", "--turbopack", ...port, ...passthrough], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, `--max-old-space-size=${HEAP_MB}`]
        .filter(Boolean)
        .join(" "),
    },
  });

  child.on("exit", (code, signal) => {
    if (stopping) process.exit(signal ? 1 : (code ?? 0));
  });
}

async function check() {
  if (!child?.pid || stopping) return;
  const mb = await treeMemoryMB(child.pid);
  if (mb <= LIMIT_MB) return;

  restarts += 1;
  console.log(
    `\n[dev] ${mb}MB, over the ${LIMIT_MB}MB budget — restarting (${restarts}). ` +
      `Open pages will reconnect. DEV_MEM_LIMIT_MB raises the budget.\n`,
  );

  const dying = child;
  child = null;
  await new Promise((resolve) => {
    dying.once("exit", resolve);
    dying.kill();
    // The port has to be free before the replacement claims it.
    setTimeout(() => { dying.kill("SIGKILL"); resolve(); }, 5000);
  });
  await new Promise((r) => setTimeout(r, 500));
  start();
}

/** Other node servers already running — the usual reason memory is tight. */
async function reportNeighbours() {
  const rows = await readProcessTable();
  const mb = Math.round(
    rows.filter((r) => r.pid !== process.pid).reduce((sum, r) => sum + r.bytes, 0) /
      (1024 * 1024),
  );
  if (mb > 800) {
    console.log(
      `[dev] other node processes are holding ${mb}MB — another dev server ` +
        `left running, most likely.`,
    );
  }
}

console.log(
  LIMIT_MB > 0
    ? `dev server: ${HEAP_MB}MB heap, restarts past ${LIMIT_MB}MB (DEV_HEAP_MB / DEV_MEM_LIMIT_MB to change)`
    : `dev server: ${HEAP_MB}MB heap, memory watchdog off`,
);

void reportNeighbours();
start();

if (LIMIT_MB > 0) {
  watchdog = setInterval(() => { void check(); }, CHECK_EVERY_MS);
  watchdog.unref();
}

// Without this, Ctrl+C kills this wrapper and leaves the forked server holding
// the port — which is how three of them end up running at once, and how a
// 16GB laptop ends up with 3GB of node.
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopping = true;
    clearInterval(watchdog);
    child?.kill(signal);
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
