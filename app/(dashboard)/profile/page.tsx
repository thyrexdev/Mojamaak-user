"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, EyeOff, User } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (res.status === 403) {
          setError("🚫 غير مصرح لك بمشاهدة هذه الصفحة")
          setLoading(false)
          return
        }

        if (!res.ok) {
          setError("❌ حصل خطأ أثناء تحميل البيانات")
          setLoading(false)
          return
        }

        const json = await res.json()
        setProfile(json.data)
      } catch (err) {
        setError("⚠️ خطأ في الاتصال بالسيرفر")
        console.error("خطأ في تحميل البروفايل:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) return <div className="p-6">⏳ جاري التحميل...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!profile) return <div className="p-6">⚠️ لا توجد بيانات بروفايل</div>

  const profileData = [
    {
      id: 1,
      info: "اسم المستخدم",
      value: profile.name,
      type: "text",
    },
    {
      id: 2,
      info: "البريد الإلكتروني",
      value: profile.email,
      type: "email",
    },
    {
      id: 3,
      info: "كلمة المرور",
      value: "********",
      actualValue: "••••••••", // مش لازم backend يرجع password أصلاً
      type: "password",
    },
    {
      id: 4,
      info: "الصلاحيات",
      value: profile.permissions?.join(", ") || "—",
      type: "text",
    },
    {
      id: 5,
      info: "تاريخ الإنشاء",
      value: new Date(profile.created_at).toLocaleDateString("ar-EG"),
      type: "text",
    },
  ]

  const handleEditProfileClick = () => {
    router.push("/profile/edit")
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              البروفايل
            </CardTitle>
            <p className="text-sm text-gray-500">بيانات السوبر ادمن</p>
          </div>
          <Button
            onClick={handleEditProfileClick}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            تعديل بيانات البروفايل
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 text-sm font-semibold">
                <TableHead className="text-center text-gray-700 w-[60px]">#</TableHead>
                <TableHead className="text-right text-gray-700">المعلومة</TableHead>
                <TableHead className="text-right text-gray-700">القيمة</TableHead>
                <TableHead className="text-center text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {profileData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="text-center font-semibold">{item.id}</TableCell>
                  <TableCell className="text-right">{item.info}</TableCell>
                  <TableCell className="text-right">
                    {item.type === "password"
                      ? showPassword
                        ? item.actualValue
                        : item.value
                      : item.value}
                  </TableCell>
                  <TableCell className="text-left">
                    {item.type === "password" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:bg-gray-100"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
