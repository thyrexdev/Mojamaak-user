"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ✅ Schema للتحقق من البيانات
const formSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
});

type FormData = z.infer<typeof formSchema>;

export default function LinkComplexAdminPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/complex-admins/link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const json = await res.json();
      if (res.ok) {
        toast.success("تم إرسال الدعوة بنجاح ✨");
        reset();
      } else {
        toast.error(json.message || "حدث خطأ غير متوقع");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    }
  };

  return (
    <div className="p-6 font-arabic min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950" dir="rtl">
      <Card className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl max-w-lg w-full border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ربط إداري جديد
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            أدخل البريد الإلكتروني لإرسال دعوة ربط إداري جديد بالمجمع.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                {...register("email")}
                className="text-right dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                dir="rtl"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="dark:border-gray-700"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإرسال..." : "إرسال الدعوة"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
