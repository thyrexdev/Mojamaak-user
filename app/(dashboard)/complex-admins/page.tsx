"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, SlidersHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ComplexAdminsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [admins, setAdmins] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchAdmins = async (page: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/complex-admins?per_page=10&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("فشل في تحميل البيانات");

      const json = await res.json();
      setAdmins(json.data.complexAdmin);
      setMeta(json.data.meta);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "حدث خطأ في تحميل قائمة الإداريين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setBtnLoading(true);
    setPage(newPage);
    setBtnLoading(false);
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        جاري التحميل...
      </div>
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
              إدارة الإداريين
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 bg-transparent"
            >
              <SlidersHorizontal className="w-4 h-4" />
              تصفية
            </Button>
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث"
                className="pr-10 pl-4 py-2 w-full border-gray-300 rounded-lg text-right dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                dir="rtl"
              />
            </div>
          </div>

          <Table className="dark:divide-gray-700">
            <TableHeader>
              <TableRow className="bg-gray-50 text-sm dark:bg-gray-700">
                <TableHead className="text-right text-gray-700 dark:text-gray-200">
                  الاسم
                </TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-200">
                  البريد الإلكتروني
                </TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-200">
                  المجمع السكني
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow
                  key={admin.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <TableCell
                    className="text-right"
                    onClick={() => router.push(`${pathname}/${admin.id}`)}
                  >
                    {admin.name}
                  </TableCell>
                  <TableCell className="text-right">{admin.email}</TableCell>
                  <TableCell className="text-right">
                    {admin.residential_complex?.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Link href={`complex-admins/${admin.id}/permissions`}>
                          <Edit className="w-4 h-4" />
                        </Link>
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
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                الصفحة {meta.current_page} من {meta.total_pages}
              </span>
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
        </CardContent>
      </Card>
    </div>
  );
}
