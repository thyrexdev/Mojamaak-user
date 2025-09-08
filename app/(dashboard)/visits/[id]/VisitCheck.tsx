"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type VisitStatus = "pending" | "accepted" | "rejected";

type VisitRequest = {
  id: number;
  visiter_name: string;
  visiter_phone: string;
  visit_date: string;
  visit_time: string;
  description?: string;
  status: VisitStatus;
  user?: { id: number; name: string };
};

export default function VisitRequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [visit, setVisit] = useState<VisitRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVisitDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على رمز الدخول");

      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/visit-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("فشل في تحميل تفاصيل الزيارة");

      const json = await res.json();
      setVisit(json.data);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "حدث خطأ غير متوقع أثناء تحميل تفاصيل الزيارة");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: VisitStatus) => {
    if (!visit) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على رمز الدخول");

      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/visit-requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("فشل في تحديث حالة الطلب");

      setVisit({ ...visit, status: newStatus });
      toast.success(`تم ${newStatus === "accepted" ? "قبول" : "رفض"} طلب الزيارة بنجاح`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "حدث خطأ أثناء تحديث الحالة");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchVisitDetails();
  }, [id]);

  if (loading) return <p className="text-center mt-8 text-gray-500 dark:text-gray-400">جاري تحميل التفاصيل...</p>;
  if (!visit) return <p className="text-center mt-8 text-red-500 dark:text-red-400">لم يتم العثور على الطلب</p>;

  const getStatusLabel = (status: VisitStatus) =>
    status === "accepted" ? "مقبول" : status === "rejected" ? "مرفوض" : "قيد المعالجة";

  const getBadgeVariant = (status: VisitStatus) =>
    status === "accepted" ? "default" : status === "rejected" ? "destructive" : "outline";

  return (
    <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 shadow-md max-w-3xl mx-auto rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            تفاصيل طلب الزيارة رقم {visit.id}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-right">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">اسم الزائر</p>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">{visit.visiter_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">هاتف الزائر</p>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">{visit.visiter_phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ الزيارة</p>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">{visit.visit_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">الوقت</p>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">{visit.visit_time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">اسم الساكن</p>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">{visit.user?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">حالة الطلب</p>
              <Badge variant={getBadgeVariant(visit.status)} className="capitalize">{getStatusLabel(visit.status)}</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1 dark:text-gray-400">وصف الطلب</p>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded-md border dark:border-gray-600">
              {visit.description || "لا يوجد وصف"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
            <Button variant="outline" onClick={() => router.back()} disabled={actionLoading}>
              الرجوع
            </Button>
            <Button
              variant="destructive"
              onClick={() => updateStatus("rejected")}
              disabled={visit.status === "rejected" || actionLoading}
              className={actionLoading ? "opacity-70 cursor-not-allowed" : ""}
            >
              {actionLoading && visit.status !== "rejected" ? "جارٍ المعالجة..." : "رفض الطلب"}
            </Button>
            <Button
              variant="default"
              onClick={() => updateStatus("accepted")}
              disabled={visit.status === "accepted" || actionLoading}
              className={`bg-green-600 hover:bg-green-700 text-white ${actionLoading && visit.status !== "accepted" ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {actionLoading && visit.status !== "accepted" ? "جارٍ المعالجة..." : "قبول الطلب"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
