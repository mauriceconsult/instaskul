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
import { Assignment } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { TutorAssignmentsList } from "./tutor-assignments-list";

interface TutorAssignmentsFormProps {
  initialData: { assignments: Assignment[] };
  adminId: string;
  courseId: string;
  tutorId: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const TutorAssignmentsForm = ({
  initialData,
  adminId,
  courseId,
  tutorId,
}: TutorAssignmentsFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const toggleCreating = () => setIsCreating((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/admins/${adminId}/courses/${courseId}/tutors/${tutorId}/assignments`, values);
      toast.success("Assignment created");
      toggleCreating();
      router.refresh(); 
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium text-sm flex items-center justify-between">
        Tutorial assignments (at least one required)*
        <Button onClick={toggleCreating} variant="ghost">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an assignment
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
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g., 'Level 1 Biology, Term 1: Lesson 1 of 5 assignment'"
                      {...field}
                    />
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
        <div className={cn("text-sm mt-2", !initialData.assignments.length && "text-slate-500 italic")}>
          {!initialData.assignments.length && "No assignments"}
          <TutorAssignmentsList items={initialData.assignments || []} tutorId={tutorId} adminId={adminId} courseId={courseId} />
        </div>
      )}

      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Drag and drop to reorder the assignments
        </p>
      )}
    </div>
  );
};