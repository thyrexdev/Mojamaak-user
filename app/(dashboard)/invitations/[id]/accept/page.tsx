"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// ✅ Validation Schema
const schema = z.object({
  token: z.string().min(1, "الرمز مطلوب"),
  name: z.string().min(1, "الاسم مطلوب"),
  password: z
    .string()
    .min(8, "يجب أن تكون كلمة المرور 8 أحرف على الأقل"),
  passwordConfirmation: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.password === data.passwordConfirmation, {
  path: ["passwordConfirmation"],
  message: "كلمة المرور غير متطابقة",
});

type FormData = z.infer<typeof schema>;

export default function AcceptInvitationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LOCAL}/api/invite/accept/${data.token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            password: data.password,
            password_confirmation: data.passwordConfirmation,
          }),
        }
      );

      if (!res.ok) throw new Error(`فشل في قبول الدعوة (${res.status})`);

      const response = await res.json();
      if (response.error) throw new Error(response.error);

      toast.success("تم قبول الدعوة بنجاح ✨");
      setTimeout(() => router.push("/invitations"), 1500);

    } catch (error: any) {
      toast.error(error?.message || "حدث خطأ أثناء قبول الدعوة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
            قبول الدعوة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                الرمز
              </label>
              <Input
                placeholder="أدخل رمز الدعوة"
                {...register("token")}
                className="mt-1"
              />
              {errors.token && (
                <p className="text-red-500 text-sm mt-1">{errors.token.message}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                الاسم
              </label>
              <Input
                placeholder="أدخل اسمك"
                {...register("name")}
                className="mt-1"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                كلمة المرور
              </label>
              <Input
                type="password"
                placeholder="أدخل كلمة المرور"
                {...register("password")}
                className="mt-1"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Password Confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                تأكيد كلمة المرور
              </label>
              <Input
                type="password"
                placeholder="أعد إدخال كلمة المرور"
                {...register("passwordConfirmation")}
                className="mt-1"
              />
              {errors.passwordConfirmation && (
                <p className="text-red-500 text-sm mt-1">{errors.passwordConfirmation.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/invitations")}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? "جاري المعالجة..." : "قبول الدعوة"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
