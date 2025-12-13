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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Coursework, Course } from "@prisma/client";
import { CourseCourseworkList } from "./course-coursework-list";
import { createCoursework, onEditCourseworkAction } from "../coursework/[courseworkId]/actions";
// import { createCoursework, onEditCourseworkAction } from "../actions";

interface CreateCourseworkResponse {
  success: boolean;
  message: string;
  coursework?: Coursework;
}

interface CourseCourseworkFormProps {
  initialData: Course & { courseworks: Coursework[] };
  courseId: string;
  adminId: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const CourseCourseworkForm = ({
  initialData,
  courseId,
  adminId,
}: CourseCourseworkFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  console.log(
    "CourseCourseworkForm initialData.courseworks:",
    initialData.courseworks
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });
  const {
    reset,
    formState: { isSubmitting, isValid },
  } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response: CreateCourseworkResponse = await createCoursework(
        courseId,
        values
      );
      console.log("createCoursework result:", response);
      if (response.success) {
        toast.success(response.message || "Coursework created successfully");
        setIsCreating(false);
        reset({ title: "" });
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Create coursework error:", error);
      toast.error("Unexpected error occurred");
    }
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course Courseworks
        <Button
          onClick={() => setIsCreating(!isCreating)}
          variant="ghost"
          disabled={isSubmitting}
        >
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a Coursework
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g., 'Final Project: Fashion Portfolio'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isValid || isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            "text-sm mt-2",
            !initialData.courseworks.length && "text-slate-500 italic"
          )}
        >
          {!initialData.courseworks.length &&
            "You need at least one coursework to complete this course."}
          <CourseCourseworkList
            onEditAction={async (id) => {
              if (!id) {
                console.error(
                  "Invalid coursework ID passed to onEditAction:",
                  id
                );
                return { success: false, message: "Invalid coursework ID" };
              }
              console.log("Navigating to coursework ID:", id);
              const result = await onEditCourseworkAction(courseId, id);
              console.log("onEditCourseworkAction result:", result);
              if (result.success) {
                router.push(
                  `/admin/create-admin/${adminId}/course/${courseId}/coursework/${id}`
                );
              }
              return result;
            }}
            items={initialData.courseworks || []}
          />
        </div>
      )}
    </div>
  );
};
