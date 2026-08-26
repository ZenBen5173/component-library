"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/reduced-motion";

/**
 * Water that actually bends what is behind it.
 *
 * A height field is simulated on the GPU across two float textures, swapped
 * each frame. The pointer drops a dent into it; the wave equation spreads that
 * dent outward and damping settles it. The draw pass reads the slope of the
 * surface and offsets its lookup into the source image by that slope, which is
 * refraction — the reason it reads as water rather than as rings drawn on top.
 *
 * The catch is the source: it can only bend a texture, and live DOM is not
 * one. Give it an image, or let it generate a backdrop.
 */

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/** next = mean(neighbours) - previous, damped. The classic two-buffer wave. */
const SIM = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_state;
uniform vec2 u_texel;
uniform float u_damping;
out vec4 outColor;
void main() {
  vec4 s = texture(u_state, v_uv);
  float here = s.r;
  float prev = s.g;
  float sum =
      texture(u_state, v_uv + vec2(u_texel.x, 0.0)).r
    + texture(u_state, v_uv - vec2(u_texel.x, 0.0)).r
    + texture(u_state, v_uv + vec2(0.0, u_texel.y)).r
    + texture(u_state, v_uv - vec2(0.0, u_texel.y)).r;
  float next = sum * 0.5 - prev;
  next *= u_damping;
  outColor = vec4(next, here, 0.0, 1.0);
}`;

/** Presses a smooth dent into the height field at the pointer. */
const DROP = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_state;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_strength;
out vec4 outColor;
void main() {
  vec4 s = texture(u_state, v_uv);
  float d = distance(v_uv, u_center);
  float drop = smoothstep(u_radius, 0.0, d);
  outColor = vec4(s.r + drop * u_strength, s.g, 0.0, 1.0);
}`;

/** Slope of the surface becomes a UV offset into the image, plus a highlight. */
const DRAW = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_state;
uniform sampler2D u_image;
uniform vec2 u_texel;
uniform float u_refraction;
uniform float u_specular;
out vec4 outColor;
void main() {
  float l = texture(u_state, v_uv - vec2(u_texel.x, 0.0)).r;
  float r = texture(u_state, v_uv + vec2(u_texel.x, 0.0)).r;
  float b = texture(u_state, v_uv - vec2(0.0, u_texel.y)).r;
  float t = texture(u_state, v_uv + vec2(0.0, u_texel.y)).r;

  vec2 slope = vec2(r - l, t - b);
  vec2 uv = v_uv + slope * u_refraction;
  vec3 col = texture(u_image, vec2(uv.x, 1.0 - uv.y)).rgb;

  // Light catching the tilt of the surface.
  vec3 n = normalize(vec3(-slope.x, -slope.y, 0.06));
  float spec = pow(max(dot(n, normalize(vec3(0.3, 0.5, 1.0))), 0.0), 28.0);
  col += spec * u_specular;

  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) ?? "shader failed");
  }
  return sh;
}

function program(gl: WebGL2RenderingContext, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(p, 0, "a_pos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? "link failed");
  }
  return p;
}

/**
 * A plain backdrop.
 *
 * Kept to a soft gradient rather than a grid: over a busy pattern the
 * displacement is loud and obvious, which is the wrong read. On a near-flat
 * ground the surface shows mostly through its highlight, and the bending is
 * something you notice rather than something you are shown.
 */
function backdrop(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;

  const grad = g.createLinearGradient(0, 0, size * 0.6, size);
  grad.addColorStop(0, "#0e1018");
  grad.addColorStop(0.55, "#12141d");
  grad.addColorStop(1, "#0b0d14");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);

  // A single soft bloom, so there is some tone for the surface to move.
  const glow = g.createRadialGradient(
    size * 0.36, size * 0.32, 0,
    size * 0.36, size * 0.32, size * 0.62,
  );
  glow.addColorStop(0, "rgba(139,147,255,0.16)");
  glow.addColorStop(1, "rgba(139,147,255,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);

  return c;
}

export function WaterRipples({
  className,
  src,
  /** Simulation grid. 256 is plenty; higher costs fill rate, not fidelity. */
  resolution = 256,
  /**
   * How far the surface bends what is behind it, as a multiplier on the
   * surface slope. Small on purpose — over a plain ground the highlight does
   * most of the work and heavy displacement looks like a fairground mirror.
   * Push it toward 3 only if the backdrop is busy enough to carry it.
   */
  refraction = 0.9,
  /** Brightness of the light catching the surface. */
  specular = 0.5,
  /** Closer to 1 rings for longer. */
  damping = 0.994,
  /**
   * Propagation rate. The wave advances one cell per simulation step, so this
   * is how many steps a frame is worth — 0.5 spreads the rings at half pace.
   */
  speed = 0.5,
}: {
  className?: string;
  src?: string;
  resolution?: number;
  refraction?: number;
  specular?: number;
  damping?: number;
  speed?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || prefersReducedMotion()) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      premultipliedAlpha: false,
    });
    // Float render targets are an extension even in WebGL2. Without them the
    // height field cannot hold negative values and the simulation is useless.
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) return;
    gl.getExtension("OES_texture_float_linear");

    let disposed = false;
    const simP = program(gl, SIM);
    const dropP = program(gl, DROP);
    const drawP = program(gl, DRAW);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const makeTarget = () => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA16F, resolution, resolution, 0,
        gl.RGBA, gl.HALF_FLOAT, null,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0,
      );
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, fbo };
    };

    let a = makeTarget();
    let b = makeTarget();

    const imageTex = gl.createTexture()!;
    const uploadImage = (source: TexImageSource) => {
      gl.bindTexture(gl.TEXTURE_2D, imageTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    uploadImage(backdrop());
    if (src) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => !disposed && uploadImage(img);
      img.src = src;
    }

    const texel = 1 / resolution;
    const pending: { x: number; y: number }[] = [];
    let lastDrop = { x: -1, y: -1 };

    const onMove = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      const x = (e.clientX - box.left) / box.width;
      const y = 1 - (e.clientY - box.top) / box.height;
      if (x < 0 || y < 0 || x > 1 || y > 1) return;
      // Spaced by travel, so a slow drag does not flood the field.
      if (Math.hypot(x - lastDrop.x, y - lastDrop.y) < 0.012) return;
      lastDrop = { x, y };
      pending.push({ x, y });
    };
    window.addEventListener("pointermove", onMove);

    const fit = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(box.width * dpr));
      canvas.height = Math.max(1, Math.round(box.height * dpr));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    let raf = 0;
    let budget = 0;
    const frame = () => {
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.viewport(0, 0, resolution, resolution);

      // Splashes first, each rendered into the opposite buffer.
      while (pending.length) {
        const p = pending.shift()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, b.fbo);
        gl.useProgram(dropP);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, a.tex);
        gl.uniform1i(gl.getUniformLocation(dropP, "u_state"), 0);
        gl.uniform2f(gl.getUniformLocation(dropP, "u_center"), p.x, p.y);
        gl.uniform1f(gl.getUniformLocation(dropP, "u_radius"), 0.045);
        gl.uniform1f(gl.getUniformLocation(dropP, "u_strength"), 0.13);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        [a, b] = [b, a];
      }

      // Steps of the wave equation, budgeted so the rings can spread slower
      // than the frame rate rather than always one cell per frame.
      budget += speed;
      while (budget >= 1) {
        budget -= 1;
        gl.bindFramebuffer(gl.FRAMEBUFFER, b.fbo);
        gl.useProgram(simP);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, a.tex);
        gl.uniform1i(gl.getUniformLocation(simP, "u_state"), 0);
        gl.uniform2f(gl.getUniformLocation(simP, "u_texel"), texel, texel);
        gl.uniform1f(gl.getUniformLocation(simP, "u_damping"), damping);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        [a, b] = [b, a];
      }

      // Draw the image through the surface.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(drawP);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, a.tex);
      gl.uniform1i(gl.getUniformLocation(drawP, "u_state"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, imageTex);
      gl.uniform1i(gl.getUniformLocation(drawP, "u_image"), 1);
      gl.uniform2f(gl.getUniformLocation(drawP, "u_texel"), texel, texel);
      gl.uniform1f(gl.getUniformLocation(drawP, "u_refraction"), refraction);
      gl.uniform1f(gl.getUniformLocation(drawP, "u_specular"), specular);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
    };
  }, [resolution, refraction, specular, damping, speed, src]);

  return (
    <canvas ref={ref} aria-hidden className={cn("block size-full", className)} />
  );
}
