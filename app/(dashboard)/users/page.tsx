"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function UsersPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على رمز الدخول");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/users?per_page=10&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 404) {
        // مفيش مستخدمين
        setUsers([]);
        setMeta(null);
        return;
      }

      if (!res.ok) throw new Error("فشل في تحميل قائمة المستخدمين");

      const json = await res.json();
      setUsers(json.data.users ?? []);
      setMeta(json.data.meta ?? null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "حدث خطأ أثناء تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">جاري التحميل...</div>;

  return (
    <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">إدارة المستخدمين</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">عرض وتعديل صلاحيات المستخدمين.</p>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent"
            >
              <SlidersHorizontal className="w-4 h-4" />
              تصفية
            </Button>
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                placeholder="بحث"
                className="pr-10 pl-4 py-2 w-full border-gray-300 dark:border-gray-600 rounded-lg text-right dark:bg-gray-700 dark:text-gray-200"
                dir="rtl"
              />
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              لا يوجد مستخدمين حالياً
            </div>
          ) : (
            <Table className="dark:divide-gray-700">
              <TableHeader>
                <TableRow className="bg-gray-50 text-sm dark:bg-gray-700">
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">الاسم</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">رقم الهاتف</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-200">الوحدات</TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-200">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => router.push(`${pathname}/${user.id}`)}
                  >
                    <TableCell className="text-right">{user.name}</TableCell>
                    <TableCell className="text-right">{user.email}</TableCell>
                    <TableCell className="text-right">{user.phone}</TableCell>
                    <TableCell className="text-right">
                      {user.apartments?.map((apt: any) => (
                        <div key={apt.id}>
                          {apt.number} - {apt.building.address}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" disabled={actionLoading}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" disabled={actionLoading}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {meta && users.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span>الصفحة {meta.current_page} من {meta.total_pages}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.prev_page_url || actionLoading}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.next_page_url || actionLoading}
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
