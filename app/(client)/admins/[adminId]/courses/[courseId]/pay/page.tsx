import { processPayment } from "./actions";
import { currentUser } from "@clerk/nextjs/server";

export default async function PayPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await currentUser();

  if (!user || !user.id) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment for Course</h1>
      <form
        action={async (formData: FormData) => {
          "use server";
          const msisdn = formData.get("msisdn") as string;
          const enrolleeUserId = formData.get("enrolleeUserId") as string;
          const result = await processPayment(
            courseId,
            msisdn,
            enrolleeUserId || undefined
          );
          if (result.success) {
            console.log(
              `[PAYMENT_SUCCESS] Payment processed for course ${courseId}`
            );
            // Redirect or show success message
          } else {
            console.error(`[PAYMENT_FAILED] ${result.error}`);
            // Show error message
          }
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="msisdn" className="block text-sm font-medium">
            MSISDN (12 digits)
          </label>
          <input
            type="text"
            name="msisdn"
            id="msisdn"
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="256123456789"
            required
          />
        </div>
        <div>
          <label htmlFor="enrolleeUserId" className="block text-sm font-medium">
            Enrollee User ID (optional, leave blank if paying for yourself)
          </label>
          <input
            type="text"
            name="enrolleeUserId"
            id="enrolleeUserId"
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="Enter user ID of enrollee"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Pay Now
        </button>
      </form>
    </div>
  );
}
