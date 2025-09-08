"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

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
    ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-800 dark:text-green-300 dark:border-green-600"
    : s === "rejected"
    ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-800 dark:text-red-300 dark:border-red-600"
    : "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-300 dark:border-yellow-600";

export default function MaintenanceRequestsPage() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("لم يتم العثور على التوكن");

        const res = await fetch(
          "/api/dashboard/complex-admin/maintenance-requests?per_page=10&page=1",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error(`فشل في جلب طلبات الصيانة (${res.status})`);
        }

        const data = await res.json();
        setRequests(data?.data?.maintenance_requests ?? []);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "حدث خطأ في جلب طلبات الصيانة");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRowClick = (reqId: number) => {
    router.push(`/maintenance-requests/${reqId}`);
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.maintenance_department?.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      req.maintenance_company?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div
      className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen"
      dir="rtl"
    >
      <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              طلبات الصيانة
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              جميع الطلبات المقدمة من السكان.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              تصفية
            </Button>
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث"
                className="pr-10 pl-4 py-2 w-full border-gray-300 rounded-lg text-right dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                dir="rtl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center py-10">جارٍ التحميل...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="text-center py-10 text-gray-500 dark:text-gray-400">
              لا توجد طلبات صيانة حاليا
            </p>
          ) : (
            <Table className="dark:text-gray-200">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700 text-sm font-semibold">
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
                {filteredRequests.map((req, index) => {
                  const apt = req?.complex?.building?.apartment?.number ?? "-";
                  const created = req?.created_at
                    ? new Date(req.created_at).toISOString().slice(0, 10)
                    : "-";

                  return (
                    <TableRow
                      key={req.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
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
