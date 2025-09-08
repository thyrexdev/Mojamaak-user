"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Loader2, Users, Calendar, Clock, Phone, User, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type VisitRequest = {
  id: number
  visiter_name: string
  visiter_phone: string
  visit_time: string
  visit_date: string
  status: string
  created_at: string
  user?: {
    id: number
    name: string
    email: string
    phone: string
  }
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

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: "في الانتظار", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
    approved: { label: "موافق عليها", variant: "default" as const, className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
    rejected: { label: "مرفوضة", variant: "destructive" as const, className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
    completed: { label: "مكتملة", variant: "outline" as const, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

export default function VisitRequestsPage({ userId }: { userId: number }) {
  const router = useRouter()
  const [requests, setRequests] = useState<VisitRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [meta, setMeta] = useState<Meta>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchRequests = async (pageNum = 1, search = searchTerm, status = statusFilter) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("لم يتم العثور على رمز الدخول", {
          description: "يرجى تسجيل الدخول مرة أخرى"
        })
        return
      }

      let url = `${API_BASE_URL}/api/dashboard/complex-admin/users/${userId}/visit-requests?per_page=${perPage}&page=${pageNum}`
      
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`
      }
      
      if (status !== "all") {
        url += `&status=${status}`
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) {
        throw new Error("فشل في تحميل طلبات الزيارة")
      }

      const json = await res.json()
      const block = json?.data ?? json
      const list: VisitRequest[] = block?.visit_requests ?? []
      const metaBlock: Meta = block?.meta ?? {
        total: list.length,
        count: list.length,
        per_page: perPage,
        current_page: pageNum,
        total_pages: 1,
      }

      setRequests(list)
      setMeta(metaBlock)
      setPage(metaBlock.current_page || pageNum)
      
      if (pageNum === 1) {
        toast.success("تم تحميل طلبات الزيارة بنجاح")
      }
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحميل البيانات", {
        description: error.message || "حدث خطأ غير متوقع"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (requestId: number) => {
    setActionLoading(requestId)
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/visits/${requestId}`)
    } catch (error) {
      toast.error("فشل في فتح التفاصيل")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchRequests(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== "" || statusFilter !== "all") {
        fetchRequests(1, searchTerm, statusFilter)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, statusFilter])

  const canPrev = (meta.current_page ?? 1) > 1
  const canNext = (meta.current_page ?? 1) < (meta.total_pages ?? 1) || Boolean(meta.next_page_url)

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-SA')
    } catch {
      return dateStr
    }
  }

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':')
      const time = new Date()
      time.setHours(parseInt(hours), parseInt(minutes))
      return time.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    } catch {
      return timeStr
    }
  }

  return (
    <div className="p-6 font-arabic bg-gray-50 dark:bg-gray-900 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                طلبات الزيارات
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                إدارة ومراجعة جميع طلبات الزيارات
              </p>
            </div>
          </div>
          
          {meta.total !== undefined && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                إجمالي الطلبات: {meta.total}
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="البحث في أسماء الزوار أو أرقام الهواتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="تصفية حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                    <SelectItem value="approved">موافق عليها</SelectItem>
                    <SelectItem value="rejected">مرفوضة</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              قائمة طلبات الزيارات
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">جارٍ تحميل البيانات...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                        <TableHead className="text-center w-[60px] text-gray-700 dark:text-gray-300 font-semibold">#</TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            اسم الزائر
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            رقم الهاتف
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            التاريخ
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            الوقت
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">الحالة</TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">المستخدم</TableHead>
                        <TableHead className="text-center text-gray-700 dark:text-gray-300 font-semibold">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req, idx) => (
                        <TableRow 
                          key={req.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30 border-gray-200 dark:border-gray-700 transition-colors"
                        >
                          <TableCell className="text-center text-gray-600 dark:text-gray-400 font-medium">
                            {((meta.current_page ?? 1) - 1) * (meta.per_page ?? perPage) + (idx + 1)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {req.visiter_name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {req.visiter_phone}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(req.visit_date)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {formatTime(req.visit_time)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {getStatusBadge(req.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-gray-700 dark:text-gray-300">
                              {req.user?.name ?? (
                                <span className="text-gray-400 dark:text-gray-500">غير محدد</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(req.id)}
                              disabled={actionLoading === req.id}
                              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              {actionLoading === req.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                              تفاصيل
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {requests.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <Users className="w-8 h-8 text-gray-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  لا يوجد طلبات زيارات
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  لم يتم العثور على أي طلبات زيارات بالمعايير المحددة
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {requests.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
                      عرض {((meta.current_page ?? 1) - 1) * (meta.per_page ?? perPage) + 1} - {Math.min((meta.current_page ?? 1) * (meta.per_page ?? perPage), meta.total ?? 0)} من إجمالي {meta.total ?? 0} طلب
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canPrev || loading}
                        onClick={() => canPrev && fetchRequests((meta.current_page ?? 1) - 1, searchTerm, statusFilter)}
                        className="flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <ChevronRight className="w-4 h-4" />
                        السابق
                      </Button>
                      
                      <div className="flex items-center gap-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                        <span className="text-gray-700 dark:text-gray-300">
                          {meta.current_page ?? page}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {meta.total_pages ?? 1}
                        </span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canNext || loading}
                        onClick={() => canNext && fetchRequests((meta.current_page ?? 1) + 1, searchTerm, statusFilter)}
                        className="flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        التالي
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}