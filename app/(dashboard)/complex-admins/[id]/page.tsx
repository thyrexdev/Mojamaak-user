"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";

export default function ComplexAdminDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState(false);

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/complex-admins/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("فشل في تحميل بيانات الإداري");
      const json = await res.json();
      setAdmin(json.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "حدث خطأ في تحميل بيانات الإداري");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    try {
      setUnlinking(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/complex-admins/${id}/unlink`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      const json = await res.json();
      if (json.code === 200) {
        toast.success("تم إلغاء ربط الإداري بنجاح");
        await fetchAdmin();
      } else {
        toast.error(json.message || "فشل في إلغاء الربط");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إلغاء الربط");
    } finally {
      setUnlinking(false);
    }
  };

  useEffect(() => {
    if (id) fetchAdmin();
  }, [id]);

  if (loading)
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">جاري التحميل...</div>;
  if (!admin)
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">لم يتم العثور على الإداري</div>;

  return (
    <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              تفاصيل الإداري
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              عرض بيانات الإداري والمجمع المرتبط به.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            رجوع للقائمة
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-6">
          {/* بيانات الإداري */}
          <div className="space-y-1">
            <h2 className="text-lg font-bold">{admin.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{admin.email}</p>
          </div>

          {/* بيانات المجمع + زرار إلغاء الربط */}
          {admin.residential_complex ? (
            <div className="flex flex-col md:flex-row items-center justify-between border p-4 rounded-lg dark:border-gray-700 dark:bg-gray-700 gap-4">
              <div className="flex items-center gap-4">
                {admin.residential_complex.logo && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${admin.residential_complex.logo}`}
                    alt={admin.residential_complex.name}
                    width={80}
                    height={80}
                    className="rounded-md border dark:border-gray-600"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{admin.residential_complex.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {admin.residential_complex.description}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                disabled={unlinking}
                onClick={handleUnlink}
              >
                {unlinking ? "جاري إلغاء الربط..." : "إلغاء الربط"}
              </Button>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">غير مربوط بأي مجمع حاليًا.</p>
          )}

          {/* Metadata */}
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>تم الإنشاء: {new Date(admin.created_at).toLocaleString("ar-EG")}</p>
            <p>آخر تحديث: {new Date(admin.updated_at).toLocaleString("ar-EG")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
