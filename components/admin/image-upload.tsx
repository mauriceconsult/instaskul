// components/admin/image-upload.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onRemove?: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (4MB max)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be less than 4MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload to UploadThing
      const response = await fetch("/api/uploadthing", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      
      // Handle different response formats
      const url = data.url || data[0]?.url || data.data?.url;
      
      if (!url) {
        throw new Error("No URL returned from upload");
      }

      onChange?.(url);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
          <Image
            src={value}
            alt="Upload"
            fill
            className="object-cover"
          />
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        
        <Label
          htmlFor="file-upload"
          className="cursor-pointer block"
        >
          <div className="text-sm font-medium mb-1">
            {isUploading ? "Uploading..." : "Click to upload image"}
          </div>
          <div className="text-xs text-muted-foreground">
            PNG, JPG, GIF up to 4MB
          </div>
        </Label>

        <Input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {isUploading && (
          <div className="mt-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </div>
        )}
      </div>

      {/* Alternative: Paste URL */}
      <div className="text-center text-xs text-muted-foreground">
        <span>or</span>
      </div>
      <div className="space-y-1">
        <Label htmlFor="image-url" className="text-xs">
          Paste image URL
        </Label>
        <Input
          id="image-url"
          placeholder="https://example.com/image.jpg"
          onChange={(e) => {
            const url = e.target.value.trim();
            if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
              onChange?.(url);
            }
          }}
        />
      </div>
    </div>
  );
}
