"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, EyeOff, User } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          toast.error("❌ لم يتم العثور على رمز الدخول")
          return
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (res.status === 403) {
          toast.error("🚫 غير مصرح لك بمشاهدة هذه الصفحة")
          setLoading(false)
          return
        }

        if (!res.ok) {
          toast.error("⚠️ حصل خطأ أثناء تحميل البيانات")
          setLoading(false)
          return
        }

        const json = await res.json()
        setProfile(json.data)
      } catch (err) {
        toast.error("⚡ خطأ في الاتصال بالسيرفر")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center text-gray-600 dark:text-gray-300">
        ⏳ جاري التحميل...
      </div>
    )

  if (!profile)
    return (
      <div className="p-6 flex items-center justify-center text-gray-600 dark:text-gray-300">
        ⚠️ لا توجد بيانات بروفايل
      </div>
    )

  const profileData = [
    { id: 1, info: "اسم المستخدم", value: profile.name, type: "text" },
    { id: 2, info: "البريد الإلكتروني", value: profile.email, type: "email" },
    { id: 3, info: "كلمة المرور", value: "********", actualValue: "••••••••", type: "password" },
    { id: 4, info: "الصلاحيات", value: profile.permissions?.join(", ") || "—", type: "text" },
    { id: 5, info: "تاريخ الإنشاء", value: new Date(profile.created_at).toLocaleDateString("ar-EG"), type: "text" },
  ]

  const handleEditProfileClick = async () => {
    try {
      setBtnLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 800)) // محاكاة تحميل قصير
      router.push("/profile/edit")
    } finally {
      setBtnLoading(false)
    }
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white dark:bg-gray-900 shadow-md rounded-2xl border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              البروفايل
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">بيانات السوبر ادمن</p>
          </div>
          <Button
            onClick={handleEditProfileClick}
            disabled={btnLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            {btnLoading ? "⏳ جاري الفتح..." : "✏️ تعديل بيانات البروفايل"}
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 text-sm font-semibold">
                <TableHead className="text-center text-gray-700 dark:text-gray-300 w-[60px]">#</TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-300">المعلومة</TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-300">القيمة</TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-300">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {profileData.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <TableCell className="text-center font-semibold text-gray-900 dark:text-gray-200">
                    {item.id}
                  </TableCell>
                  <TableCell className="text-right text-gray-800 dark:text-gray-300">{item.info}</TableCell>
                  <TableCell className="text-right text-gray-800 dark:text-gray-200">
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
                        className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
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
