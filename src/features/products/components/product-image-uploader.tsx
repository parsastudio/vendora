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
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800/40 dark:bg-zinc-950 space-y-4">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Product Image</h2>
      <div>
        {imageUrl ? (
          <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <Image
              src={imageUrl}
              alt="Uploaded storage asset"
              width={160}
              height={160}
              unoptimized
              className="h-full w-full object-cover"
            />
            {onRemoveImage && (
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute top-2.5 right-2.5 rounded-full bg-rose-600 text-white p-1 text-xs font-bold w-6 h-6 flex items-center justify-center hover:bg-rose-700 shadow-md"
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
