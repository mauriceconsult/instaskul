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
import { Tutor } from '@prisma/client';
import { TiptapDescriptionEditor } from "@/components/tiptap-description-editor-core";

interface TutorDescriptionFormProps {
  initialData: Tutor;
  adminId: string;
  courseId: string;
  tutorId: string;
}

const formSchema = z.object({
  description: z.string().min(1, {
    message: "Tutorial description is required.",
  }),
});

export const TutorDescriptionForm = ({
  initialData,
  adminId,
  courseId,
  tutorId,
}: TutorDescriptionFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
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
      await axios.patch(`/api/admins/${adminId}/courses/${courseId}/tutors/${tutorId}/descriptions`, values);
      toast.success("Tutorial updated.");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    }
  };
  
  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Tutorial description*
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit tutorial description
            </>
          )}
        </Button>
      </div>
      
  {!isEditing && (
          <div
            className={cn(
              "text-sm mt-2 prose prose-slate max-w-none",
              !initialData.description && "text-slate-500 italic"
            )}
          >
            {initialData.description ? (
              // Render HTML properly
              <div dangerouslySetInnerHTML={{ __html: initialData.description }} />
            ) : (
              // Placeholder text
              "Briefly describe the tutorial."
            )}
          </div>
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
                    <TiptapDescriptionEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter tutorial description..."
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
