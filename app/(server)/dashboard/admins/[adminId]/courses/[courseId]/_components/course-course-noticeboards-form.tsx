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
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CourseNoticeboard } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { CourseCourseNoticeboardsList } from "./course-course-noticeboard-list";


interface CourseCourseNoticeboardsFormProps {
  initialData: { courseNoticeboards: CourseNoticeboard[] };
  adminId: string;
  courseId: string; 
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const CourseCourseNoticeboardsForm = ({
  initialData,
  adminId,
  courseId,
}: CourseCourseNoticeboardsFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const toggleCreating = () => setIsCreating((current) => !current);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/admins/${adminId}/courses/${courseId}/coursenoticeboards`, values);
      toast.success("Course notice created.");
      toggleCreating();
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    }
  }; 

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">  
      
      <div className="font-medium flex items-center justify-between">
        Course notices
        <Button onClick={toggleCreating} variant="ghost">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input disabled={isSubmitting} placeholder="e.g., 'new course tutorial uploaded'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isValid || isSubmitting} type="submit">
              Create
            </Button>
          </form>
        </Form>
      )}

      {!isCreating && (
        <div className={cn("text-sm mt-2", !initialData.courseNoticeboards.length && "text-slate-500 italic")}>
          {!initialData.courseNoticeboards.length && "No course notices"}
          <CourseCourseNoticeboardsList items={initialData.courseNoticeboards || []} courseId={courseId} adminId={adminId} />
        </div>
      )}

      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Drag and drop to reorder the course notices
        </p>
      )}
    </div>
  );
};