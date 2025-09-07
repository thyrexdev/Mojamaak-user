"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type Apartment = {
  id: number
  floor_number: number | string
  number: string
  residency_date: string | null
  price: string
  listing_type: string
  is_available: boolean
  building?: { id: number; address: string }
}

type UserProfile = {
  id: number
  name: string
  email: string
  phone?: string
  apartments?: Apartment[]
}

type Meta = {
  total?: number
  count?: number
  per_page?: number
  current_page?: number
  total_pages?: number
  next_page_url?: string | null
  prev_page_url?: string | null
}

type MaintRow = {
  id: number
  title: string
  status: "pending" | "confirmed" | "in_progress" | "rejected" | "completed"
  complex?: { name?: string; building?: { address?: string; apartment?: { number?: string | number } } }
  maintenance_department?: { id: number; name: string }
  maintenance_company?: { id: number; name: string } | null
  assigned_at?: string | null
  created_at: string
}

type VisitRow = {
  id: number
  visiter_name: string
  visiter_phone: string
  visit_date: string
  visit_time: string
  status: "pending" | "confirmed" | "rejected" | string
  created_at: string
}

const statusLabel = (s: string) =>
  s === "pending" ? "قيد المعالجة"
  : s === "confirmed" ? "مقبول"
  : s === "in_progress" ? "قيد التنفيذ"
  : s === "completed" ? "مكتمل"
  : "مرفوض"

const statusBadge = (s: string) =>
  s === "confirmed" || s === "completed"
    ? "bg-green-50 text-green-700 border border-green-300"
    : s === "rejected"
    ? "bg-red-50 text-red-700 border border-red-300"
    : "bg-yellow-50 text-yellow-700 border border-yellow-300"

export default function ResidentDetailsPage() {
  const params = useParams<{ id: string }>()
  const userId = params?.id
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // maintenance paginated
  const [maint, setMaint] = useState<MaintRow[]>([])
  const [maintMeta, setMaintMeta] = useState<Meta>({})
  const [loadingMaint, setLoadingMaint] = useState(true)

  // visits paginated
  const [visits, setVisits] = useState<VisitRow[]>([])
  const [visitMeta, setVisitMeta] = useState<Meta>({})
  const [loadingVisits, setLoadingVisits] = useState(true)

  const perPage = 10

  const authHeader = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لم يتم العثور على رمز الدخول"
      })
      throw new Error("Token not found")
    }
    return { Authorization: `Bearer ${token}` }
  }

  const loadProfile = async () => {
    setLoadingProfile(true)
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/users/${userId}`,
        { headers: authHeader() }
      )
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في تحميل بيانات الساكن"
        })
        return
      }
      const json = await res.json()
      const data = json?.data ?? json
      setProfile(data)
    } catch (e) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء تحميل بيانات الساكن"
      })
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadMaint = async (page = 1) => {
    setLoadingMaint(true)
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/users/${userId}/maintenance-requests?per_page=${perPage}&page=${page}`,
        { headers: authHeader() }
      )
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في تحميل طلبات الصيانة"
        })
        return
      }
      const json = await res.json()
      const block = json?.data ?? json
      setMaint(block?.maintenance_requests ?? [])
      setMaintMeta(block?.meta ?? {})
    } catch (e) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء تحميل طلبات الصيانة"
      })
    } finally {
      setLoadingMaint(false)
    }
  }

  const loadVisits = async (page = 1) => {
    setLoadingVisits(true)
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/users/${userId}/visit-requests?per_page=${perPage}&page=${page}`,
        { headers: authHeader() }
      )
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في تحميل طلبات الزيارة"
        })
        return
      }
      const json = await res.json()
      const block = json?.data ?? json
      setVisits(block?.visit_requests ?? [])
      setVisitMeta(block?.meta ?? {})
    } catch (e) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء تحميل طلبات الزيارة"
      })
    } finally {
      setLoadingVisits(false)
    }
  }

  useEffect(() => {
    if (!userId) return
    loadProfile()
    loadMaint(1)
    loadVisits(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return (
    <div className="p-6 font-arabic space-y-6" dir="rtl">
      {/* Profile */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">بيانات الساكن</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {loadingProfile ? (
            <p className="py-6 text-center">جارٍ التحميل...</p>
          ) : profile ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-gray-500">الاسم</div><div className="font-medium">{profile.name}</div></div>
              <div><div className="text-sm text-gray-500">البريد الإلكتروني</div><div className="font-medium">{profile.email}</div></div>
              <div><div className="text-sm text-gray-500">الهاتف</div><div className="font-medium">{profile.phone || "—"}</div></div>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500">لا توجد بيانات</div>
          )}
        </CardContent>
      </Card>

      {/* Apartments */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">شقق الساكن</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {!profile || profile.apartments?.length === 0 ? (
            <div className="py-6 text-center text-gray-500">لا توجد شقق</div>
          ) : (
            <div className="grid gap-3">
              {profile.apartments!.map((apt) => (
                <div key={apt.id} className="rounded-lg border p-3 flex flex-wrap gap-4 text-sm">
                  <div>المبنى: <span className="font-medium">{apt.building?.address ?? "—"}</span></div>
                  <div>رقم الشقة: <span className="font-medium">{apt.number}</span></div>
                  <div>الطابق: <span className="font-medium">{apt.floor_number}</span></div>
                  <div>السعر: <span className="font-medium">{apt.price}</span></div>
                  <div>النوع: <span className="font-medium">{apt.listing_type}</span></div>
                  <div>الحالة: <span className="font-medium">{apt.is_available ? "متاحة" : "محجوزة"}</span></div>
                  {apt.residency_date && (
                    <div>تاريخ السكن: <span className="font-medium">
                      {new Date(apt.residency_date).toLocaleDateString("fr-FR")}
                    </span></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance requests */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">طلبات الصيانة</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {loadingMaint ? (
            <p className="py-6 text-center">جارٍ التحميل...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 text-sm font-semibold">
                    <TableHead className="text-center w-[60px]">#</TableHead>
                    <TableHead className="text-right">القسم</TableHead>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-center">الشقة</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maint.map((r, idx) => {
                    const aptNum = r?.complex?.building?.apartment?.number ?? "—"
                    const created = r.created_at ? new Date(r.created_at).toISOString().slice(0,10) : "-"
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-center">
                          {((maintMeta.current_page ?? 1) - 1) * (maintMeta.per_page ?? 10) + (idx + 1)}
                        </TableCell>
                        <TableCell className="text-right">{r.maintenance_department?.name ?? "-"}</TableCell>
                        <TableCell className="text-right">{r.title}</TableCell>
                        <TableCell className="text-center">{aptNum}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>
                            {statusLabel(r.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{created}</TableCell>
                      </TableRow>
                    )
                  })}
                  {maint.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-gray-500">لا توجد طلبات</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>الصفحة {maintMeta.current_page ?? 1} من {maintMeta.total_pages ?? 1}</span>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={(maintMeta.current_page ?? 1) <= 1}
                    onClick={() => loadMaint((maintMeta.current_page ?? 1) - 1)}
                  >
                    السابق
                  </button>
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={(maintMeta.current_page ?? 1) >= (maintMeta.total_pages ?? 1)}
                    onClick={() => loadMaint((maintMeta.current_page ?? 1) + 1)}
                  >
                    التالي
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Visit requests */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">طلبات الزيارة</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {loadingVisits ? (
            <p className="py-6 text-center">جارٍ التحميل...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 text-sm font-semibold">
                    <TableHead className="text-center w-[60px]">#</TableHead>
                    <TableHead className="text-right">اسم الزائر</TableHead>
                    <TableHead className="text-center">الهاتف</TableHead>
                    <TableHead className="text-center">التاريخ</TableHead>
                    <TableHead className="text-center">الوقت</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((v, idx) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-center">
                        {((visitMeta.current_page ?? 1) - 1) * (visitMeta.per_page ?? 10) + (idx + 1)}
                      </TableCell>
                      <TableCell className="text-right">{v.visiter_name}</TableCell>
                      <TableCell className="text-center">{v.visiter_phone}</TableCell>
                      <TableCell className="text-center">{v.visit_date}</TableCell>
                      <TableCell className="text-center">{v.visit_time}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{statusLabel(v.status)}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {visits.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-gray-500">لا توجد طلبات</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>الصفحة {visitMeta.current_page ?? 1} من {visitMeta.total_pages ?? 1}</span>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={(visitMeta.current_page ?? 1) <= 1}
                    onClick={() => loadVisits((visitMeta.current_page ?? 1) - 1)}
                  >
                    السابق
                  </button>
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={(visitMeta.current_page ?? 1) >= (visitMeta.total_pages ?? 1)}
                    onClick={() => loadVisits((visitMeta.current_page ?? 1) + 1)}
                  >
                    التالي
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
