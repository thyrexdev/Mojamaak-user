"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, User } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type Profile = {
  id: number
  name: string
  email: string
  permissions?: string[]
}

export default function EditProfilePage() {
  const router = useRouter()

  // Profile (name/email)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [profileErr, setProfileErr] = useState<string | null>(null)

  // Password
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword,   setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<string | null>(null)
  const [pwdErr, setPwdErr] = useState<string | null>(null)

  // Load current profile
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("لم يتم العثور على التوكن")

        const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          const t = await res.text()
          throw new Error(`فشل جلب البيانات (${res.status}) → ${t}`)
        }

        const json = await res.json()
        // API shape: { code, message, data: { id, name, email, ... } }
        const data: Profile | undefined = json?.data
        if (data) {
          setName(data.name ?? "")
          setEmail(data.email ?? "")
          // also refresh localStorage for navbar defaults
          const admin = { id: data.id, name: data.name, email: data.email, permissions: data.permissions || [] }
          localStorage.setItem("admin", JSON.stringify(admin))
        } else {
          // fallback from localStorage if API returns nothing
          const cached = localStorage.getItem("admin")
          if (cached) {
            const obj = JSON.parse(cached)
            setName(obj?.name ?? "")
            setEmail(obj?.email ?? "")
          }
        }
      } catch (e: any) {
        console.error(e)
        // fallback to cached values so the form isn’t empty
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
    setProfileMsg(null)
    setProfileErr(null)
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
        body: form, // form-data per your Postman screenshots
      })

      if (!res.ok) {
        const t = await res.text()
        throw new Error(`فشل التحديث (${res.status}) → ${t}`)
      }

      const json = await res.json()
      const updated: Profile | undefined = json?.data
      if (updated) {
        // keep localStorage in sync (used by your navbar)
        localStorage.setItem(
          "admin",
          JSON.stringify({
            id: updated.id,
            name: updated.name,
            email: updated.email,
            permissions: updated.permissions || [],
          })
        )
      }
      setProfileMsg("تم حفظ البيانات بنجاح")
    } catch (e: any) {
      console.error(e)
      setProfileErr(e?.message || "حدث خطأ غير متوقع")
    } finally {
      setSaving(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    setPwdMsg(null)
    setPwdErr(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdErr("من فضلك املأ جميع حقول كلمة المرور")
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdErr("تأكيد كلمة المرور غير مطابق")
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
          body: form, // form-data per your Postman screenshot
        }
      )

      if (!res.ok) {
        const t = await res.text()
        throw new Error(`فشل تغيير كلمة المرور (${res.status}) → ${t}`)
      }

      setPwdMsg("تم تغيير كلمة المرور بنجاح")
      // clear inputs
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (e: any) {
      console.error(e)
      setPwdErr(e?.message || "حدث خطأ غير متوقع")
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
          {/* ====== Section 1: Basic Info (name/email) ====== */}
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900">البيانات الأساسية</h3>

            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-right block">
                الاسم الكامل<span className="text-red-500">*</span>
              </Label>
              <Input
                id="full-name"
                placeholder="الاسم"
                dir="rtl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-right block">
                البريد الإلكتروني<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  placeholder="example@domain.com"
                  className="pl-12 text-right"
                  dir="rtl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || saving}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {profileMsg && <p className="text-green-600 text-sm">{profileMsg}</p>}
            {profileErr && <p className="text-red-600 text-sm">{profileErr}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                إلغاء
              </Button>
              <Button onClick={handleSaveProfile} disabled={saving || loading} className="bg-primary-500 hover:bg-primary-600 text-white">
                {saving ? "جارٍ الحفظ..." : "حفظ البيانات"}
              </Button>
            </div>
          </div>

          {/* ====== Section 2: Change Password ====== */}
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900">تغيير كلمة المرور</h3>

            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-right block">
                كلمة المرور الحالية<span className="text-red-500">*</span>
              </Label>
              <Input
                id="current-password"
                type="password"
                placeholder="********"
                dir="rtl"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={pwdSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block">
                كلمة المرور الجديدة<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="pl-12 text-right"
                  dir="rtl"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={pwdSaving}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-8 h-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-right block">
                تأكيد كلمة المرور<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="********"
                  className="pl-12 text-right"
                  dir="rtl"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={pwdSaving}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-8 h-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {pwdMsg && <p className="text-green-600 text-sm">{pwdMsg}</p>}
            {pwdErr && <p className="text-red-600 text-sm">{pwdErr}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                إلغاء
              </Button>
              <Button onClick={handleChangePassword} disabled={pwdSaving} className="bg-primary-500 hover:bg-primary-600 text-white">
                {pwdSaving ? "جارٍ التعديل..." : "تغيير كلمة المرور"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
