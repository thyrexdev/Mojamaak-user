"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, SlidersHorizontal, Check, X, RotateCcw } from "lucide-react";

type Req = {
  id: number;
  title: string;
  description: string | null;
  status: "waiting" | "confirmed" | "in_progress" | "rejected" | "completed";
  created_at: string;
  complex?: {
    building?: { apartment?: { number?: string | null } | null } | null;
  } | null;
  maintenance_department?: { id: number; name: string } | null;
  maintenance_company?: { id: number; name: string } | null;
};

const statusLabel = (s: Req["status"]) =>
  s === "waiting"
    ? "قيد المعالجة"
    : s === "confirmed"
    ? "مقبول"
    : s === "in_progress"
    ? "قيد التنفيذ"
    : s === "completed"
    ? "مكتمل"
    : "مرفوض";

const statusBadge = (s: Req["status"]) =>
  s === "confirmed" || s === "completed"
    ? "bg-green-50 text-green-700 border-green-300"
    : s === "rejected"
    ? "bg-red-50 text-red-700 border-red-300"
    : "bg-yellow-50 text-yellow-700 border-yellow-300";

export default function MaintenanceRequestsPage() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("لم يتم العثور على التوكن");

        const res = await fetch(
          "/api/dashboard/complex-admin/maintenance-requests?per_page=10&page=1",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`فشل في جلب طلبات الصيانة (${res.status})`);
        }

        const data = await res.json();
        setRequests(data?.data?.maintenance_requests ?? []);
      } catch (err: any) {
        console.error("Fetch error:", err);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: err?.message || "حدث خطأ في جلب طلبات الصيانة"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRowClick = (reqId: number) => {
    // ينقل على صفحة التفاصيل الخاصة بالـ id
    router.push(`/maintenance-requests/${reqId}`);
  };

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              طلبات الصيانة
            </CardTitle>
            <p className="text-sm text-gray-500">
              جميع الطلبات المقدمة من السكان.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300 text-gray-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              تصفية
            </Button>
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث"
                className="pr-10 pl-4 py-2 w-full border-gray-300 rounded-lg text-right"
                dir="rtl"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center py-10">جارٍ التحميل...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 text-sm font-semibold">
                  <TableHead className="text-center w-[40px]">#</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-center">الشقة</TableHead>
                  <TableHead className="text-center">التاريخ</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">الشركة</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {requests.map((req, index) => {
                  const apt = req?.complex?.building?.apartment?.number ?? "-";
                  const created = req?.created_at
                    ? new Date(req.created_at).toISOString().slice(0, 10)
                    : "-";

                  return (
                    <TableRow
                      key={req.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(req.id)}
                    >
                      <TableCell className="text-center font-semibold">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-right">
                        {req.maintenance_department?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-right">{req.title}</TableCell>
                      <TableCell className="text-right">
                        {req.description || "—"}
                      </TableCell>
                      <TableCell className="text-center">{apt}</TableCell>
                      <TableCell className="text-center">{created}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(
                            req.status
                          )}`}
                        >
                          {statusLabel(req.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {req.maintenance_company?.name ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
