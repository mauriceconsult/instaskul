// components/admin/blog-post-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/tiptap-editor";
import { UploadButton } from "@/components/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface BlogPostFormProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    tags: string[];
    category?: string;
    isPublished: boolean;
  };
}

export function BlogPostForm({ initialData }: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    coverImage: initialData?.coverImage || "",
    tags: initialData?.tags || [],
    category: initialData?.category || "",
    isPublished: initialData?.isPublished || false,
  });

  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const url = initialData?.id
          ? `/api/blog/${initialData.id}`
          : "/api/blog";

        const method = initialData?.id ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Failed to save post");

        toast.success(initialData?.id ? "Post updated!" : "Post created!");
        router.push("/admin/blog");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Failed to save post");
      }
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter post title..."
          required
        />
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        {formData.coverImage ? (
          <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
            <Image
              src={formData.coverImage}
              alt="Cover"
              fill
              className="object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setFormData({ ...formData, coverImage: "" })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res: any) => {
              const file = res?.[0];
              if (file?.url) {
                setFormData({ ...formData, coverImage: file.url });
                toast.success("Image uploaded successfully!");
              }
            }}
            onUploadError={(error: Error) => {
              toast.error(`Upload failed: ${error.message}`);
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label>Content *</Label>
        <TiptapEditor
          content={formData.content}
          onChange={(html: string) => setFormData({ ...formData, content: html })}
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt (optional)</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="Short summary for previews and social sharing..."
          rows={4}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category (optional)</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g., Technology, Education, Lifestyle"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags (optional)</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Type tag and press Enter"
          />
          <Button type="button" onClick={addTag}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Publish Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="publish"
          checked={formData.isPublished}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isPublished: checked })
          }
        />
        <Label htmlFor="publish">Publish immediately</Label>
      </div>

      {/* Submit Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.id ? "Update Post" : "Create Post"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
