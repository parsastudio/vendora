"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { compressAndOptimizeImage } from "@/features/products/utils/image-optimizer";

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const optimizedBlob = await compressAndOptimizeImage(file);
      const webpFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp";
      const optimizedFile = new File([optimizedBlob], webpFilename, {
        type: "image/webp",
      });

      const presignRes = await fetch("/api/admin/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: optimizedFile.name, contentType: optimizedFile.type }),
      });
      const { data } = await presignRes.json();

      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": optimizedFile.type },
        body: optimizedFile,
      });

      onUploadSuccess(data.fileUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
        isDragging
          ? "border-stone-950 bg-stone-50 dark:border-zinc-300 dark:bg-zinc-900"
          : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div className="space-y-1">
        <span className="text-xs font-black uppercase tracking-widest text-stone-900 dark:text-zinc-50 block">
          {isUploading ? "Uploading payload..." : "Transfer Asset"}
        </span>
        <span className="text-[10px] font-semibold text-stone-400 dark:text-zinc-500 block leading-normal">
          Drag &amp; drop reference or click coordinates to browse file system
        </span>
      </div>
    </div>
  );
}
