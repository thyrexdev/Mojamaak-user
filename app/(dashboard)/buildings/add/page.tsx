"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Building2, 
  Plus, 
  Trash2, 
  Home, 
  MapPin, 
  FileText, 
  Calendar,
  DollarSign,
  Loader2,
  Save,
  X,
  Languages,
  Hash
} from "lucide-react";
import { toast } from "sonner";

// Zod validation schema
const apartmentSchema = z.object({
  floor_number: z.string().min(1, "رقم الطابق مطلوب").regex(/^\d+$/, "يجب أن يكون رقماً صحيحاً"),
  number: z.string().min(1, "رقم الشقة مطلوب"),
  residency_date: z.string().optional(),
  price: z.string().min(1, "السعر مطلوب").regex(/^\d+(\.\d{1,2})?$/, "السعر يجب أن يكون رقماً صحيحاً"),
  listing_type: z.enum(["sale", "rent"], { errorMap: () => ({ message: "نوع العرض مطلوب" }) }),
  is_available: z.boolean(),
});

const buildingSchema = z.object({
  address: z.object({
    ar: z.string().min(1, "العنوان بالعربية مطلوب"),
    en: z.string().min(1, "العنوان بالإنجليزية مطلوب"),
    ku: z.string().optional(),
  }),
  description: z.object({
    ar: z.string().optional(),
    en: z.string().optional(),
    ku: z.string().optional(),
  }),
  is_active: z.boolean(),
  apartments: z.array(apartmentSchema).min(1, "يجب إضافة شقة واحدة على الأقل"),
});

type FormData = z.infer<typeof buildingSchema>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function AddBuildingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [currentLang, setCurrentLang] = useState<"ar" | "en" | "ku">("ar");

  const form = useForm<FormData>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      address: { ar: "", en: "", ku: "" },
      description: { ar: "", en: "", ku: "" },
      is_active: true,
      apartments: [
        {
          floor_number: "",
          number: "",
          residency_date: "",
          price: "",
          listing_type: "sale",
          is_available: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "apartments",
  });

  const handleAddApartment = () => {
    append({
      floor_number: "",
      number: "",
      residency_date: "",
      price: "",
      listing_type: "sale",
      is_available: true,
    });
    toast.success("تم إضافة شقة جديدة");
  };

  const handleRemoveApartment = (index: number) => {
    if (fields.length === 1) {
      toast.error("يجب أن يحتوي المبنى على شقة واحدة على الأقل");
      return;
    }
    remove(index);
    toast.success("تم حذف الشقة");
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const formData = new FormData();

      // Multi-language address & description
      formData.append("address[ar]", data.address.ar);
      formData.append("address[en]", data.address.en);
      formData.append("address[ku]", data.address.ku || "");

      formData.append("description[ar]", data.description.ar || "");
      formData.append("description[en]", data.description.en || "");
      formData.append("description[ku]", data.description.ku || "");

      // Building fields
      formData.append("building_date", new Date().toISOString().split("T")[0]);
      formData.append("floor_number", "8"); // You can make this dynamic
      formData.append("apartment_number", String(data.apartments.length));
      formData.append("status", data.is_active ? "active" : "inactive");

      // Apartments
      data.apartments.forEach((apt, index) => {
        formData.append(`apartments[${index}][floor_number]`, apt.floor_number);
        formData.append(`apartments[${index}][number]`, apt.number);
        formData.append(`apartments[${index}][price]`, apt.price);
        formData.append(`apartments[${index}][listing_type]`, apt.listing_type);
        formData.append(
          `apartments[${index}][is_available]`,
          apt.is_available ? "1" : "0"
        );
        formData.append(
          `apartments[${index}][residency_date]`,
          apt.residency_date || ""
        );
      });

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("لم يتم العثور على رمز الدخول");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في إضافة المبنى");
      }

      toast.success("تم إضافة المبنى بنجاح ✅");
      router.push("/buildings");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إضافة المبنى");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/buildings");
  };

  const formatPrice = (price: string) => {
    if (!price) return "";
    return new Intl.NumberFormat('ar-IQ').format(Number(price));
  };

  const languageLabels = {
    ar: "العربية",
    en: "English",
    ku: "کوردی"
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إضافة مبنى جديد</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            أضف مبنى جديد إلى المجمع مع تحديد الشقق المتوفرة
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Building2 className="w-5 h-5" />
              المعلومات الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language Selector */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <Label className="text-gray-700 dark:text-gray-300">اللغة:</Label>
              <div className="flex gap-2">
                {(["ar", "en", "ku"] as const).map((lang) => (
                  <Button
                    key={lang}
                    type="button"
                    variant={currentLang === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentLang(lang)}
                    className={currentLang === lang 
                      ? "bg-blue-600 text-white" 
                      : "dark:border-gray-600 dark:text-gray-300"
                    }
                  >
                    {languageLabels[lang]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Address Fields */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <Label className="text-gray-700 dark:text-gray-300 font-medium">
                  العنوان ({languageLabels[currentLang]})
                  {(currentLang === "ar" || currentLang === "en") && <span className="text-red-500 mr-1">*</span>}
                </Label>
              </div>
              
              <Controller
                name={`address.${currentLang}`}
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={`أدخل عنوان المبنى باللغة ${languageLabels[currentLang]}`}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    dir={currentLang === "ar" || currentLang === "ku" ? "rtl" : "ltr"}
                  />
                )}
              />
              {form.formState.errors.address?.[currentLang] && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.address[currentLang]?.message}
                </p>
              )}
            </div>

            {/* Description Fields */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <Label className="text-gray-700 dark:text-gray-300 font-medium">
                  الوصف ({languageLabels[currentLang]}) - اختياري
                </Label>
              </div>
              
              <Controller
                name={`description.${currentLang}`}
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder={`وصف المبنى باللغة ${languageLabels[currentLang]} (اختياري)`}
                    rows={3}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    dir={currentLang === "ar" || currentLang === "ku" ? "rtl" : "ltr"}
                  />
                )}
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <Label className="text-base font-medium text-gray-900 dark:text-white">
                  حالة المبنى
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  تحديد ما إذا كان المبنى نشطاً ومتاحاً للعرض
                </p>
              </div>
              <Controller
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Badge variant={field.value ? "default" : "secondary"}>
                      {field.value ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Apartments Section */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                إدارة الشقق
                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                  {fields.length} شقة
                </Badge>
              </div>
              <Button
                type="button"
                onClick={handleAddApartment}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة شقة
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        شقة رقم {index + 1}
                      </span>
                    </div>
                    {fields.length > 1 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-600">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-white">
                              تأكيد الحذف
                            </AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                              هل أنت متأكد من حذف هذه الشقة؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                              إلغاء
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveApartment(index)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Floor Number */}
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        رقم الطابق *
                      </Label>
                      <Controller
                        name={`apartments.${index}.floor_number`}
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            placeholder="مثال: 1"
                            className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          />
                        )}
                      />
                      {form.formState.errors.apartments?.[index]?.floor_number && (
                        <p className="text-xs text-red-500 mt-1">
                          {form.formState.errors.apartments[index]?.floor_number?.message}
                        </p>
                      )}
                    </div>

                    {/* Apartment Number */}
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        رقم الشقة *
                      </Label>
                      <Controller
                        name={`apartments.${index}.number`}
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="مثال: 101"
                            className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          />
                        )}
                      />
                      {form.formState.errors.apartments?.[index]?.number && (
                        <p className="text-xs text-red-500 mt-1">
                          {form.formState.errors.apartments[index]?.number?.message}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        السعر (د.ع) *
                      </Label>
                      <Controller
                        name={`apartments.${index}.price`}
                        control={form.control}
                        render={({ field }) => (
                          <div className="relative">
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="1000"
                              placeholder="مثال: 50000000"
                              className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                            {field.value && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatPrice(field.value)} د.ع
                              </div>
                            )}
                          </div>
                        )}
                      />
                      {form.formState.errors.apartments?.[index]?.price && (
                        <p className="text-xs text-red-500 mt-1">
                          {form.formState.errors.apartments[index]?.price?.message}
                        </p>
                      )}
                    </div>

                    {/* Listing Type */}
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm">
                        نوع العرض *
                      </Label>
                      <Controller
                        name={`apartments.${index}.listing_type`}
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sale">للبيع</SelectItem>
                              <SelectItem value="rent">للإيجار</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.apartments?.[index]?.listing_type && (
                        <p className="text-xs text-red-500 mt-1">
                          {form.formState.errors.apartments[index]?.listing_type?.message}
                        </p>
                      )}
                    </div>

                    {/* Residency Date */}
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        تاريخ السكن - اختياري
                      </Label>
                      <Controller
                        name={`apartments.${index}.residency_date`}
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="date"
                            className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          />
                        )}
                      />
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-2 mt-6">
                      <Controller
                        name={`apartments.${index}.is_available`}
                        control={form.control}
                        render={({ field }) => (
                          <>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Badge variant={field.value ? "default" : "secondary"}>
                              {field.value ? "متاحة" : "محجوزة"}
                            </Badge>
                          </>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {form.formState.errors.apartments && (
              <p className="text-sm text-red-500">
                {form.formState.errors.apartments.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
            className="min-w-[120px] dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={saving || !form.formState.isValid}
            className="min-w-[160px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جارٍ الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                حفظ المبنى
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}