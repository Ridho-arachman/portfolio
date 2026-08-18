"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  entityType: "projects" | "experience" | "certificates";
  entityId: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  entityType,
  entityId,
  label = "Image",
  placeholder = "No image uploaded",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", entityType);
      formData.append("entityId", entityId);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url } = await response.json();
      onChange(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [entityType, entityId, onChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) await uploadFile(file);
    },
    [disabled, uploadFile],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const file = e.target.files?.[0];
      if (file) await uploadFile(file);
      e.target.value = "";
    },
    [disabled, uploadFile],
  );

  const handleRemove = useCallback(async () => {
    if (!value) return;
    setUploading(true);
    try {
      await fetch(`/api/admin/upload?path=${encodeURIComponent(value)}`, {
        method: "DELETE",
      });
      onRemove();
    } catch {
      alert("Failed to delete image");
    } finally {
      setUploading(false);
    }
  }, [value, onRemove]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const hasImage = Boolean(value);

  return (
    <div className="w-full">
      <Label htmlFor={`image-upload-${entityType}-${entityId}`} className="block text-sm font-medium mb-2">
        {label}
      </Label>

      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-colors",
          dragActive ? "border-accent bg-accent/5" : "border-glass-border",
          hasImage ? "border-transparent bg-glass-bg/50" : "",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={hasImage ? undefined : triggerFileInput}
      >
        <input
          ref={fileInputRef}
          id={`image-upload-${entityType}-${entityId}`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        {hasImage ? (
          <div className="relative aspect-video w-full">
            <img
              src={value}
              alt={label}
              className="rounded-lg w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={triggerFileInput}
                disabled={uploading}
              >
                <Upload className="h-4 w-4" />
                <span>Change</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 text-destructive hover:bg-destructive/20"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
                <span>Remove</span>
              </Button>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center gap-3 p-6 text-center">
            <ImageIcon className="h-12 w-12 text-text-muted" />
            <div className="text-text-secondary font-medium">{label}</div>
            <p className="text-xs text-text-muted">{placeholder}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={triggerFileInput}
              disabled={disabled || uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        )}
      </div>

      {hasImage && (
        <p className="mt-2 text-xs text-text-muted break-all">
          {value}
        </p>
      )}
    </div>
  );
}