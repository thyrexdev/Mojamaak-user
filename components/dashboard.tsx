"use client"

import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Image from "next/image"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

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
  const [complex, setComplex] = useState<Complex | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchComplex = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/complex`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setComplex(json.data || null)
    } catch (e) {
      setErrorMsg("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplex()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isLogo = false) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFormData = formData || new FormData()
    if (isLogo) {
      newFormData.set("logo", files[0])
      setLogoPreview(URL.createObjectURL(files[0]))
    } else {
      Array.from(files).forEach((file, idx) => {
        newFormData.append(`images[${idx}]`, file)
      })
    }
    setFormData(newFormData)
  }

  const handleDeleteImage = (id: number) => {
    const newFormData = formData || new FormData()
    newFormData.append("delete_images[]", id.toString())
    setFormData(newFormData)
    setComplex((prev) => ({
      ...(prev as Complex),
      images: prev?.images?.filter((img) => img.id !== id) || [],
    }))
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token")
      const data = formData || new FormData()

      const translations = complex?.translations || {}

      data.set("name[en]", translations?.en?.name || "")
      data.set("location[en]", translations?.en?.location || "")
      data.set("description[en]", translations?.en?.description || "")

      data.set("name[ar]", translations?.ar?.name || "")
      data.set("location[ar]", translations?.ar?.location || "")
      data.set("description[ar]", translations?.ar?.description || "")

      data.set("name[ku]", translations?.ku?.name || "")
      data.set("location[ku]", translations?.ku?.location || "")
      data.set("description[ku]", translations?.ku?.description || "")

      data.set("is_popular", String(complex?.is_popular || 0))

      complex?.contacts?.forEach((contact, i) => {
        data.set(`contacts[${i}][value]`, contact.value)
        data.set(`contacts[${i}][type]`, contact.type)
        data.set(`contacts[${i}][type][en]`, contact.type_translations?.en || "")
        data.set(`contacts[${i}][type][ar]`, contact.type_translations?.ar || "")
        data.set(`contacts[${i}][type][ku]`, contact.type_translations?.ku || "")
      })

      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/complex/update`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })

      if (res.ok) {
        alert("✅ تم التحديث بنجاح")
        fetchComplex()
      } else {
        alert("❌ فشل في التحديث")
      }
    } catch (e) {
      alert("❌ خطأ أثناء التحديث")
    }
  }

  if (loading) return <p className="p-6">جارٍ التحميل...</p>
  if (!complex) return <p className="p-6 text-red-500">{errorMsg || "لا توجد بيانات"}</p>

return (
  <div className="p-6 font-arabic space-y-6" dir="rtl">
    <h1 className="text-xl font-semibold mb-4">معلومات المجمع وتحديثها</h1>

    {/* Section: Logo + Name + Location */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>الشعار</Label>
        {logoPreview || complex.logo ? (
          <Image
            src={logoPreview || complex.logo || ""}
            alt="logo"
            width={120}
            height={120}
            className="rounded-md"
          />
        ) : (
          <div className="text-sm text-gray-400">لا يوجد شعار</div>
        )}
        <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label>الاسم (en)</Label>
        <Input
          value={complex.translations?.en?.name || ""}
          onChange={(e) =>
            setComplex((c) => ({
              ...(c as Complex),
              translations: {
                ...c?.translations,
                en: { ...(c?.translations?.en || {}), name: e.target.value },
              },
            }))
          }
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>الموقع (en)</Label>
        <Input
          value={complex.translations?.en?.location || ""}
          onChange={(e) =>
            setComplex((c) => ({
              ...(c as Complex),
              translations: {
                ...c?.translations,
                en: { ...(c?.translations?.en || {}), location: e.target.value },
              },
            }))
          }
        />
      </div>
    </div>

    {/* Section: Description */}
    <div>
      <Label className="mb-1 block">الوصف (en)</Label>
      <Textarea
        rows={3}
        value={complex.translations?.en?.description || ""}
        onChange={(e) =>
          setComplex((c) => ({
            ...(c as Complex),
            translations: {
              ...c?.translations,
              en: { ...(c?.translations?.en || {}), description: e.target.value },
            },
          }))
        }
      />
    </div>

    {/* Section: Images */}
    <div>
      <Label className="mb-2 block">الصور الحالية</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {complex.images.map((img) => (
          <div key={img.id} className="relative">
            <Image src={img.url} alt="img" width={300} height={200} className="rounded-md" />
            <button
              type="button"
              className="absolute top-0 right-0 p-1 bg-white shadow rounded-bl"
              onClick={() => handleDeleteImage(img.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>
      <Input type="file" multiple onChange={(e) => handleImageUpload(e, false)} className="mt-3" />
    </div>

    {/* Section: Submit */}
    <div className="pt-4">
      <Button className="bg-primary-500 text-white" onClick={handleSubmit}>
        حفظ التعديلات
      </Button>
    </div>
  </div>
)

}
