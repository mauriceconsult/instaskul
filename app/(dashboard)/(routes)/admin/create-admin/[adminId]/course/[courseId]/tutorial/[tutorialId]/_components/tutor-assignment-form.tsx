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
import { Assignment, Tutor } from "@prisma/client";
import { TutorAssignmentList } from "./tutor-assignment-list";
import {
  createAssignment,
  onEditAction,
} from "../assignment/[assignmentId]/actions";

interface CreateAssignmentResponse {
  success: boolean;
  message: string;
  data?: Assignment;
}

interface TutorAssignmentFormProps {
  initialData: Tutor & { assignments: Assignment[] };
  courseId: string;
  adminId: string;
  tutorialId: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const TutorAssignmentForm = ({
  initialData,
  courseId,
  adminId,
  tutorialId,
}: TutorAssignmentFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  console.log(
    "TutorAssignmentForm initialData.assignments:",
    initialData.assignments
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
      console.log("Creating assignment with:", {
        tutorialId,
        values,
        adminId,
        courseId,
      });
      const response: CreateAssignmentResponse = await createAssignment(
        tutorialId,
        values,
        adminId,
        courseId
      );
      console.log("Create assignment result:", response);
      if (response.success) {
        toast.success(response.message);
        setIsCreating(false);
        reset({ title: "" });
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.refresh();
        console.log("Triggered router.refresh after create");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Create assignment error:", error);
      toast.error("Unexpected error occurred");
    }
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Tutorial Assignments
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
              Add an Assignment
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
                      placeholder="e.g., 'Principles of Fashion Design: Assignment 1'"
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
            !initialData.assignments.length && "text-slate-500 italic"
          )}
        >
          {!initialData.assignments.length &&
            "You need at least one published assignment to complete this tutorial."}
          <TutorAssignmentList
            onEditAction={async (id) => {
              if (!id) {
                console.error("Invalid assignment ID:", id);
                return { success: false, message: "Invalid assignment ID" };
              }
              if (!adminId || !courseId || !tutorialId) {
                console.error("Invalid navigation params:", {
                  adminId,
                  courseId,
                  tutorialId,
                });
                return {
                  success: false,
                  message: "Invalid navigation parameters",
                };
              }
              console.log("Navigating to assignment page:", {
                adminId,
                courseId,
                tutorialId,
                assignmentId: id,
              });
              const result = await onEditAction(
                tutorialId,
                id,
                adminId,
                courseId
              );
              console.log("Edit action result:", result);
              if (result.success) {
                router.push(
                  `/admin/create-admin/${adminId}/course/${courseId}/tutorial/${tutorialId}/assignment/${id}`
                );
              }
              return result;
            }}
            items={initialData.assignments || []}
          />
        </div>
      )}
    </div>
  );
};
