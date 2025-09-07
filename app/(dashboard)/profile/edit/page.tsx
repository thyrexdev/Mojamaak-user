"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type Profile = {
  id: number
  name: string
  email: string
  permissions?: string[]
}

export default function EditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()

  // Profile states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // Password states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwdSaving, setPwdSaving] = useState(false)

  // Load profile from API (fallback: localStorage)
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("لم يتم العثور على التوكن")

        const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error(`فشل جلب البيانات (${res.status})`)

        const json = await res.json()
        const data: Profile | undefined = json?.data
        if (data) {
          setName(data.name ?? "")
          setEmail(data.email ?? "")
          localStorage.setItem("admin", JSON.stringify(data))
        }
      } catch (e: any) {
        console.error(e)
        toast({
          variant: "destructive",
          title: "خطأ",
          description: e?.message || "حدث خطأ في تحميل البيانات"
        })
        // fallback للـ localStorage
        const cached = localStorage.getItem("admin")
        if (cached) {
          const obj = JSON.parse(cached)
          setName(obj?.name ?? "")
          setEmail(obj?.email ?? "")
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  // Save profile (name/email)
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن")

      const form = new FormData()
      form.append("name", name)
      form.append("email", email)

      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })

      if (!res.ok) throw new Error(`فشل التحديث (${res.status})`)

      const json = await res.json()
      const updated: Profile | undefined = json?.data
      if (updated) {
        localStorage.setItem("admin", JSON.stringify(updated))
      }
      toast({
        title: "نجاح",
        description: "تم حفظ البيانات بنجاح",
      })
    } catch (e: any) {
      console.error(e)
      toast({
        variant: "destructive",
        title: "خطأ",
        description: e?.message || "حدث خطأ غير متوقع"
      })
    } finally {
      setSaving(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "من فضلك املأ جميع الحقول"
      })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "تأكيد كلمة المرور غير مطابق"
      })
      return
    }

    setPwdSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن")

      const form = new FormData()
      form.append("current_password", currentPassword)
      form.append("password", newPassword)
      form.append("password_confirmation", confirmPassword)

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/profile/password/update`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      )

      if (!res.ok) throw new Error(`فشل تغيير كلمة المرور (${res.status})`)

      toast({
        title: "نجاح",
        description: "تم تغيير كلمة المرور بنجاح"
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (e: any) {
      console.error(e)
      toast({
        variant: "destructive",
        title: "خطأ",
        description: e?.message || "حدث خطأ غير متوقع"
      })
    } finally {
      setPwdSaving(false)
    }
  }

  const handleCancel = () => router.push("/profile")

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            تعديل بيانات البروفايل
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-10">
          {/* ====== البيانات الأساسية ====== */}
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900">البيانات الأساسية</h3>

            <div className="space-y-2">
              <Label htmlFor="full-name">الاسم الكامل</Label>
              <Input
                id="full-name"
                dir="rtl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                dir="rtl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleCancel}>إلغاء</Button>
              <Button onClick={handleSaveProfile} disabled={saving || loading}>
                {saving ? "جارٍ الحفظ..." : "حفظ البيانات"}
              </Button>
            </div>
          </div>

          {/* ====== تغيير كلمة المرور ====== */}
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900">تغيير كلمة المرور</h3>

            <div className="space-y-2">
              <Label htmlFor="current-password">كلمة المرور الحالية</Label>
              <Input
                id="current-password"
                type="password"
                dir="rtl"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={pwdSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                dir="rtl"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={pwdSaving}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                dir="rtl"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={pwdSaving}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleCancel}>إلغاء</Button>
              <Button onClick={handleChangePassword} disabled={pwdSaving}>
                {pwdSaving ? "جارٍ التعديل..." : "تغيير كلمة المرور"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
