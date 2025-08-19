"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Search, SlidersHorizontal, Check, X, RotateCcw, Plus } from "lucide-react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type Req = {
  id: number
  title: string
  description: string | null
  status: "waiting" | "confirmed" | "in_progress" | "rejected" | "completed"
  created_at: string
  complex?: {
    building?: { apartment?: { number?: string | null } | null } | null
  } | null
  maintenance_department?: { id: number; name: string } | null
  maintenance_company?: { id: number; name: string } | null
}

type Company = { id: number; name: string }

const statusLabel = (s: Req["status"]) =>
  s === "waiting" ? "قيد المعالجة"
  : s === "confirmed" ? "مقبول"
  : s === "in_progress" ? "قيد التنفيذ"
  : s === "completed" ? "مكتمل"
  : "مرفوض"

const statusBadge = (s: Req["status"]) =>
  s === "confirmed" || s === "completed"
    ? "bg-green-50 text-green-700 border-green-300"
    : s === "rejected"
      ? "bg-red-50 text-red-700 border-red-300"
      : "bg-yellow-50 text-yellow-700 border-yellow-300"

export default function MaintenanceRequestsPage() {
  const [requests, setRequests] = useState<Req[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        setLoading(false)
        return
      }

      try {
        // you can add per_page/page if you want
        const [reqRes, compRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/complex-admin/maintenance-requests?per_page=10&page=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/dashboard/complex-admin/maintenance-companies?per_page=100&page=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        // Debug logs
        // console.log("Requests status:", reqRes.status)
        // console.log("Companies status:", compRes.status)

        const reqJson = await reqRes.json()
        const compJson = await compRes.json()

        // shapes:
        // requests => { data: { maintenance_requests: [...] , meta: {...} } }
        // companies => { data: { MaintenanceCompanies: [...] , meta: {...} } }  (capital M per your API)
        const reqData: Req[] = reqJson?.data?.maintenance_requests ?? []
        const compData: Company[] =
          compJson?.data?.MaintenanceCompanies ??
          compJson?.data?.maintenance_companies ??
          []

        setRequests(reqData)
        setCompanies(compData)
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAssign = async (reqId: number, companyId: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      // optimistic UI
      const selected = companies.find(c => String(c.id) === companyId) || null
      setRequests(prev =>
        prev.map(r =>
          r.id === reqId ? { ...r, maintenance_company: selected as any } : r
        )
      )

      const form = new FormData()
      form.append("maintenance_company_id", companyId)

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/maintenance-requests/${reqId}/assign-company`,
        {
          method: "POST", // per your Postman screenshot
          headers: { Authorization: `Bearer ${token}` },
          body: form, // must be form-data
        }
      )

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`Assign failed ${res.status} → ${msg}`)
      }
    } catch (e) {
      console.error("Assign error:", e)
    }
  }

  const handleUpdateStatus = async (reqId: number, status: Req["status"]) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      // optimistic UI
      setRequests(prev => prev.map(r => (r.id === reqId ? { ...r, status } : r)))

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/maintenance-requests/${reqId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`Status update failed ${res.status} → ${msg}`)
      }
    } catch (e) {
      console.error("Status error:", e)
    }
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">طلبات الصيانة</CardTitle>
            <p className="text-sm text-gray-500">جميع الطلبات المقدمة من السكان.</p>
          </div>
          <Button className="text-white bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" />
            إضافة مستخدم
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Button variant="outline" className="flex items-center gap-2 border-gray-300 text-gray-700">
              <SlidersHorizontal className="w-4 h-4" />
              تصفية
            </Button>
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث"
                className="pr-10 pl-4 py-2 w-full border-gray-300 rounded-lg text-right"
                dir="rtl"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center py-10">جارٍ التحميل...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 text-sm font-semibold">
                  <TableHead className="text-center w-[40px]">#</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-center">الشقة</TableHead>
                  <TableHead className="text-center">التاريخ</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">الشركة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {requests.map((req, index) => {
                  const apt = req?.complex?.building?.apartment?.number ?? "-"
                  const created = req?.created_at ? new Date(req.created_at).toISOString().slice(0, 10) : "-"
                  const canAssign = req.status === "waiting" 
                  return (
                    <TableRow key={req.id} className="hover:bg-gray-50">
                      <TableCell className="text-center font-semibold">{index + 1}</TableCell>
                      <TableCell className="text-right">{req.maintenance_department?.name ?? "-"}</TableCell>
                      <TableCell className="text-right">{req.title}</TableCell>
                      <TableCell className="text-right">{req.description || "—"}</TableCell>
                      <TableCell className="text-center">{apt}</TableCell>
                      <TableCell className="text-center">{created}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(req.status)}`}>
                          {statusLabel(req.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {req.maintenance_company?.name ?? "—"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex flex-wrap gap-2 justify-start items-center">
                          <Select
                            onValueChange={(val) => handleAssign(req.id, val)}
                            value={req.maintenance_company?.id ? String(req.maintenance_company.id) : ""}
                            dir="rtl"
                                        disabled={!canAssign}                

                          >
                            <SelectTrigger
                             disabled={!canAssign}               // ✅ disables UI
              title={!canAssign ? "غير متاح بعد قبول الطلب" : ""} className="w-[180px] border-gray-300 text-right">
                              <SelectValue placeholder="تخصيص لشركة" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                              {companies.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {req.status === "waiting" ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleUpdateStatus(req.id, "confirmed")}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleUpdateStatus(req.id, "rejected")}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(req.id, "waiting")}
                              className="text-blue-600 hover:bg-blue-50"
                              title="إعادة إلى قيد المعالجة"
                            >
                              <RotateCcw className="w-4 h-4 -scale-x-100" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
