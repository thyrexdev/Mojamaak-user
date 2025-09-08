"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

interface CompanyTranslation {
  name: string;
  location: string;
  description: string;
}

interface Company {
  id: number;
  type: "internal" | "external";
  created_at: string;
  translations?: {
    ar?: CompanyTranslation;
    en?: CompanyTranslation;
    ku?: CompanyTranslation;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function MaintenancePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على رمز الدخول");

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/maintenance-companies?per_page=10&page=${page}&search=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "فشل في تحميل بيانات الشركات");
      }

      const json = await res.json();
      const data = json?.data?.MaintenanceCompanies || [];
      const totalPages = json?.data?.meta?.total_pages || 1;

      setCompanies(data);
      setTotalPages(totalPages);
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ في تحميل قائمة الشركات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, searchQuery]);

  const getArabicTranslation = (company: Company) => {
    return (
      company.translations?.ar || {
        name: "-",
        location: "-",
        description: "-",
      }
    );
  };

  return (
    <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              إدارة شركات الصيانة
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              جميع شركات الصيانة المسجلة في النظام.
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" /> إضافة شركة
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={fetchCompanies}
              disabled={loading}
            >
              <SlidersHorizontal className="w-4 h-4" /> {loading ? "جاري التحميل..." : "تصفية"}
            </Button>
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث"
                className="pr-10 pl-4 py-2 w-full border-gray-300 dark:border-gray-600 rounded-lg text-right dark:bg-gray-700 dark:text-gray-200"
                dir="rtl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Table className="border border-gray-200 dark:border-gray-700">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700 text-sm font-semibold">
                <TableHead className="text-center text-gray-700 dark:text-gray-200 w-[60px]">
                  التسلسل
                </TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-200">
                  اسم الشركة
                </TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-200">
                  نوع الشركة
                </TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-200">
                  الموقع
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  الحالة
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  تاريخ الإضافة
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => {
                const ar = getArabicTranslation(company);
                return (
                  <TableRow
                    key={company.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <TableCell className="text-center font-semibold">{company.id}</TableCell>
                    <TableCell>{ar.name}</TableCell>
                    <TableCell className="text-right">
                      {company.type === "internal" ? "داخلية" : "خارجية"}
                    </TableCell>
                    <TableCell className="text-right">{ar.location}</TableCell>
                    <TableCell className="text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-300 dark:bg-green-800 dark:text-green-300 dark:border-green-600">
                        نشط
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {new Date(company.created_at).toLocaleDateString("ar-EG")}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => router.push(`/companies/${company.id}`)}
                        >
                          عرض التفاصيل
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              الصفحة {page} من {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => page > 1 && setPage(page - 1)}
                disabled={page === 1}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => page < totalPages && setPage(page + 1)}
                disabled={page === totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
