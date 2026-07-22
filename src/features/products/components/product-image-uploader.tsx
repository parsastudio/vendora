"use client";

import Image from "next/image";
import { FileUpload } from "@/features/shared/components/ui/file-upload";

interface ProductImageUploaderProps {
  imageUrl: string;
  onImageUpload: (url: string) => void;
  onRemoveImage?: () => void;
}

export function ProductImageUploader({
  imageUrl,
  onImageUpload,
  onRemoveImage,
}: ProductImageUploaderProps) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-4">
      <h2 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-55">
        Product Image
      </h2>
      <div>
        {imageUrl ? (
          <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-stone-200/50 bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900">
            <Image
              src={imageUrl}
              alt="Uploaded variant payload"
              width={176}
              height={176}
              unoptimized
              className="h-full w-full object-cover"
            />
            {onRemoveImage && (
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute top-3 right-3 rounded-full bg-rose-600 text-white p-1 text-xs font-bold w-6 h-6 flex items-center justify-center hover:bg-rose-700 shadow-md"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <FileUpload onUploadSuccess={onImageUpload} />
        )}
      </div>
    </div>
  );
}
