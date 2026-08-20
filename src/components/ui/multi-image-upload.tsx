"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, X, Upload, Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  entityType: "projects" | "experience" | "certificates";
  entityId: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  maxImages?: number;
}

export function MultiImageUpload({
  value,
  onChange,
  entityType,
  entityId,
  label = "Gallery",
  placeholder = "No images uploaded",
  disabled = false,
  maxImages = 20,
}: MultiImageUploadProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File, insertIndex?: number) => {
      const index = insertIndex ?? value.length;
      setUploadingIndex(index);
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
        const next = [...value];
        next.splice(insertIndex ?? next.length, 0, url);
        onChange(next);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploadingIndex(null);
      }
    },
    [value, entityType, entityId, onChange],
  );

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
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      for (const file of files.slice(0, maxImages - value.length)) {
        await uploadFile(file);
      }
    },
    [disabled, uploadFile, value.length, maxImages],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const files = Array.from(e.target.files ?? []);
      for (const file of files.slice(0, maxImages - value.length)) {
        await uploadFile(file);
      }
      e.target.value = "";
    },
    [disabled, uploadFile, value.length, maxImages],
  );

  const handleRemove = useCallback(
    async (index: number) => {
      const url = value[index];
      if (!url) return;
      try {
        await fetch(`/api/admin/upload?path=${encodeURIComponent(url)}`, {
          method: "DELETE",
        });
      } catch {
        // continue even if delete fails
      }
      const next = value.filter((_, i) => i !== index);
      onChange(next);
    },
    [value, onChange],
  );

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className="w-full">
      <Label className="block text-sm font-medium mb-2">{label}</Label>

      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-video overflow-hidden rounded-xl border border-glass-border bg-glass-bg/50"
            >
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={() => {
                    const next = [...value];
                    if (index > 0) {
                      [next[index - 1], next[index]] = [
                        next[index],
                        next[index - 1],
                      ];
                      onChange(next);
                    }
                  }}
                  disabled={index === 0 || disabled}
                >
                  <GripVertical className="h-3.5 w-3.5 -rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={() => {
                    const next = [...value];
                    if (index < next.length - 1) {
                      [next[index], next[index + 1]] = [
                        next[index + 1],
                        next[index],
                      ];
                      onChange(next);
                    }
                  }}
                  disabled={index === value.length - 1 || disabled}
                >
                  <GripVertical className="h-3.5 w-3.5 rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/20"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              {uploadingIndex === index && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-semibold text-white">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "rounded-xl border-2 border-dashed transition-colors",
          dragActive ? "border-accent bg-accent/5" : "border-glass-border",
          uploadingIndex !== null && "pointer-events-none opacity-60",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploadingIndex !== null}
        />

        {value.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer"
            onClick={triggerFileInput}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <Upload className="h-5 w-5 text-text-muted" />
            </div>
            <div className="text-sm text-text-secondary font-medium">
              Drop images here or click to upload
            </div>
            <p className="text-xs text-text-muted">{placeholder}</p>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              disabled={disabled || uploadingIndex !== null}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload Images
            </Button>
          </div>
        ) : canAddMore ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 p-4 text-sm text-text-secondary transition-colors hover:text-accent"
            onClick={triggerFileInput}
            disabled={disabled || uploadingIndex !== null}
          >
            {uploadingIndex !== null ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add more images ({value.length}/{maxImages})
              </>
            )}
          </button>
        ) : (
          <div className="flex w-full items-center justify-center gap-2 p-4 text-sm text-text-muted">
            Maximum {maxImages} images reached
          </div>
        )}
      </div>
    </div>
  );
}
