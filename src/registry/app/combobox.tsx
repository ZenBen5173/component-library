"use client";

/**
 * @name Combobox
 * @description Searchable select with keyboard navigation and animated option filtering — for lists too long for a plain select.
 * @tags combobox, select, search, autocomplete, form, app
 * @height 520
 * @deps motion
 * @note Also takes an async `onSearch` returning a promise, so it works against a remote endpoint rather than a static list.
 * @source src/components/smoothui/combobox/index.tsx
 */
import Combobox from "@/components/smoothui/combobox";

const REGIONS = [
  { value: "iad", label: "us-east — Washington, D.C." },
  { value: "cle", label: "us-east — Cleveland" },
  { value: "sfo", label: "us-west — San Francisco" },
  { value: "pdx", label: "us-west — Portland" },
  { value: "fra", label: "eu-central — Frankfurt" },
  { value: "dub", label: "eu-west — Dublin" },
  { value: "lhr", label: "eu-west — London" },
  { value: "sin", label: "ap-southeast — Singapore" },
  { value: "syd", label: "ap-southeast — Sydney" },
  { value: "hnd", label: "ap-northeast — Tokyo" },
  { value: "bom", label: "ap-south — Mumbai" },
  { value: "gru", label: "sa-east — São Paulo", disabled: true },
];

export default function ComboboxDemo() {
  return (
    <div className="grid min-h-[520px] place-items-start justify-center bg-background p-10 pt-24">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Deploy region
        </p>
        <Combobox options={REGIONS} placeholder="Search regions…" />
        <p className="mt-3 text-xs text-muted-foreground">
          12 options — type to filter. São Paulo is disabled.
        </p>
      </div>
    </div>
  );
}
