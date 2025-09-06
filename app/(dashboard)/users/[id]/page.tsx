"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setUser(json.data);
    } catch (err) {
      console.error("خطأ في تحميل المستخدم:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  if (loading) return <div className="p-6">جاري التحميل...</div>;
  if (!user) return <div className="p-6">لم يتم العثور على المستخدم</div>;

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm mb-6">
        <CardHeader>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              بيانات المستخدم
            </CardTitle>
          </div>
          <Button
            className="text-white bg-primary hover:bg-primary/90"
            onClick={() => router.push(`${pathname}/maintenanceRequests`)}
          >
            <Plus className="w-4 h-4 ml-2" />
            طلبات الصيانة
          </Button>
          <Button
            className="text-white bg-primary hover:bg-primary/90"
            onClick={() => router.push(`${pathname}/visitRequests`)}
          >
            <Plus className="w-4 h-4 ml-2" />
            طلبات الزيارة
          </Button>
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

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            الوحدات المرتبطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.apartments && user.apartments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 text-sm">
                  <TableHead className="text-right text-gray-700">
                    رقم الوحدة
                  </TableHead>
                  <TableHead className="text-right text-gray-700">
                    الدور
                  </TableHead>
                  <TableHead className="text-right text-gray-700">
                    النوع
                  </TableHead>
                  <TableHead className="text-right text-gray-700">
                    السعر
                  </TableHead>
                  <TableHead className="text-right text-gray-700">
                    العنوان
                  </TableHead>
                  <TableHead className="text-right text-gray-700">
                    متاح؟
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.apartments.map((apt: any) => (
                  <TableRow key={apt.id}>
                    <TableCell className="text-right">{apt.number}</TableCell>
                    <TableCell className="text-right">
                      {apt.floor_number}
                    </TableCell>
                    <TableCell className="text-right">
                      {apt.listing_type === "rent" ? "إيجار" : "تمليك"}
                    </TableCell>
                    <TableCell className="text-right">
                      {apt.price} ج.م
                    </TableCell>
                    <TableCell className="text-right">
                      {apt.building?.address}
                    </TableCell>
                    <TableCell className="text-right">
                      {apt.is_available ? "✅ متاح" : "❌ غير متاح"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500">لا توجد وحدات مرتبطة بهذا المستخدم.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
