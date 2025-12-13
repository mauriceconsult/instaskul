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
import { CourseNoticeboard, Course } from "@prisma/client";
import { CourseCourseNoticeboardList } from "./course-course-noticeboard-list";
import {
  createCourseNoticeboard,
  onEditCourseNoticeboardAction,
  onReorderCourseNoticeboardAction,
} from "../course-coursenoticeboard/[course-coursenoticeboardId]/actions";

interface CourseCourseNoticeboardFormProps {
  initialData: Course & { courseNoticeboards: CourseNoticeboard[] };
  courseId: string;
  facultyId: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const CourseCourseNoticeboardForm = ({
  initialData,
  courseId,
  facultyId,
}: CourseCourseNoticeboardFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const toggleCreating = () => setIsCreating((current) => !current);
  const router = useRouter();
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
      const { success } = await createCourseNoticeboard(courseId, values);
      if (success) {
        toast.success("Noticeboard created successfully");
        toggleCreating();
        reset({ title: "" });
        router.refresh();
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      console.error("Create noticeboard error:", error);
      toast.error("Unexpected error occurred");
    }
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {isUpdating && (
        <div
          className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Course notice
        <Button
          onClick={toggleCreating}
          variant="ghost"
          disabled={isSubmitting}
        >
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a course notice
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
                      placeholder="e.g., 'Fashion & design course announcements'"
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
            !initialData.courseNoticeboards.length && "text-slate-500 italic"
          )}
        >
          {!initialData.courseNoticeboards.length &&
            "Course notices support the knowledge sharing and learning ecosystem through instant communication between the faculty and the students. Notices are published and unpublished on demand, e.g., to make an urgent announcement or correction, etc."}
          <CourseCourseNoticeboardList
            onEditAction={async (id) => {
              const result = await onEditCourseNoticeboardAction(courseId, id);
              if (result.success) {
                router.push(
                  `/faculty/create-faculty/${facultyId}/course/${courseId}/course-course-noticeboard/${id}`
                );
              } else {
                toast.error(result.message);
              }
              return result;
            }}
            onReorderAction={async (
              updateData: { id: string; position: number }[]
            ) => {
              setIsUpdating(true);
              const noticeboardIds = updateData.map((item) => item.id);
              const result = await onReorderCourseNoticeboardAction(
                courseId,
                noticeboardIds
              );
              setIsUpdating(false);
              if (result.success) {
                toast.success(result.message);
              } else {
                toast.error(result.message);
              }
              router.refresh();
              return result;
            }}
            items={initialData.courseNoticeboards || []}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Drag and drop to reorder the Noticeboards
        </p>
      )}
    </div>
  );
};
