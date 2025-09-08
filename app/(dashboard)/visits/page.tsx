"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SlidersHorizontal, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type VisitStatus = "pending" | "accepted" | "rejected";

interface VisitRequest {
  id: number;
  visiter_name: string;
  visiter_phone: string;
  visit_date: string;
  visit_time: string;
  status: VisitStatus;
  description?: string;
  user?: { id: number; name: string };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function VisitRequestsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على رمز الدخول");

      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/visit-requests?page=${page}&per_page=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("حدث خطأ أثناء تحميل طلبات الزيارة");

      const json = await res.json();
      setVisits(json.data.visit_requests);
      setTotalPages(json.data.meta.total_pages);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "حدث خطأ غير متوقع أثناء تحميل طلبات الزيارة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [page]);

  const getStatusLabel = (status: VisitStatus) => {
    switch (status) {
      case "accepted":
        return { label: "مقبول", color: "bg-green-50 text-green-700 border-green-300 dark:bg-green-800 dark:text-green-300 dark:border-green-600" };
      case "rejected":
        return { label: "مرفوض", color: "bg-red-50 text-red-700 border-red-300 dark:bg-red-800 dark:text-red-300 dark:border-red-600" };
      default:
        return { label: "قيد الانتظار", color: "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-300 dark:border-yellow-600" };
    }
  };

  return (
    <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <CardHeader className="flex flex-col items-start gap-1 p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            إدارة طلبات الزيارة
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            جميع طلبات الزيارة المقدمة من السكان
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {/* Search & Filter */}
          <div className="flex items-center justify-between mb-4 gap-4">
            <Button variant="outline" className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
              <SlidersHorizontal className="w-4 h-4" />
              تصفية
            </Button>
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث"
                className="pr-10 pl-4 py-2 w-full border-gray-300 rounded-lg text-right dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                dir="rtl"
              />
            </div>
          </div>

          {/* Table */}
          <Table className="dark:text-gray-200">
            <TableHeader>
              <TableRow className="bg-gray-50 text-sm font-semibold dark:bg-gray-700 dark:text-gray-200">
                <TableHead className="text-center text-gray-700 dark:text-gray-200 w-[60px]">#</TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-200">الزائر</TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">رقم الهاتف</TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">الساكن</TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">التاريخ</TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">الوقت</TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">الحالة</TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    جارٍ التحميل...
                  </TableCell>
                </TableRow>
              ) : visits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    لا توجد طلبات زيارة
                  </TableCell>
                </TableRow>
              ) : (
                visits.map((visit) => {
                  const status = getStatusLabel(visit.status);
                  return (
                    <TableRow key={visit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <TableCell className="text-center font-semibold" onClick={() => router.push(`${pathname}/${visit.id}`)}>{visit.id}</TableCell>
                      <TableCell className="text-right" onClick={() => router.push(`${pathname}/${visit.id}`)}>{visit.visiter_name}</TableCell>
                      <TableCell className="text-center">{visit.visiter_phone}</TableCell>
                      <TableCell className="text-center">{visit.user?.name || "-"}</TableCell>
                      <TableCell className="text-center">{visit.visit_date}</TableCell>
                      <TableCell className="text-center">{visit.visit_time}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700 border-gray-300 bg-white hover:bg-gray-50 dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                          onClick={() => router.push(`${pathname}/${visit.id}`)}
                        >
                          معاينة
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span>الصفحة {page} من {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => page > 1 && setPage(page - 1)} disabled={page === 1}>
                السابق
              </Button>
              <Button variant="outline" size="sm" onClick={() => page < totalPages && setPage(page + 1)} disabled={page === totalPages}>
                التالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
