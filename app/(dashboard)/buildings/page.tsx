"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Edit, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Building2, 
  Home, 
  MapPin, 
  Calendar, 
  DollarSign,
  ChevronDown,
  ChevronRight,
  Filter,
  Loader2,
  MoreHorizontal,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

// Form validation schema
const searchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

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
  const [deletingBuilding, setDeletingBuilding] = useState<number | null>(null);
  const [deletingApartment, setDeletingApartment] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const form = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
      status: "",
    }
  });

  const fetchBuildings = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("لم يتم العثور على رمز الدخول");
        return;
      }

      // build query params
      const params = new URLSearchParams();
      params.set("per_page", "10");
      params.set("page", String(targetPage));
      
      const formValues = form.getValues();
      if (formValues.search?.trim()) params.set("search", formValues.search.trim());
      if (formValues.status) params.set("status", formValues.status);

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "فشل في تحميل قائمة المباني");
      }

      const json = await res.json();
      const data: BuildingFromApi[] = json?.data?.buildings || [];
      const m: Meta | null = json?.data?.meta || null;
      setBuildings(data);
      setMeta(m);
      setPage(m?.current_page ?? targetPage);
      setExpandedId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ في تحميل قائمة المباني");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchBuildings(1);
  }, [fetchBuildings]);

  const confirmAndDeleteBuilding = async (buildingId: number) => {
    setDeletingBuilding(buildingId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("لم يتم العثور على رمز الدخول");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings/${buildingId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "فشل في حذف المبنى");
      }

      toast.success("تم حذف المبنى بنجاح ✅");
      await fetchBuildings(page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء حذف المبنى");
    } finally {
      setDeletingBuilding(null);
    }
  };

  const deleteApartment = async (buildingId: number, apartmentId: number) => {
    setDeletingApartment(apartmentId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("لم يتم العثور على رمز الدخول");
        return;
      }

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
        const errorData = await res.json();
        throw new Error(errorData.message || "فشل في حذف الشقة");
      }

      toast.success("تم حذف الشقة بنجاح ✅");
      await fetchBuildings(page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء حذف الشقة");
    } finally {
      setDeletingApartment(null);
    }
  };

  const handleRowClick = (buildingId: number) =>
    setExpandedId(expandedId === buildingId ? null : buildingId);

  const onSearchSubmit = (data: SearchForm) => {
    fetchBuildings(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    form.reset();
    fetchBuildings(1);
    setShowFilters(false);
  };

  const canPrev = (meta?.current_page ?? 1) > 1;
  const canNext = (meta?.current_page ?? 1) < (meta?.total_pages ?? 1);

  const getAvailableApartments = (apartments: Apartment[]) => 
    apartments.filter(apt => apt.is_available).length;

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('ar-IQ').format(Number(price));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إدارة المباني والشقق
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إضافة المباني داخل المجمع وتحديد الشقق المتوفرة فيها
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المباني</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {meta?.total || 0}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الشقق</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {buildings.reduce((acc, building) => acc + building.apartments.length, 0)}
                </p>
              </div>
              <Home className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الشقق المتاحة</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {buildings.reduce((acc, building) => acc + getAvailableApartments(building.apartments), 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الشقق المحجوزة</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {buildings.reduce((acc, building) => 
                    acc + (building.apartments.length - getAvailableApartments(building.apartments)), 0)}
                </p>
              </div>
              <EyeOff className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              قائمة المباني
            </CardTitle>
          </div>
          <Button
            onClick={() => router.push("/buildings/add")}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> إضافة مبنى
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {/* Search and Filter */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="w-4 h-4" /> 
                تصفية
                {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
              
              <div className="relative flex-grow max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  {...form.register("search")}
                  placeholder="البحث في المباني..."
                  className="pr-10 pl-4 py-2 w-full border-gray-300 dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white"
                  dir="rtl"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      form.handleSubmit(onSearchSubmit)();
                    }
                  }}
                />
              </div>

              <Button 
                onClick={form.handleSubmit(onSearchSubmit)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="p-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <form onSubmit={form.handleSubmit(onSearchSubmit)} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Select onValueChange={(value) => form.setValue("status", value)}>
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="حالة المبنى" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع المباني</SelectItem>
                        <SelectItem value="available">يحتوي على شقق متاحة</SelectItem>
                        <SelectItem value="full">مكتمل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      تطبيق
                    </Button>
                    <Button type="button" variant="outline" onClick={clearFilters}>
                      مسح
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>

          {loading && buildings.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-gray-600 dark:text-gray-400">جارٍ التحميل...</p>
              </div>
            </div>
          ) : buildings.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  لا توجد مباني
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  ابدأ بإضافة مبنى جديد لإدارة الشقق
                </p>
                <Button
                  onClick={() => router.push("/buildings/add")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة مبنى جديد
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                      <TableHead className="text-center text-gray-700 dark:text-gray-300 font-medium">المعرف</TableHead>
                      <TableHead className="text-center text-gray-700 dark:text-gray-300 font-medium">العنوان</TableHead>
                      <TableHead className="text-center text-gray-700 dark:text-gray-300 font-medium">الوصف</TableHead>
                      <TableHead className="text-center text-gray-700 dark:text-gray-300 font-medium">الشقق</TableHead>
                      <TableHead className="text-center text-gray-700 dark:text-gray-300 font-medium">المتاحة</TableHead>
                      <TableHead className="text-center text-gray-700 dark:text-gray-300 font-medium">تاريخ الإضافة</TableHead>
                      <TableHead className="text-center text-gray-700 dark:text-gray-300 font-medium">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {buildings.map((building) => (
                      <React.Fragment key={building.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                          onClick={() => handleRowClick(building.id)}
                        >
                          <TableCell className="text-center text-gray-900 dark:text-white font-medium">
                            <Badge variant="outline" className="dark:border-gray-600">
                              {building.id}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900 dark:text-white font-medium">
                                {building.address}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center max-w-xs">
                            <p className="text-gray-600 dark:text-gray-400 truncate">
                              {building.description || "لا يوجد وصف"}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="dark:bg-gray-600 dark:text-gray-200">
                              {building.apartments.length}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={getAvailableApartments(building.apartments) > 0 ? "default" : "destructive"}
                              className={getAvailableApartments(building.apartments) > 0 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }
                            >
                              {getAvailableApartments(building.apartments)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-gray-600 dark:text-gray-400">
                            <div className="flex items-center justify-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(building.created_at).toLocaleDateString("ar-SA")}
                            </div>
                          </TableCell>

                          {/* Actions cell */}
                          <TableCell
                            className="text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 py-1 h-auto dark:border-gray-600 dark:text-gray-300"
                                onClick={() =>
                                  router.push(`/buildings/${building.id}/add-apartment`)
                                }
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                شقة
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-600">
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/buildings/${building.id}/edit`)}
                                    className="dark:text-gray-300 dark:hover:bg-gray-700"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    تحرير
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="dark:bg-gray-600" />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem 
                                        className="text-red-500 dark:text-red-400 dark:hover:bg-gray-700"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        حذف
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-600">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="dark:text-white">
                                          تأكيد الحذف
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="dark:text-gray-400">
                                          هل أنت متأكد من حذف هذا المبنى؟ سيتم حذف جميع الشقق المرتبطة به أيضاً. هذا الإجراء لا يمكن التراجع عنه.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                                          إلغاء
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => confirmAndDeleteBuilding(building.id)}
                                          disabled={deletingBuilding === building.id}
                                          className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                          {deletingBuilding === building.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                          ) : (
                                            <Trash2 className="w-4 h-4 mr-2" />
                                          )}
                                          حذف
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded apartments */}
                        {expandedId === building.id && building.apartments.length > 0 && (
                          <TableRow className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                            <TableCell colSpan={7} className="p-0">
                              <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    الشقق ({building.apartments.length})
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {building.apartments.map((apt) => (
                                    <Card key={apt.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                          <div>
                                            <div className="flex items-center gap-2 mb-1">
                                              <Home className="w-4 h-4 text-blue-500" />
                                              <span className="font-medium text-gray-900 dark:text-white">
                                                شقة رقم {apt.number}
                                              </span>
                                            </div>
                                            <Badge 
                                              variant={apt.is_available ? "default" : "destructive"}
                                              className={apt.is_available 
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs" 
                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs"
                                              }
                                            >
                                              {apt.is_available ? "متوفرة" : "محجوزة"}
                                            </Badge>
                                          </div>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-auto"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-600">
                                              <AlertDialogHeader>
                                                <AlertDialogTitle className="dark:text-white">
                                                  تأكيد حذف الشقة
                                                </AlertDialogTitle>
                                                <AlertDialogDescription className="dark:text-gray-400">
                                                  هل أنت متأكد من حذف الشقة رقم {apt.number}؟ هذا الإجراء لا يمكن التراجع عنه.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                                                  إلغاء
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() => deleteApartment(building.id, apt.id)}
                                                  disabled={deletingApartment === apt.id}
                                                  className="bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                  {deletingApartment === apt.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                  ) : (
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                  )}
                                                  حذف الشقة
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">الطابق:</span>
                                            <span className="text-gray-900 dark:text-white font-medium">{apt.floor_number}</span>
                                          </div>
                                          
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">السعر:</span>
                                            <div className="flex items-center gap-1">
                                              <DollarSign className="w-3 h-3 text-green-500" />
                                              <span className="text-gray-900 dark:text-white font-medium">
                                                {formatPrice(apt.price)} د.ع
                                              </span>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">النوع:</span>
                                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                              {apt.listing_type}
                                            </Badge>
                                          </div>
                                          
                                          {apt.residency_date && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-gray-500 dark:text-gray-400">تاريخ السكن:</span>
                                              <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-blue-500" />
                                                <span className="text-gray-900 dark:text-white text-xs">
                                                  {new Date(apt.residency_date).toLocaleDateString("ar-SA")}
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Empty state for buildings with no apartments */}
                        {expandedId === building.id && building.apartments.length === 0 && (
                          <TableRow className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center gap-3">
                                <Home className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                <p className="text-gray-500 dark:text-gray-400">لا توجد شقق في هذا المبنى</p>
                                <Button
                                  onClick={() => router.push(`/buildings/${building.id}/add-apartment`)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  إضافة شقة جديدة
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <Separator className="my-4 dark:bg-gray-600" />
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  عرض {((meta?.current_page ?? 1) - 1) * (meta?.per_page ?? 10) + 1} إلى{" "}
                  {Math.min((meta?.current_page ?? 1) * (meta?.per_page ?? 10), meta?.total ?? 0)} من{" "}
                  {meta?.total ?? 0} مبنى
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canPrev || loading}
                    onClick={() => canPrev && fetchBuildings((meta?.current_page ?? 2) - 1)}
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    السابق
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">الصفحة</span>
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                      {meta?.current_page ?? 1}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">من</span>
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                      {meta?.total_pages ?? 1}
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canNext || loading}
                    onClick={() => canNext && fetchBuildings((meta?.current_page ?? 0) + 1)}
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    التالي
                    {loading ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : null}
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