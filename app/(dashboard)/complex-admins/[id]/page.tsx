"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function ComplexAdminDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unlinking, setUnlinking] = useState(false)

  const fetchAdmin = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/complex-admins/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const json = await res.json()
      setAdmin(json.data)
    } catch (err) {
      console.error("خطأ في تحميل الإداري:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlink = async () => {
    try {
      setUnlinking(true)
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/complex-admins/${id}/unlink`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      const json = await res.json()
      if (json.code === 200) {
        await fetchAdmin()
      } else {
        console.error("فشل في إلغاء الربط:", json)
      }
    } catch (err) {
      console.error("خطأ في إلغاء الربط:", err)
    } finally {
      setUnlinking(false)
    }
  }

  useEffect(() => {
    if (id) fetchAdmin()
  }, [id])

  if (loading) return <div className="p-6">جاري التحميل...</div>
  if (!admin) return <div className="p-6">لم يتم العثور على الإداري</div>

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              تفاصيل الإداري
            </CardTitle>
            <p className="text-sm text-gray-500">
              عرض بيانات الإداري والمجمع المرتبط به.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              router.push("/dashboard/complex-admin/complex-admins")
            }
          >
            رجوع للقائمة
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-6">
          {/* بيانات الإداري */}
          <div>
            <h2 className="text-lg font-bold">{admin.name}</h2>
            <p className="text-gray-600">{admin.email}</p>
          </div>

          {/* بيانات المجمع + زرار إلغاء الربط */}
          {admin.residential_complex ? (
            <div className="flex items-center justify-between border p-4 rounded-lg">
              <div className="flex items-center gap-4">
                {admin.residential_complex.logo && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${admin.residential_complex.logo}`}
                    alt={admin.residential_complex.name}
                    width={80}
                    height={80}
                    className="rounded-md border"
                  />
                )}
                <div>
                  <h3 className="font-semibold">
                    {admin.residential_complex.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {admin.residential_complex.description}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                disabled={unlinking}
                onClick={handleUnlink}
              >
                {unlinking ? "جاري إلغاء الربط..." : "إلغاء الربط"}
              </Button>
            </div>
          ) : (
            <p className="text-gray-500">غير مربوط بأي مجمع حاليًا.</p>
          )}

          {/* Metadata */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>
              تم الإنشاء:{" "}
              {new Date(admin.created_at).toLocaleString("ar-EG")}
            </p>
            <p>
              آخر تحديث:{" "}
              {new Date(admin.updated_at).toLocaleString("ar-EG")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
