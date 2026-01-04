"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface AdminActionsProps {
  disabled: boolean;
  adminId: string;
  isPublished: boolean;
}

export const AdminActions = ({ 
  disabled, 
  adminId, 
  isPublished 
}: AdminActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      
      if (isPublished) {
        await axios.patch(`/api/admins/${adminId}/unpublish`);
        toast.success("Admin unpublished");
      } else {
        await axios.patch(`/api/admins/${adminId}/publish`);
        toast.success("Admin published");
      }
      
      // Force a hard refresh to see changes
      router.refresh();
      
      // Optional: Add a small delay then refresh again to ensure data is loaded
      setTimeout(() => {
        router.refresh();
      }, 100);
      
    } catch (error: any) {
      console.error("Publish error:", error);
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/admins/${adminId}`);
      toast.success("Admin deleted");
      router.push(`/dashboard/admins`);
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};