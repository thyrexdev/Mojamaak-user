"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type VisitStatus = "pending" | "accepted" | "rejected"

type VisitRequest = {
  id: number
  visiter_name: string
  visiter_phone: string
  visit_date: string
  visit_time: string
  description?: string
  status: VisitStatus
  user?: {
    id: number
    name: string
  }
}

export default function VisitRequestDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [visit, setVisit] = useState<VisitRequest | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchVisitDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "لم يتم العثور على رمز الدخول"
        })
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/visit-requests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في تحميل تفاصيل الزيارة"
        })
        return
      }

      const json = await res.json()
      setVisit(json.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء تحميل تفاصيل الزيارة"
      })
    } finally {
      setLoading(false)
    }
  }
const updateStatus = async (newStatus: VisitStatus) => {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لم يتم العثور على رمز الدخول"
      })
      return
    }

    const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/visit-requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!res.ok) {
      const errorBody = await res.text()
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب"
      })
      return
    }

    setVisit((prev) => (prev ? { ...prev, status: newStatus } : prev))
    toast({
      title: "نجاح",
      description: `تم ${newStatus === 'accepted' ? 'قبول' : 'رفض'} طلب الزيارة بنجاح`
    })
  } catch (error) {
    toast({
      variant: "destructive",
      title: "خطأ",
      description: "حدث خطأ غير متوقع أثناء تحديث حالة الطلب"
    })
  }
}


  const handleAccept = () => updateStatus("accepted")
  const handleReject = () => updateStatus("rejected")
  const handleCancel = () => router.back()

  useEffect(() => {
    if (id) fetchVisitDetails()
  }, [id])

  if (loading) {
    return <p className="text-center mt-8 text-gray-500">جاري تحميل التفاصيل...</p>
  }

  if (!visit) {
    return <p className="text-center mt-8 text-red-500">لم يتم العثور على الطلب</p>
  }

  const getStatusLabel = (status: VisitStatus) => {
    switch (status) {
      case "accepted": return "مقبول"
      case "rejected": return "مرفوض"
      case "pending":
      default: return "قيد المعالجة"
    }
  }

  const getBadgeVariant = (status: VisitStatus) => {
    switch (status) {
      case "accepted": return "default"
      case "rejected": return "destructive"
      case "pending":
      default: return "outline"
    }
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            تفاصيل طلب الزيارة رقم {visit.id}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-right">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">اسم الزائر</p>
              <p className="text-base font-medium text-gray-800">{visit.visiter_name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">هاتف الزائر</p>
              <p className="text-base font-medium text-gray-800">{visit.visiter_phone}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">تاريخ الزيارة</p>
              <p className="text-base font-medium text-gray-800">{visit.visit_date}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">الوقت</p>
              <p className="text-base font-medium text-gray-800">{visit.visit_time}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">اسم الساكن</p>
              <p className="text-base font-medium text-gray-800">{visit.user?.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">حالة الطلب</p>
              <Badge variant={getBadgeVariant(visit.status)}>
                {getStatusLabel(visit.status)}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">وصف الطلب</p>
            <p className="text-base text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md border">
              {visit.description || "لا يوجد وصف"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              الرجوع
            </Button>
<Button
  variant="destructive"
  onClick={handleReject}
  disabled={visit.status === "rejected"}
>
  رفض الطلب
</Button>
<Button
  variant="default"
  onClick={handleAccept}
  className="bg-green-600 hover:bg-green-700 text-white"
  disabled={visit.status === "accepted"}
>
  قبول الطلب
</Button>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}