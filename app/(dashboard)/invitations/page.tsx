"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

// Simple Modal Component
function Modal({ open, onClose, onAccept, onCancel }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">اختر الإجراء</h2>
        <p className="text-gray-600">هل تريد قبول الدعوة أو إلغاؤها؟</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>إلغاء</Button>
          <Button onClick={onAccept}>قبول</Button>
        </div>
        <Button variant="ghost" className="absolute top-2 right-2" onClick={onClose}>✕</Button>
      </div>
    </div>
  );
}

export default function InvitationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Modal state
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInvitations = async (page: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("لم يتم العثور على التوكن");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/invitations?per_page=5&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        throw new Error(`فشل في جلب الدعوات (${res.status})`);
      }

      const json = await res.json();
      setInvitations(json.data.invitations || []);
      setMeta(json.data.meta || null);
    } catch (err: any) {
      console.error("خطأ في تحميل الدعوات:", err);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: err?.message || "حدث خطأ في تحميل الدعوات"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations(page);
  }, [page]);

  const handleRowClick = (inv: any) => {
    setSelectedInvitation(inv);
    setModalOpen(true);
  };

  const handleAccept = () => {
    if (selectedInvitation) {
      toast({
        title: "جاري المعالجة",
        description: "جاري تأكيد قبول الدعوة..."
      });
      router.push(`${pathname}/${selectedInvitation.id}/accept`);
      setModalOpen(false);
      setSelectedInvitation(null);
    }
  };

  const handleCancel = () => {
    if (selectedInvitation) {
      toast({
        title: "جاري المعالجة",
        description: "جاري إلغاء الدعوة..."
      });
      router.push(`${pathname}/${selectedInvitation.id}/cancel`);
      setModalOpen(false);
      setSelectedInvitation(null);
    }
  };

  if (loading) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            إدارة الدعوات
          </CardTitle>
          <p className="text-sm text-gray-500">عرض وتتبع الدعوات المرسلة للإداريين.</p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 text-sm">
                <TableHead className="text-right text-gray-700">البريد الإلكتروني</TableHead>
                <TableHead className="text-right text-gray-700">الحالة</TableHead>
                <TableHead className="text-right text-gray-700">المجمع السكني</TableHead>
                <TableHead className="text-right text-gray-700">تاريخ الإرسال</TableHead>
                <TableHead className="text-right text-gray-700">ينتهي في</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv) => (
                <TableRow key={inv.id} className="cursor-pointer" onClick={() => handleRowClick(inv)}>
                  <TableCell className="text-right">{inv.email}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        inv.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : inv.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{inv.residential_complex?.name || "-"}</TableCell>
                  <TableCell className="text-right">{new Date(inv.created_at).toLocaleString("ar-EG")}</TableCell>
                  <TableCell className="text-right">{new Date(inv.expires_at).toLocaleString("ar-EG")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meta && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>الصفحة {meta.current_page} من {meta.total_pages}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.prev_page_url}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.next_page_url}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAccept={handleAccept}
        onCancel={handleCancel}
      />
    </div>
  );
}
