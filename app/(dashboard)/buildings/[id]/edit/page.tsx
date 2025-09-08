"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  Home,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.mojamaak.com";

// === Schemas ===
const buildingSchema = z.object({
  address: z.string().min(1, "العنوان مطلوب"),
  description: z.string().min(1, "الوصف مطلوب"),
  building_date: z.string().optional(),
  status_active: z.boolean(),
});

type BuildingFormData = z.infer<typeof buildingSchema>;

type ApartmentData = {
  id: number;
  floor_number: string;
  number: string;
  residency_date?: string;
  price: string;
  listing_type: "sale" | "rent";
  is_available: boolean;
};

export default function EditBuildingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const buildingId = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apartments, setApartments] = useState<ApartmentData[]>([]);
  const [adding, setAdding] = useState(false);

  const form = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      address: "",
      description: "",
      building_date: "",
      status_active: true,
    },
  });

  // Fetch building
  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("لا يوجد توكن");

        const res = await fetch(
          `${API_BASE_URL}/api/dashboard/complex-admin/buildings/${buildingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const json = await res.json();
        if (!res.ok) throw new Error(json.message);

        const b = json.data;

        setApartments(
          (b.apartments || []).map((a: any) => ({
            id: a.id,
            floor_number: String(a.floor_number),
            number: String(a.number),
            residency_date: a.residency_date
              ? String(a.residency_date).slice(0, 10)
              : "",
            price: String(a.price),
            listing_type: a.listing_type,
            is_available: Boolean(Number(a.is_available)),
          }))
        );

        form.reset({
          address: b.translations?.ar?.address ?? b.address ?? "",
          description: b.translations?.ar?.description ?? b.description ?? "",
          building_date: b.building_date
            ? String(b.building_date).slice(0, 10)
            : "",
          status_active: String(b.status) === "active",
        });
      } catch (err: any) {
        toast.error(err.message || "فشل تحميل المبنى");
      } finally {
        setLoading(false);
      }
    };
    if (buildingId) fetchBuilding();
  }, [buildingId, form]);

  // Save building details
  const onSave = async (data: BuildingFormData) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لا يوجد توكن");

      const fd = new FormData();
      fd.append("address[ar]", data.address);
      fd.append("address[en]", data.address);
      fd.append("address[ku]", data.address);
      fd.append("description[ar]", data.description);
      fd.append("description[en]", data.description);
      fd.append("description[ku]", data.description);
      fd.append("building_date", data.building_date || "");
      fd.append("status_active", data.status_active ? "1" : "0");

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings/${buildingId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );
      if (!res.ok) throw new Error("فشل الحفظ");

      toast.success("تم حفظ تفاصيل المبنى");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete apartment
  const deleteApartment = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لا يوجد توكن");

      const fd = new FormData();
      fd.append("delete_apartments[0]", String(id));

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings/${buildingId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );
      if (!res.ok) throw new Error("فشل الحذف");

      setApartments((prev) => prev.filter((a) => a.id !== id));
      toast.success("تم حذف الشقة");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Add apartment
  const addApartment = async (apt: Omit<ApartmentData, "id">) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لا يوجد توكن");

      const fd = new FormData();
      fd.append("apartments[0][floor_number]", apt.floor_number);
      fd.append("apartments[0][number]", apt.number);
      fd.append("apartments[0][price]", apt.price);
      fd.append("apartments[0][listing_type]", apt.listing_type);
      fd.append("apartments[0][is_available]", apt.is_available ? "1" : "0");
      fd.append("apartments[0][residency_date]", apt.residency_date || "");

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings/${buildingId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setApartments((prev) => [...prev, json.data.apartments.at(-1)]);
      toast.success("تم إضافة الشقة");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  // Edit apartment
  const editApartment = async (id: number, apt: Omit<ApartmentData, "id">) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لا يوجد توكن");

      const fd = new FormData();
      fd.append(`apartments[0][id]`, String(id));
      fd.append(`apartments[0][floor_number]`, apt.floor_number);
      fd.append(`apartments[0][number]`, apt.number);
      fd.append(`apartments[0][price]`, apt.price);
      fd.append(`apartments[0][listing_type]`, apt.listing_type);
      fd.append(`apartments[0][is_available]`, apt.is_available ? "1" : "0");
      fd.append(`apartments[0][residency_date]`, apt.residency_date || "");

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings/${buildingId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      // update local state
      setApartments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...apt } : a))
      );
      toast.success("تم تعديل الشقة");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto p-6 max-w-6xl font-arabic" dir="rtl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex gap-2 items-center">
            <Building2 className="w-6 h-6 text-blue-500" />
            تعديل المبنى
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/buildings")}
          >
            <ArrowLeft className="w-4 h-4 ml-2" /> رجوع
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">تفاصيل المبنى</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="اكتب العنوان" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="اكتب الوصف" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Apartments */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Home className="w-5 h-5 text-orange-500" />
                  الشقق ({apartments.length})
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAdding(true)}
                >
                  <Plus className="w-4 h-4 ml-1" /> إضافة شقة
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {apartments.map((apt) => (
                  <div
                    key={apt.id}
                    className="relative rounded-lg border p-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p>
                          <Badge>#{apt.number}</Badge> دور {apt.floor_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {apt.price} |{" "}
                          {apt.listing_type === "sale" ? "بيع" : "إيجار"} |{" "}
                          {apt.residency_date || "—"}
                          {apt.is_available ? (
                            <Badge className="mr-2 bg-green-100 text-green-800">
                              متاحة
                            </Badge>
                          ) : (
                            <Badge className="mr-2 bg-yellow-100 text-yellow-800">
                              محجوزة
                            </Badge>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              تعديل
                            </Button>
                          </DialogTrigger>
                          <DialogContent dir="rtl">
                            <DialogHeader>
                              <DialogTitle>تعديل الشقة</DialogTitle>
                            </DialogHeader>
                            <EditApartmentForm
                              apartment={apt}
                              onSave={(updated) =>
                                editApartment(apt.id, updated)
                              }
                            />
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4 ml-1" /> حذف
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف هذه الشقة؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteApartment(apt.id)}
                              >
                                تأكيد
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                <Save className="w-4 h-4 ml-2" />
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Add Apartment Modal */}
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة شقة</DialogTitle>
          </DialogHeader>
          <AddApartmentForm onSave={addApartment} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// === Add Apartment Form ===
function AddApartmentForm({
  onSave,
}: {
  onSave: (apt: Omit<ApartmentData, "id">) => void;
}) {
  const form = useForm<Omit<ApartmentData, "id">>({
    defaultValues: {
      floor_number: "",
      number: "",
      price: "",
      listing_type: "sale",
      is_available: true,
      residency_date: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="floor_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الطابق</FormLabel>
              <FormControl>
                <Input {...field} placeholder="مثال: 15" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الشقة</FormLabel>
              <FormControl>
                <Input {...field} placeholder="مثال: A01" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="residency_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ السكن</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>السعر</FormLabel>
              <FormControl>
                <Input {...field} placeholder="مثال: 3535.00" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="listing_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع الإعلان</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border px-3 py-2 dark:bg-gray-800"
                >
                  <option value="sale">بيع</option>
                  <option value="rent">إيجار</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        {/* بدل checkbox بخانة اختيار */}
        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الحالة</FormLabel>
              <FormControl>
                <select
                  value={field.value ? "1" : "0"}
                  onChange={(e) => field.onChange(e.target.value === "1")}
                  className="w-full rounded-md border px-3 py-2 dark:bg-gray-800"
                >
                  <option value="1">متاحة</option>
                  <option value="0">محجوزة</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">تأكيد الإضافة</Button>
        </div>
      </form>
    </Form>
  );
}

// === Edit Apartment Form ===
function EditApartmentForm({
  apartment,
  onSave,
}: {
  apartment: ApartmentData;
  onSave: (apt: Omit<ApartmentData, "id">) => void;
}) {
  const form = useForm<Omit<ApartmentData, "id">>({
    defaultValues: {
      floor_number: apartment.floor_number,
      number: apartment.number,
      price: apartment.price,
      listing_type: apartment.listing_type,
      is_available: apartment.is_available,
      residency_date: apartment.residency_date || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="floor_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الطابق</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الشقة</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="residency_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ السكن</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>السعر</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="listing_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع الإعلان</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border px-3 py-2 dark:bg-gray-800"
                >
                  <option value="sale">بيع</option>
                  <option value="rent">إيجار</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        {/* هنا برضه select بدل checkbox */}
        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الحالة</FormLabel>
              <FormControl>
                <select
                  value={field.value ? "1" : "0"}
                  onChange={(e) => field.onChange(e.target.value === "1")}
                  className="w-full rounded-md border px-3 py-2 dark:bg-gray-800"
                >
                  <option value="1">متاحة</option>
                  <option value="0">محجوزة</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">تأكيد التعديل</Button>
        </div>
      </form>
    </Form>
  );
}
