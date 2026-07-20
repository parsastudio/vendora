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
      className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors ${
        isDragging
          ? "border-zinc-500 bg-zinc-100 dark:border-zinc-400 dark:bg-zinc-900"
          : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {isUploading ? "Uploading file..." : "Drag and drop or click to upload asset"}
      </span>
    </div>
  );
}
