"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, SlidersHorizontal, Edit, Trash2 } from "lucide-react";

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

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Aucun token trouvé");

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/maintenance-companies?per_page=10&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erreur de chargement des sociétés");

      const json = await res.json();
      const data = json?.data?.MaintenanceCompanies || [];
      const totalPages = json?.data?.meta?.total_pages || 1;

      setCompanies(data);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Erreur lors du chargement des sociétés :", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page]);

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
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              إدارة شركات الصيانة
            </CardTitle>
            <p className="text-sm text-gray-500">
              جميع شركات الصيانة المسجلة في النظام.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              <SlidersHorizontal className="w-4 h-4" /> تصفية
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
              <TableRow className="bg-gray-50 text-sm font-semibold">
                <TableHead className="text-center text-gray-700 w-[60px]">
                  التسلسل
                </TableHead>
                <TableHead className="text-right text-gray-700">
                  اسم الشركة
                </TableHead>
                <TableHead className="text-right text-gray-700">
                  نوع الشركة
                </TableHead>
                <TableHead className="text-right text-gray-700">
                  الموقع
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  الحالة
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  تاريخ الإضافة
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => {
                const ar = getArabicTranslation(company);
                return (
                  <TableRow key={company.id} className="hover:bg-gray-50">
                    <TableCell className="text-center font-semibold">
                      {company.id}
                    </TableCell>
                    <TableCell>{ar.name}</TableCell>
                    <TableCell className="text-right">
                      {company.type === "internal" ? "داخلية" : "خارجية"}
                    </TableCell>
                    <TableCell className="text-right">{ar.location}</TableCell>
                    <TableCell className="text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-300">
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
                          className="text-gray-700 border-gray-300 bg-white hover:bg-gray-50"
                          onClick={() =>
                            router.push(`/companies/${company.id}`)
                          }
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
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
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
