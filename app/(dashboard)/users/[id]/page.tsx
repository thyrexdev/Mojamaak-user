"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على رمز الدخول");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("فشل في تحميل بيانات المستخدم");

      const json = await res.json();
      setUser(json.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "حدث خطأ أثناء تحميل بيانات المستخدم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const handleNavigate = (path: string) => {
    setBtnLoading(true);
    router.push(`${pathname}/${path}`);
    setBtnLoading(false);
  };

  if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">جاري التحميل...</div>;
  if (!user) return <div className="p-6 text-center text-red-500">لم يتم العثور على المستخدم</div>;

  return (
    <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen" dir="rtl">
      {/* User Info */}
      <Card className="bg-white dark:bg-gray-800 shadow-md mb-6 rounded-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              بيانات المستخدم
            </CardTitle>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="default"
              className="flex items-center gap-1"
              onClick={() => handleNavigate("maintenanceRequests")}
              disabled={btnLoading}
            >
              <Plus className="w-4 h-4" /> طلبات الصيانة
            </Button>
            <Button
              variant="default"
              className="flex items-center gap-1"
              onClick={() => handleNavigate("visitRequests")}
              disabled={btnLoading}
            >
              <Plus className="w-4 h-4" /> طلبات الزيارة
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="font-medium">الاسم:</span> {user.name}
          </p>
          <p>
            <span className="font-medium">البريد الإلكتروني:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">رقم الهاتف:</span> {user.phone}
          </p>
          <p>
            <span className="font-medium">تم التحقق من الهاتف:</span>{" "}
            {user.phone_verified_at ? "✅ نعم" : "❌ لا"}
          </p>
          <p>
            <span className="font-medium">تاريخ الإنشاء:</span>{" "}
            {new Date(user.created_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* User Apartments */}
      <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            الوحدات المرتبطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.apartments && user.apartments.length > 0 ? (
            <Table className="dark:divide-gray-700">
              <TableHeader>
                <TableRow className="bg-gray-50 text-sm dark:bg-gray-700">
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">رقم الوحدة</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">الدور</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">النوع</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">السعر</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">العنوان</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">متاح؟</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.apartments.map((apt: any) => (
                  <TableRow
                    key={apt.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <TableCell className="text-right">{apt.number}</TableCell>
                    <TableCell className="text-right">{apt.floor_number}</TableCell>
                    <TableCell className="text-right">{apt.listing_type === "rent" ? "إيجار" : "تمليك"}</TableCell>
                    <TableCell className="text-right">{apt.price} ج.م</TableCell>
                    <TableCell className="text-right">{apt.building?.address}</TableCell>
                    <TableCell className="text-right">{apt.is_available ? "✅ متاح" : "❌ غير متاح"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">لا توجد وحدات مرتبطة بهذا المستخدم.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
