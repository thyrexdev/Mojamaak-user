"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";

type Apartment = {
  id: number;
  floor_number: string;
  number: string;
  residency_date: string | null;
  price: string;
  listing_type: string;
  is_available: boolean;
};

type Complex = {
  id: number;
  name: string;
  description: string;
  logo: string;
};

type BuildingFromApi = {
  id: number;
  address: string;
  description: string;
  complex: Complex;
  apartments: Apartment[];
  created_at: string;
  updated_at: string;
};

type Meta = {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  next_page_url: string | null;
  prev_page_url: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function BuildingsPage() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [buildings, setBuildings] = useState<BuildingFromApi[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchBuildings = async (targetPage = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لا يوجد رمز دخول");

      // build query params
      const params = new URLSearchParams();
      params.set("per_page", "10");
      params.set("page", String(targetPage));
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`خطأ التحميل ${res.status}: ${t}`);
      }

      const json = await res.json();
      const data: BuildingFromApi[] = json?.data?.buildings || [];
      const m: Meta | null = json?.data?.meta || null;
      setBuildings(data);
      setMeta(m);
      setPage(m?.current_page ?? targetPage);
      setExpandedId(null);
    } catch (error) {
      console.error("Erreur lors du chargement des المباني:", error);
      alert("تعذر تحميل المباني");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmAndDeleteBuilding = async (buildingId: number) => {
    const yes = confirm("هل أنت متأكد من حذف هذا المبنى؟");
    if (!yes) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لا يوجد رمز دخول");

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings/${buildingId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`فشل الحذف ${res.status}: ${t}`);
      }

      alert("تم حذف المبنى بنجاح");
      fetchBuildings(page);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const deleteApartment = async (buildingId: number, apartmentId: number) => {
    const yes = confirm("هل تريد حذف هذه الشقة؟");
    if (!yes) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لا يوجد رمز دخول");

      // Endpoint: POST update with form-data delete_apartments[]
      const form = new FormData();
      form.append("delete_apartments[0]", String(apartmentId));

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings/${buildingId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`فشل في حذف الشقة: ${res.status} → ${t}`);
      }

      alert("تم حذف الشقة");
      fetchBuildings(page);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء محاولة حذف الشقة");
    }
  };

  const handleRowClick = (buildingId: number) =>
    setExpandedId(expandedId === buildingId ? null : buildingId);

  const canPrev = (meta?.current_page ?? 1) > 1;
  const canNext = (meta?.current_page ?? 1) < (meta?.total_pages ?? 1);

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              إدارة المباني والشقق
            </CardTitle>
            <p className="text-sm text-gray-500">
              إضافة المباني داخل المجمع وتحديد الشقق المتوفرة فيها.
            </p>
          </div>
          <Button
            onClick={() => router.push("/buildings/add")}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> إضافة مبنى
          </Button>
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

          {loading ? (
            <p className="text-center py-10">جارٍ التحميل...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 text-sm font-semibold">
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">العنوان</TableHead>
                    <TableHead className="text-center">الوصف</TableHead>
                    <TableHead className="text-center">عدد الشقق</TableHead>
                    <TableHead className="text-center">تاريخ الإضافة</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {buildings.map((building) => (
                    <React.Fragment key={building.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(building.id)}
                      >
                        <TableCell className="text-center">
                          {building.id}
                        </TableCell>
                        <TableCell className="text-center">
                          {building.address}
                        </TableCell>
                        <TableCell className="text-center">
                          {building.description}
                        </TableCell>
                        <TableCell className="text-center">
                          {building.apartments.length}
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(building.created_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </TableCell>

                        {/* Actions cell — stop row toggle when clicking buttons */}
                        <TableCell
                          className="text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/buildings/${building.id}/add-apartment`
                                )
                              }
                            >
                              إضافة شقة
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/buildings/${building.id}/edit`)
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() =>
                                confirmAndDeleteBuilding(building.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded apartments */}
                      {expandedId === building.id &&
                        building.apartments.map((apt) => (
                          <TableRow
                            key={`apt-${building.id}-${apt.id}`}
                            className="bg-gray-100 border-t border-gray-300"
                          >
                            <TableCell colSpan={6}>
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-right space-y-1">
                                  <div>رقم الشقة: {apt.number}</div>
                                  <div>الطابق: {apt.floor_number}</div>
                                  <div>السعر: {apt.price}</div>
                                  <div>النوع: {apt.listing_type}</div>
                                  <div>
                                    الحالة:{" "}
                                    {apt.is_available ? "متوفرة" : "محجوزة"}
                                  </div>
                                  {apt.residency_date && (
                                    <div>
                                      تاريخ السكن:{" "}
                                      {new Date(
                                        apt.residency_date
                                      ).toLocaleDateString("fr-FR")}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      deleteApartment(building.id, apt.id)
                                    }
                                  >
                                    حذف الشقة
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>
                  الصفحة {meta?.current_page ?? 1} من {meta?.total_pages ?? 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canPrev}
                    onClick={() =>
                      canPrev && fetchBuildings((meta?.current_page ?? 2) - 1)
                    }
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canNext}
                    onClick={() =>
                      canNext && fetchBuildings((meta?.current_page ?? 0) + 1)
                    }
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
