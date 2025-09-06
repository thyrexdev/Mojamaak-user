"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Search, SlidersHorizontal, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ComplexAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchAdmins = async (page: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/complex-admins?per_page=10&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setAdmins(json.data.complexAdmin);
      setMeta(json.data.meta);
    } catch (err) {
      console.error("خطأ في تحميل الإداريين:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins(page);
  }, [page]);

  if (loading) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              إدارة الإداريين
            </CardTitle>
            <p className="text-sm text-gray-500">
              عرض وتعديل صلاحيات إداريي المجمعات السكنية.
            </p>
          </div>
          <Link href={"complex-admins/invite"}>
            <Button className="text-white bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 ml-2" />
              إضافة إداري
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              <SlidersHorizontal className="w-4 h-4" />
              تصفية
            </Button>
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث"
                className="pr-10 pl-4 py-2 w-full border-gray-300 rounded-lg text-right"
                dir="rtl"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 text-sm">
                <TableHead className="text-right text-gray-700">
                  الاسم
                </TableHead>
                <TableHead className="text-right text-gray-700">
                  البريد الإلكتروني
                </TableHead>
                <TableHead className="text-right text-gray-700">
                  المجمع السكني
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="text-right">{admin.name}</TableCell>
                  <TableCell className="text-right">{admin.email}</TableCell>
                  <TableCell className="text-right">
                    {admin.residential_complex?.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meta && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                الصفحة {meta.current_page} من {meta.total_pages}
              </span>
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
    </div>
  );
}
