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
import { Textarea } from "@/components/ui/textarea";
import { CourseNoticeboard } from "@prisma/client";

interface CourseCourseNoticeboardDescriptionProps {
  initialData: CourseNoticeboard;
  adminId: string;
  courseId: string;
  courseCoursenoticeboardId: string; // Keep camelCase for prop
}

const formSchema = z.object({
  description: z.string().min(1, {
    message: "Course Notice description is required.",
  }),
});

export const CourseCourseNoticeboardDescriptionForm = ({
  initialData,
  adminId,
  courseId,
  courseCoursenoticeboardId,
}: CourseCourseNoticeboardDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  console.log("courseCoursenoticeboardId:", courseCoursenoticeboardId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (
        !courseCoursenoticeboardId ||
        courseCoursenoticeboardId === "undefined"
      ) {
        toast.error(`Invalid noticeboard ID: ${courseCoursenoticeboardId}`);
        console.error(
          "Invalid courseCoursenoticeboardId:",
          courseCoursenoticeboardId
        );
        return;
      }

      await axios.patch(
        `/api/create-admin/${adminId}/courses/${courseId}/course-coursenoticeboards/${courseCoursenoticeboardId}/descriptions`,
        values
      );
      toast.success("Course Notice description updated.");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong.");
      console.error("Error updating noticeboard:", error);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Description*
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Course notice description
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.description && "text-slate-500 italic"
          )}
        >
          {initialData.description || "Enter your text."}
        </p>
      )}
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
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="e.g., 'You are required to...'"
                      {...field}
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
