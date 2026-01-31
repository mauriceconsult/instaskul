// components/admin/blog-post-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, X, Upload } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { TiptapEditor } from "@/components/tiptap-editor";
import { BlogUploadButton } from "@/lib/uploadthing-blog";

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

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500, "Excerpt is too long").optional(),
  coverImage: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
});

export function BlogPostForm({ initialData }: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tagInput, setTagInput] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      coverImage: initialData?.coverImage || "",
      category: initialData?.category || "",
      tags: initialData?.tags || [],
      isPublished: initialData?.isPublished || false,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    const url = initialData?.id
      ? `/api/blog/${initialData.id}`
      : "/api/blog";

    const method = initialData?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const raw = await res.text();
      let message = `HTTP ${res.status} error`;

      try {
        const json = JSON.parse(raw);
        message =
          json.message ||
          json.error ||
          JSON.stringify(json);
      } catch {
        if (raw) message = raw;
      }

      throw new Error(message);
    }

    toast.success(
      initialData?.id ? "Post updated!" : "Post created!"
    );

    startTransition(() => {
      router.push("/admin/blog");
      router.refresh();
    });
  } catch (error: any) {
    console.error("[BLOG_FORM_SUBMIT]", error);
    toast.error(error.message || "Failed to save post");
  }
};


  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !form.getValues("tags").includes(trimmedTag)) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const removeCoverImage = () => {
    form.setValue("coverImage", "");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting}
                  placeholder="Enter post title..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cover Image */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
          {form.watch("coverImage") ? (
            <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
              <Image
                src={form.watch("coverImage")!}
                alt="Cover"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeCoverImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <BlogUploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  const file = res?.[0];
                  if (file?.url) {
                    form.setValue("coverImage", file.url);
                    toast.success("Image uploaded successfully!");
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Upload failed: ${error.message}`);
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: 1200x630px (16:9 ratio)
              </p>
            </div>
          )}
        </div>

        {/* Content Editor */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <FormControl>
                <TiptapEditor
                  content={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Excerpt */}
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isSubmitting}
                  placeholder="Short summary for previews and social sharing (max 500 characters)..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0} / 500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting}
                  placeholder="e.g., Education, Technology, Innovation"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags (Optional)</Label>
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
              disabled={isSubmitting}
            />
            <Button type="button" onClick={addTag} disabled={isSubmitting}>
              Add
            </Button>
          </div>

          {form.watch("tags").length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch("tags").map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publish Toggle */}
        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish Post</FormLabel>
                <FormDescription>
                  Make this post visible to the public
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting || isPending}
          >
            {(isSubmitting || isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData?.id ? "Update Post" : "Create Post"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting || isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
