"use client";

/**
 * @name Drawer
 * @description Bottom sheet that drags to dismiss — the mobile counterpart to the side sheet in Overlays.
 * @tags drawer, bottom-sheet, mobile, overlay, app
 * @height 620
 * @deps vaul, motion
 * @note Controlled only — it renders `open={open}` internally, so passing just a `trigger` does nothing. You must hold the state yourself, as below.
 * @source src/components/smoothui/drawer/index.tsx
 */
import { useState } from "react";
import Drawer from "@/components/smoothui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DrawerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid min-h-[620px] place-items-center bg-background p-10">
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="Add a domain"
        description="Point a domain at this project. DNS changes can take up to an hour."
        trigger={<Button variant="outline">Open drawer</Button>}
        footer={
          <Button className="w-full" onClick={() => setOpen(false)}>
            Add domain
          </Button>
        }
      >
        <div className="grid gap-3 py-2">
          <Label htmlFor="domain" className="text-xs">
            Domain
          </Label>
          <Input id="domain" placeholder="app.acme.com" />
        </div>
      </Drawer>
    </div>
  );
}
