"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function InvitationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على التوكن");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/invitations/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error(`فشل في جلب تفاصيل الدعوة (${res.status})`);

      const json = await res.json();
      if (!json.data) throw new Error("لم يتم العثور على بيانات الدعوة");

      setInvitation(json.data);
    } catch (err: any) {
      console.error("خطأ في تحميل الدعوة:", err);
      toast.error(err?.message || "حدث خطأ في تحميل تفاصيل الدعوة");
    } finally {
      setLoading(false);
    }
  };

  const cancelInvitation = async () => {
    try {
      setCanceling(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على التوكن");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/invitations/${id}/cancel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(`فشل في إلغاء الدعوة (${res.status})`);

      const json = await res.json();
      if (!json.data) throw new Error("لم يتم العثور على بيانات الدعوة بعد الإلغاء");

      setInvitation(json.data);
      toast.success("تم إلغاء الدعوة بنجاح ✨");

      setTimeout(() => router.push("/invitations"), 1500);
    } catch (err: any) {
      console.error("خطأ في إلغاء الدعوة:", err);
      toast.error(err?.message || "حدث خطأ في إلغاء الدعوة");
    } finally {
      setCanceling(false);
    }
  };

  useEffect(() => {
    if (id) fetchInvitation();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-700 dark:text-gray-300">
        جاري التحميل...
      </div>
    );

  if (!invitation)
    return (
      <div className="p-6 text-center text-red-500 dark:text-red-400">
        لم يتم العثور على الدعوة
      </div>
    );

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="shadow-lg rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              تفاصيل الدعوة
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              عرض بيانات الدعوة والتحكم في حالتها
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/invitations")}
          >
            رجوع للقائمة
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {invitation.email}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              الحالة:{" "}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  invitation.status === "accepted"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : invitation.status === "pending"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                    : invitation.status === "canceled"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {invitation.status}
              </span>
            </p>
          </div>

          <div className="border dark:border-gray-700 p-4 rounded-lg space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>المجمع:</strong>{" "}
              {invitation.residential_complex?.name || "-"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>تاريخ الإنشاء:</strong>{" "}
              {new Date(invitation.created_at).toLocaleString("ar-EG")}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>ينتهي في:</strong>{" "}
              {new Date(invitation.expires_at).toLocaleString("ar-EG")}
            </p>
          </div>

          {invitation.status !== "canceled" && (
            <Button
              variant="destructive"
              onClick={cancelInvitation}
              disabled={canceling}
              className="w-full sm:w-auto"
            >
              {canceling ? "جاري الإلغاء..." : "إلغاء الدعوة"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
