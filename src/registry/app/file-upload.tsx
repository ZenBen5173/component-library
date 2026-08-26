"use client";

/**
 * @name File Upload
 * @description Drag-and-drop dropzone with file-type and size limits, plus a filled state listing what was accepted.
 * @tags upload, dropzone, file, form, app
 * @height 560
 * @note Deliberately the plain, neat default. A more animated dropzone is wanted alongside it later, not instead of it.
 * @deps react-dropzone
 * @source src/components/kibo-ui/dropzone/index.tsx
 */
import { useState } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/kibo-ui/dropzone";

export default function FileUploadDemo() {
  const [files, setFiles] = useState<File[] | undefined>();

  return (
    <div className="grid min-h-[560px] place-items-center bg-background p-10">
      <div className="w-full max-w-lg">
        <Dropzone
          accept={{ "image/*": [] }}
          maxFiles={5}
          maxSize={1024 * 1024 * 5}
          onDrop={setFiles}
          onError={console.error}
          src={files}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Images only, up to 5 files, 5MB each.
        </p>
      </div>
    </div>
  );
}
