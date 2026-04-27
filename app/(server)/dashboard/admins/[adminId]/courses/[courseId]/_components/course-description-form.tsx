"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Course } from "@prisma/client";
import { TiptapDescriptionEditor } from "@/components/tiptap-description-editor-core";
import { StudioAIButton } from "@/components/studio-ai";

interface CourseDescriptionFormProps {
  initialData: Course;
  adminId: string;
  courseId: string;
}

const formSchema = z.object({
  description: z.string().min(1, {
    message: "Course description is required.",
  }),
});

export const CourseDescriptionForm = ({
  initialData,
  adminId,
  courseId,
}: CourseDescriptionFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/admins/${adminId}/courses/${courseId}/descriptions`,
        values
      );
      toast.success("Course updated.");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const aiPrompt = [
    "Write a compelling course description",
    initialData.title ? `for a course titled "${initialData.title}"` : null,
    ". Style: engaging, informative, suitable for an online learning platform.",
    "Include what students will learn and who the course is for. 3-4 sentences.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course description*
        <div className="flex items-center gap-2">
          <StudioAIButton
            variant="inline"
            options={{
              type: "description",
              prompt: aiPrompt,
              onResult: (value) => {
                form.setValue("description", value, { shouldValidate: true });
                setIsEditing(true);
              },
            }}
          />
          <Button onClick={() => setIsEditing((c) => !c)} variant="ghost">
            {isEditing ? (
              <>Cancel</>
            ) : (
              <><Pencil className="h-4 w-4 mr-2" />Edit course description</>
            )}
          </Button>
        </div>
      </div>

      {!isEditing && (
        <div
          className={cn(
            "text-sm mt-2 prose prose-slate max-w-none",
            !initialData.description && "text-slate-500 italic"
          )}
        >
          {initialData.description ? (
            <div dangerouslySetInnerHTML={{ __html: initialData.description }} />
          ) : (
            "Briefly describe the course."
          )}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TiptapDescriptionEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter course description..."
                      maxCharacters={5000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
