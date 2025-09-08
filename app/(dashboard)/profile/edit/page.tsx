"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, User } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// ✅ Validation Schemas
const profileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "كلمة المرور الحالية مطلوبة"),
    newPassword: z.string().min(6, "كلمة المرور الجديدة قصيرة جداً"),
    confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "تأكيد كلمة المرور غير مطابق",
    path: ["confirmPassword"],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ✅ Forms
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  // ✅ Load profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("لم يتم العثور على التوكن")

        const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("فشل جلب البيانات")

        const json = await res.json()
        const data = json?.data
        if (data) {
          profileForm.reset({ name: data.name, email: data.email })
          localStorage.setItem("admin", JSON.stringify(data))
        }
      } catch (err: any) {
        toast.error(err?.message || "⚠️ خطأ في تحميل البيانات")
        // fallback localStorage
        const cached = localStorage.getItem("admin")
        if (cached) {
          const obj = JSON.parse(cached)
          profileForm.reset({ name: obj?.name ?? "", email: obj?.email ?? "" })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // ✅ Save profile
  const onSaveProfile = async (values: ProfileForm) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن")

      const form = new FormData()
      form.append("name", values.name)
      form.append("email", values.email)

      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })

      if (!res.ok) throw new Error("فشل التحديث")

      toast.success("✅ تم حفظ البيانات بنجاح")
    } catch (err: any) {
      toast.error(err?.message || "❌ حدث خطأ غير متوقع")
    }
  }

  // ✅ Change password
  const onChangePassword = async (values: PasswordForm) => {
    setPwdSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن")

      const form = new FormData()
      form.append("current_password", values.currentPassword)
      form.append("password", values.newPassword)
      form.append("password_confirmation", values.confirmPassword)

      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/profile/password/update`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })

      if (!res.ok) throw new Error("فشل تغيير كلمة المرور")

      toast.success("🔑 تم تغيير كلمة المرور بنجاح")
      passwordForm.reset()
    } catch (err: any) {
      toast.error(err?.message || "⚠️ حدث خطأ أثناء تغيير كلمة المرور")
    } finally {
      setPwdSaving(false)
    }
  }

  const handleCancel = () => router.push("/profile")

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            تعديل بيانات البروفايل
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-10">
          {/* البيانات الأساسية */}
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">البيانات الأساسية</h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">الاسم الكامل</Label>
              <Input id="name" dir="rtl" {...profileForm.register("name")} disabled={loading} />
              {profileForm.formState.errors.name && (
                <p className="text-red-500 text-sm">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">البريد الإلكتروني</Label>
              <Input id="email" dir="rtl" {...profileForm.register("email")} disabled={loading} />
              {profileForm.formState.errors.email && (
                <p className="text-red-500 text-sm">{profileForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleCancel}>إلغاء</Button>
              <Button type="submit" disabled={loading}>
                {profileForm.formState.isSubmitting ? "⏳ جاري الحفظ..." : "💾 حفظ البيانات"}
              </Button>
            </div>
          </form>

          {/* تغيير كلمة المرور */}
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">تغيير كلمة المرور</h3>

            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">كلمة المرور الحالية</Label>
              <Input id="currentPassword" type="password" dir="rtl" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-red-500 text-sm">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">كلمة المرور الجديدة</Label>
              <Input id="newPassword" type={showPassword ? "text" : "password"} dir="rtl" {...passwordForm.register("newPassword")} />
              <Button type="button" variant="ghost" size="icon" className="absolute top-7 left-2" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-sm">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">تأكيد كلمة المرور</Label>
              <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} dir="rtl" {...passwordForm.register("confirmPassword")} />
              <Button type="button" variant="ghost" size="icon" className="absolute top-7 left-2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </Button>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleCancel}>إلغاء</Button>
              <Button type="submit" disabled={pwdSaving}>
                {pwdSaving ? "⏳ جاري التعديل..." : "🔑 تغيير كلمة المرور"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
