'use client';

import axios, { type AxiosResponse, AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatAmountWithAccounting } from '@/lib/format';

interface CourseAmountFormProps {
  initialData: { amount: string | null }; // Accept string | null
  adminId: string;
  courseId: string;
}

export const CourseAmountForm = ({
    initialData,
    adminId,
    courseId,
}: CourseAmountFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState<string | undefined>(
        initialData.amount != null ? String(initialData.amount) : undefined
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    console.log(`[${new Date().toISOString()} CourseAmountForm] Loaded version 2025-07-17-no-any`);

    const router = useRouter();

    const toggleEdit = () => {
        setIsEditing((current) => {
            console.log(
                `[${new Date().toISOString()} CourseAmountForm] Toggling isEditing to:`,
                !current
            );
            return !current;
        });
    };

    const handleReset = () => {
        const resetValue = initialData.amount != null ? String(initialData.amount) : undefined;
        console.log(
            `[${new Date().toISOString()} CourseAmountForm] Resetting form with amount:`,
            resetValue,
            'isEditing before reset:',
            isEditing
        );
        setAmount(resetValue);
        toggleEdit();
    };

    const isValid = () => {
        if (amount === undefined || amount === '') return true;
        const numericAmount = Number(amount);
        return !isNaN(numericAmount) && numericAmount >= 0;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid()) {
            toast.error('Amount must be a valid number greater than or equal to 0');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                amount: amount != null ? String(Number(amount)) : null,
            };
            console.log(
                `[${new Date().toISOString()} CourseAmountForm] Submitting payload:`,
                payload,
                { adminId, courseId }
            );
            const response: AxiosResponse = await axios.patch(
                `/api/create-admins/${adminId}/courses/${courseId}/amounts`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (response.status !== 200) {
                throw new Error(
                    response.data?.message || 'Failed to update course amount'
                );
            }
            toast.success('Amount updated.');
            toggleEdit();
            router.refresh();
            console.log(
                `[${new Date().toISOString()} CourseAmountForm] Submission successful, response:`,
                response.data
            );
        } catch (error) {
            console.error(
                `[${new Date().toISOString()} CourseAmountForm] Update course amount error:`,
                error
            );
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error(
                `[${new Date().toISOString()} CourseAmountForm] Response data:`,
                axiosError.response?.data
            );
            if (axiosError.response?.status === 401) {
                toast.error('Unauthorized: Please log in again');
            } else if (axiosError.response?.status === 404) {
                toast.error('Course or admin not found');
            } else if (axiosError.response?.status === 500) {
                toast.error('Server error: Please check server logs or try again later');
            } else {
                toast.error(
                    axiosError.response?.data?.message ||
                        axiosError.message ||
                        'Something went wrong'
                );
            }
        } finally {
            setIsSubmitting(false);
            console.log(
                `[${new Date().toISOString()} CourseAmountForm] Submission completed, isSubmitting:`,
                isSubmitting
            );
        }
    };

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
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
                Course amount*
                <Button
                    onClick={handleReset}
                    variant="default"
                    disabled={isSubmitting}
                    aria-label={isEditing ? 'Cancel editing amount' : 'Edit course amount'}
                >
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit amount
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <p
                    className={cn(
                        'text-sm mt-2',
                        initialData.amount == null && 'text-slate-500 italic'
                    )}
                >
                    {initialData.amount != null
                        ? formatAmountWithAccounting(initialData.amount)
                        : 'Set a price for your Course here.'}
                </p>
            )}
            {isEditing && (
                <form onSubmit={onSubmit} className="space-y-4 mt-4">
                    <div>
                        <label htmlFor="amount" className="text-sm font-medium">
                            Amount (UGX)
                        </label>
                        <input
                            id="amount"
                            type="number"
                            step="0.01"
                            disabled={isSubmitting}
                            placeholder="Set an amount for your course (e.g., 99.99)"
                            value={amount ?? ''}
                            onChange={(e) => {
                                console.log(
                                    `[${new Date().toISOString()} CourseAmountForm] Input onChange:`,
                                    e.target.value
                                );
                                setAmount(e.target.value);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        {!isValid() && (
                            <p className="text-red-600 text-sm mt-1">
                                Amount must be a valid number greater than or equal to 0
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-x-2">
                        <Button
                            disabled={!isValid() || isSubmitting}
                            type="submit"
                            aria-label="Save course amount"
                        >
                            Save
                        </Button>
                    </div>
                    <p>
                        Formatted Form Value:{' '}
                        {formatAmountWithAccounting(amount != null ? Number(amount) : 0)}
                    </p>
                </form>
            )}
        </div>
    );
};
