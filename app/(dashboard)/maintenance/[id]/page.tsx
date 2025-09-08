"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ReqDetail = {
  id: number;
  title: string;
  description: string | null;
  status: "waiting" | "confirmed" | "in_progress" | "rejected" | "completed";
  apartment_id: number;
  complex?: { name?: string; building?: { address?: string; description?: string; apartment?: { number?: string | null; floor_number?: number } } };
  maintenance_department?: { id: number; name: string };
  maintenance_company?: { id: number; name: string };
  user?: { id: number; name?: string; email?: string; phone?: string };
  assigned_at?: string;
  created_at?: string;
  updated_at?: string;
};

type Company = { id: number; name: string };

const statusLabel = (s: ReqDetail["status"]) =>
  s === "waiting"
    ? "قيد المعالجة"
    : s === "confirmed"
    ? "مقبول"
    : s === "in_progress"
    ? "قيد التنفيذ"
    : s === "completed"
    ? "مكتمل"
    : "مرفوض";

export default function MaintenanceRequestDetailPage() {
  const params = useParams();
  const [request, setRequest] = useState<ReqDetail | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على التوكن");

      const [reqRes, compRes] = await Promise.all([
        fetch(`/api/dashboard/complex-admin/maintenance-requests/${params.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/dashboard/complex-admin/maintenance-companies?per_page=100&page=1`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!reqRes.ok) throw new Error(`فشل في جلب تفاصيل الطلب (${reqRes.status})`);
      if (!compRes.ok) throw new Error(`فشل في جلب قائمة الشركات (${compRes.status})`);

      const reqData = (await reqRes.json())?.data ?? null;
      const compData: Company[] = (await compRes.json())?.data?.MaintenanceCompanies ?? [];
      setRequest(reqData);
      setCompanies(compData);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const handleAssignAndConfirm = async () => {
    if (!request || !selectedCompany) {
      toast.error("يجب اختيار شركة الصيانة");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("لم يتم العثور على التوكن");
      return;
    }

    try {
      setAssigning(true);
      const company = companies.find(c => String(c.id) === selectedCompany);
      setRequest({ ...request, maintenance_company: company, status: "confirmed" });

      // Assign الشركة
      const formData = new FormData();
      formData.append("maintenance_company_id", selectedCompany);

      const res = await fetch(`/api/dashboard/complex-admin/maintenance-requests/${request.id}/assign-company`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        setRequest(prev => ({ ...prev!, maintenance_company: undefined, status: "waiting" }));
        throw new Error(`فشل في تعيين الشركة (${res.status})`);
      }

      const statusRes = await fetch(`/api/dashboard/complex-admin/maintenance-requests/${request.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "confirmed" }),
      });

      if (!statusRes.ok) throw new Error(`فشل في تحديث الحالة (${statusRes.status})`);

      toast.success("تم تعيين الشركة بنجاح");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "حدث خطأ في تعيين الشركة");
      fetchRequest();
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <p className="text-center py-10">جارٍ التحميل...</p>;
  if (!request) return <p className="text-center py-10">لم يتم العثور على الطلب</p>;

  return (
    <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">تفاصيل طلب الصيانة</CardTitle>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-4">
          <div>
            <p className="font-semibold">العنوان:</p>
            <p>{request.title}</p>
          </div>

          <div>
            <p className="font-semibold">الوصف:</p>
            <p>{request.description || "—"}</p>
          </div>

          <div>
            <p className="font-semibold">الحالة:</p>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                request.status === "confirmed" || request.status === "completed"
                  ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-800 dark:text-green-300 dark:border-green-600"
                  : request.status === "rejected"
                  ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-800 dark:text-red-300 dark:border-red-600"
                  : "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-300 dark:border-yellow-600"
              }`}
            >
              {statusLabel(request.status)}
            </span>
          </div>

          {request.status === "waiting" && (
            <div className="flex items-center gap-2">
              <Select value={selectedCompany} onValueChange={setSelectedCompany} dir="rtl">
                <SelectTrigger className="w-[200px] dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="اختر شركة" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="dark:bg-gray-700 dark:text-gray-200">
                  {companies.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAssignAndConfirm}
                disabled={!selectedCompany || assigning}
                className="dark:bg-purple-700 dark:text-white dark:hover:bg-purple-600"
              >
                {assigning ? "جارٍ المعالجة..." : "تخصيص الشركة وتأكيد"}
              </Button>
            </div>
          )}

          <div>
            <p className="font-semibold">القسم:</p>
            <p>{request.maintenance_department?.name || "—"}</p>
          </div>

          <div>
            <p className="font-semibold">الشركة المكلفة:</p>
            <p>{request.maintenance_company?.name || "—"}</p>
          </div>

          <div>
            <p className="font-semibold">المجمع / المبنى / الشقة:</p>
            <p>
              {request.complex?.name ? request.complex.name + " / " : ""}
              {request.complex?.building?.address ? request.complex.building.address + " / " : ""}
              {request.complex?.building?.apartment?.number ? "شقة " + request.complex.building.apartment.number : ""}
            </p>
          </div>

          <div>
            <p className="font-semibold">المستخدم:</p>
            <p>
              {request.user?.name} ({request.user?.email || "-"}) / {request.user?.phone || "-"}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <p className="font-semibold">تاريخ الإنشاء:</p>
              <p>{request.created_at ? new Date(request.created_at).toISOString().slice(0, 10) : "-"}</p>
            </div>
            <div>
              <p className="font-semibold">تاريخ التحديث:</p>
              <p>{request.updated_at ? new Date(request.updated_at).toISOString().slice(0, 10) : "-"}</p>
            </div>
            <div>
              <p className="font-semibold">تاريخ التعيين:</p>
              <p>{request.assigned_at || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
