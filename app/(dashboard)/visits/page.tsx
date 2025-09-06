"use client";

import { useEffect, useState } from "react";
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
import { SlidersHorizontal, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type VisitStatus = "pending" | "accepted" | "rejected";

interface VisitRequest {
  id: number;
  visiter_name: string;
  visiter_phone: string;
  visit_date: string;
  visit_time: string;
  status: VisitStatus;
  description?: string;
  user?: {
    id: number;
    name: string;
  };
}

interface VisitsResponse {
  data: {
    visit_requests: VisitRequest[];
    meta: {
      total_pages: number;
    };
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function VisitRequestsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVisits = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Aucun token trouvé");

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/visit-requests?page=${page}&per_page=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erreur lors du chargement des visites");

      const json = await res.json();
      setVisits(json.data.visit_requests);
      setTotalPages(json.data.meta.total_pages);
    } catch (error) {
      console.error("Erreur chargement visites :", error);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [page]);

  const getStatusLabel = (status: VisitStatus) => {
    switch (status) {
      case "accepted":
        return {
          label: "مقبول",
          color: "bg-green-50 text-green-700 border-green-300",
        };
      case "rejected":
        return {
          label: "مرفوض",
          color: "bg-red-50 text-red-700 border-red-300",
        };
      default:
        return {
          label: "قيد الانتظار",
          color: "bg-yellow-50 text-yellow-700 border-yellow-300",
        };
    }
  };

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-col items-start gap-1 p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            إدارة طلبات الزيارة
          </CardTitle>
          <p className="text-sm text-gray-500">
            جميع طلبات الزيارة المقدمة من السكان
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {/* Search & Filters */}
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

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 text-sm font-semibold">
                <TableHead className="text-center text-gray-700 w-[60px]">
                  #
                </TableHead>
                <TableHead className="text-right text-gray-700">
                  الزائر
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  رقم الهاتف
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  الساكن
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  التاريخ
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  الوقت
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  الحالة
                </TableHead>
                <TableHead className="text-center text-gray-700">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visits.map((visit) => {
                const status = getStatusLabel(visit.status);
                return (
                  <TableRow key={visit.id} className="hover:bg-gray-50">
                    <TableCell className="text-center font-semibold">
                      {visit.id}
                    </TableCell>
                    <TableCell className="text-right">
                      {visit.visiter_name}
                    </TableCell>
                    <TableCell className="text-center">
                      {visit.visiter_phone}
                    </TableCell>
                    <TableCell className="text-center">
                      {visit.user?.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {visit.visit_date}
                    </TableCell>
                    <TableCell className="text-center">
                      {visit.visit_time}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700 border-gray-300 bg-white hover:bg-gray-50"
                          onClick={() => router.push(`/visits/${visit.id}`)}
                        >
                          معاينة
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
