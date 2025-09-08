"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VisitRequestsPage() {
  const { id } = useParams();
  const [requests, setRequests] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchRequests = async (page: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على رمز الدخول");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/users/${id}/visit-requests?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("فشل في تحميل طلبات الزيارة");

      const json = await res.json();
      setRequests(json.data.visit_requests);
      setMeta(json.data.meta);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "حدث خطأ أثناء تحميل طلبات الزيارة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRequests(page);
  }, [id, page]);

  const handlePageChange = (newPage: number) => {
    setBtnLoading(true);
    setPage(newPage);
    setBtnLoading(false);
  };

  if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">جاري التحميل...</div>;

  return (
    <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            طلبات الزيارة للمستخدم #{id}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {requests.length > 0 ? (
            <>
              <Table className="dark:divide-gray-700">
                <TableHeader>
                  <TableRow className="bg-gray-50 text-sm dark:bg-gray-700">
                    <TableHead className="text-right text-gray-700 dark:text-gray-200">اسم الزائر</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-200">الهاتف</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-200">التاريخ</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-200">الوقت</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-200">الحالة</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {requests.map((req) => (
                    <TableRow
                      key={req.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <TableCell className="text-right">{req.visiter_name}</TableCell>
                      <TableCell className="text-right">{req.visiter_phone}</TableCell>
                      <TableCell className="text-right">{new Date(req.visit_date).toLocaleDateString("ar-EG")}</TableCell>
                      <TableCell className="text-right">{req.visit_time}</TableCell>
                      <TableCell className="text-right">
                        {req.status === "pending" && "🟡 قيد الانتظار"}
                        {req.status === "approved" && "🟢 مقبول"}
                        {req.status === "rejected" && "🔴 مرفوض"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>الصفحة {meta.current_page} من {meta.total_pages}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={!meta.prev_page_url || btnLoading}
                    >
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!meta.next_page_url || btnLoading}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">لا توجد طلبات زيارة لهذا المستخدم.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
