"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { updateCourse } from "../actions";

interface CourseDescriptionFormProps {
  initialData: Course;
  adminId: string;
  courseId: string;
}

// Dynamically import Editor
const DynamicEditor = dynamic(
  () => import("@/components/editor").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>,
  }
);

// Custom Preview Component
const Preview = ({ value }: { value: string }) => {
  const [plainText, setPlainText] = useState("");

  useEffect(() => {
    const getPlainText = (html: string) => {
      if (typeof window !== "undefined") {
        // Ensure browser context
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        return doc.body.textContent || "";
      }
      return ""; // Fallback for SSR
    };

    setPlainText(getPlainText(value || ""));
  }, [value]);

  if (!plainText)
    return <p className="text-slate-500 italic">No description</p>;
  return <p className="text-sm">{plainText}</p>;
};

const formSchema = z.object({
  description: z
    .string()
    .max(5000, "Description must be 5000 characters or less")
    .optional(),
});

export const CourseDescriptionForm = ({
  initialData, 
  courseId
}: CourseDescriptionFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEditing = () => setIsEditing((current) => !current);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: initialData.description || "" },
  });
  const {
    reset,
    formState: { isSubmitting, isValid },
  } = form;

  useEffect(() => {
    console.log(
      `[${new Date().toISOString()} CourseDescriptionForm] initialData.description:`,
      initialData.description
    );
  }, [initialData.description]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { success, message } = await updateCourse(courseId, values);
      if (success) {
        toast.success(message);
        toggleEditing();
        reset({ description: values.description || "" });
        router.refresh();
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error(
        `[${new Date().toISOString()} CourseDescriptionForm] Update course error:`,
        error
      );
      toast.error("Unexpected error occurred");
    }
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {isSubmitting && (
        <div
          className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Course description*
        <Button onClick={toggleEditing} variant="ghost" disabled={isSubmitting}>
          {isEditing ? <>Cancel</> : <>Edit description</>}
        </Button>
      </div>
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    {typeof field.onChange === "function" ? (
                      <DynamicEditor
                        value={field.value ?? ""}
                        onChangeAction={field.onChange}
                        onErrorAction={(error) =>
                          form.setError("description", { message: error })
                        }
                        maxFileSize={2 * 1024 * 1024}
                        allowedFileTypes={["image/jpeg", "image/png"]}
                        debounceDelay={500}
                        maxLength={5000}
                        toolbarConfig={{
                          formatting: true,
                          image: true,
                          align: true,
                          clean: true,
                          table: true,
                        }}
                      />
                    ) : (
                      <div>Loading form field...</div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isValid || isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </form>
        </Form>
      )}
      {!isEditing && (
        <div
          className={cn(
            "text-sm mt-2",
            !initialData.description && "text-slate-500 italic"
          )}
        >
          {!initialData.description && "In not more than 5,000 characters, articulate your mission here. A Course can have many Tutorials (i.e., lessons or sessions), you could highlight them cohesively here. This could demonstrate value for money or other desired virtue."}
          {initialData.description && (
            <Preview value={initialData.description} />
          )}
        </div>
      )}
    </div>
  );
};
