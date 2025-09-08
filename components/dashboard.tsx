"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Trash2, Upload, Loader2, Image as ImageIcon, MapPin, Building2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Zod validation schema
const complexSchema = z.object({
  name_en: z.string().min(1, "الاسم باللغة الإنجليزية مطلوب"),
  name_ar: z.string().optional(),
  name_ku: z.string().optional(),
  location_en: z.string().min(1, "الموقع باللغة الإنجليزية مطلوب"),
  location_ar: z.string().optional(),
  location_ku: z.string().optional(),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  description_ku: z.string().optional(),
  is_popular: z.boolean(),
})

type FormData = z.infer<typeof complexSchema>

type Contact = {
  id: number
  type: string
  value: string
  type_translations?: Record<string, string>
}

type Complex = {
  id: number
  name: string
  location: string | null
  description: string | null
  logo: string | null
  is_popular: number
  contacts: Contact[]
  images: { id: number; url: string }[]
  translations?: any
}

export default function CompoundProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [complex, setComplex] = useState<Complex | null>(null)
  const [uploadFormData, setUploadFormData] = useState<globalThis.FormData | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(complexSchema),
    defaultValues: {
      name_en: "",
      name_ar: "",
      name_ku: "",
      location_en: "",
      location_ar: "",
      location_ku: "",
      description_en: "",
      description_ar: "",
      description_ku: "",
      is_popular: false,
    }
  })

  const fetchComplex = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/complex`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      
      if (json.data) {
        setComplex(json.data)
        // Populate form with existing data
        const translations = json.data.translations || {}
        form.reset({
          name_en: translations?.en?.name || "",
          name_ar: translations?.ar?.name || "",
          name_ku: translations?.ku?.name || "",
          location_en: translations?.en?.location || "",
          location_ar: translations?.ar?.location || "",
          location_ku: translations?.ku?.location || "",
          description_en: translations?.en?.description || "",
          description_ar: translations?.ar?.description || "",
          description_ku: translations?.ku?.description || "",
          is_popular: Boolean(json.data.is_popular),
        })
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل البيانات")
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplex()
  }, [])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error("يرجى اختيار ملف صورة صحيح")
      return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)")
      return
    }

    const newFormData = uploadFormData || new globalThis.FormData()
    newFormData.set("logo", file)
    setUploadFormData(newFormData)
    setLogoPreview(URL.createObjectURL(file))
    toast.success("تم اختيار الشعار بنجاح")
  }

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} ليس ملف صورة صحيح`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} حجمه كبير جداً (الحد الأقصى 5 ميجابايت)`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setNewImages(prev => [...prev, ...validFiles])
      toast.success(`تم اختيار ${validFiles.length} صورة`)
    }
  }

  const handleDeleteImage = (id: number) => {
    setImagesToDelete(prev => [...prev, id])
    setComplex(prev => ({
      ...(prev as Complex),
      images: prev?.images?.filter(img => img.id !== id) || [],
    }))
    toast.success("تم حذف الصورة")
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    toast.success("تم إلغاء الصورة")
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const formData = uploadFormData || new globalThis.FormData()

      // Add form data
      formData.set("name[en]", data.name_en)
      formData.set("name[ar]", data.name_ar || "")
      formData.set("name[ku]", data.name_ku || "")
      formData.set("location[en]", data.location_en)
      formData.set("location[ar]", data.location_ar || "")
      formData.set("location[ku]", data.location_ku || "")
      formData.set("description[en]", data.description_en || "")
      formData.set("description[ar]", data.description_ar || "")
      formData.set("description[ku]", data.description_ku || "")
      formData.set("is_popular", String(data.is_popular ? 1 : 0))

      // Add new images
      newImages.forEach((file, idx) => {
        formData.append(`images[${idx}]`, file)
      })

      // Add images to delete
      imagesToDelete.forEach(id => {
        formData.append("delete_images[]", id.toString())
      })

      // Add contacts
      complex?.contacts?.forEach((contact, i) => {
        formData.set(`contacts[${i}][value]`, contact.value)
        formData.set(`contacts[${i}][type]`, contact.type)
        formData.set(`contacts[${i}][type][en]`, contact.type_translations?.en || "")
        formData.set(`contacts[${i}][type][ar]`, contact.type_translations?.ar || "")
        formData.set(`contacts[${i}][type][ku]`, contact.type_translations?.ku || "")
      })

      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/complex/update`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (res.ok) {
        toast.success("تم التحديث بنجاح ✅")
        setUploadFormData(null)
        setNewImages([])
        setImagesToDelete([])
        setLogoPreview(null)
        await fetchComplex()
      } else {
        toast.error("فشل في التحديث ❌")
      }
    } catch (error) {
      toast.error("خطأ أثناء التحديث ❌")
      console.error("Update error:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">جارٍ التحميل...</p>
        </div>
      </div>
    )
  }

  if (!complex) {
    return (
      <Card className="m-6">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-red-500 dark:text-red-400 font-medium">لا توجد بيانات</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              تعذر العثور على بيانات المجمع
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          معلومات المجمع وتحديثها
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo Section */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <ImageIcon className="w-5 h-5" />
              الشعار
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                {logoPreview || complex.logo ? (
                  <div className="relative group">
                    <Image
                      src={logoPreview || complex.logo || ""}
                      alt="شعار المجمع"
                      width={120}
                      height={120}
                      className="rounded-lg border-2 border-gray-200 dark:border-gray-600 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ) : (
                  <div className="w-[120px] h-[120px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">لا يوجد شعار</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="logo-upload" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  رفع شعار جديد
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  الحد الأقصى للحجم: 5 ميجابايت. الصيغ المدعومة: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">الاسم (English) *</Label>
                <Controller
                  name="name_en"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Complex Name"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                />
                {form.formState.errors.name_en && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.name_en.message}</p>
                )}
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">الاسم (العربية)</Label>
                <Controller
                  name="name_ar"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="اسم المجمع"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">الاسم (کوردی)</Label>
                <Controller
                  name="name_ku"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="ناوی کۆمپلێکس"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                />
              </div>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  الموقع (English) *
                </Label>
                <Controller
                  name="location_en"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Location"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                />
                {form.formState.errors.location_en && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.location_en.message}</p>
                )}
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  الموقع (العربية)
                </Label>
                <Controller
                  name="location_ar"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="الموقع"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  الموقع (کوردی)
                </Label>
                <Controller
                  name="location_ku"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="شوێن"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                />
              </div>
            </div>

            <Separator className="dark:bg-gray-600" />

            {/* Descriptions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">الوصف</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">الوصف (English)</Label>
                  <Controller
                    name="description_en"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Complex description..."
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    )}
                  />
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">الوصف (العربية)</Label>
                  <Controller
                    name="description_ar"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="وصف المجمع..."
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    )}
                  />
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">الوصف (کوردی)</Label>
                  <Controller
                    name="description_ku"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="وه‌سفی کۆمپلێکس..."
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images Section */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                صور المجمع
              </span>
              <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                {complex.images.length + newImages.length} صورة
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Images */}
            {complex.images.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">الصور الحالية</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {complex.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <Image
                        src={img.url}
                        alt="صورة المجمع"
                        width={150}
                        height={100}
                        className="w-full h-24 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteImage(img.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">الصور الجديدة</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="صورة جديدة"
                        width={150}
                        height={100}
                        className="w-full h-24 object-cover rounded-md border border-green-300 dark:border-green-600"
                      />
                      <Badge className="absolute bottom-1 left-1 text-xs bg-green-500">جديد</Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewImage(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <Label htmlFor="images-upload" className="text-gray-700 dark:text-gray-300">
                رفع صور جديدة
              </Label>
              <Input
                id="images-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesUpload}
                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                يمكنك اختيار عدة صور. الحد الأقصى لكل صورة: 5 ميجابايت
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            disabled={saving || !form.formState.isValid}
            className="min-w-[200px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جارٍ الحفظ...
              </>
            ) : (
              "حفظ التعديلات"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}