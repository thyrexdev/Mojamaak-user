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
import { 
  Eye, 
  Loader2, 
  Wrench, 
  Calendar, 
  Building, 
  Home, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  MapPin,
  Clock,
  Building2
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type MaintenanceRequest = {
  id: number
  title: string
  status: string
  assigned_at?: string
  created_at: string
  maintenance_department?: { id: number; name: string }
  maintenance_company?: { id: number; name: string }
  complex?: {
    id: number
    name: string
    building: {
      id: number
      address: string
      description: string
      apartment: {
        id: number
        number: string
        floor_number: number
      }
    }
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
    pending: { 
      label: "في الانتظار", 
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" 
    },
    in_progress: { 
      label: "قيد التنفيذ", 
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800" 
    },
    assigned: { 
      label: "مُكلف", 
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800" 
    },
    completed: { 
      label: "مكتملة", 
      className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800" 
    },
    cancelled: { 
      label: "ملغية", 
      className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800" 
    },
    on_hold: { 
      label: "معلقة", 
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800" 
    }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  return (
    <Badge variant="outline" className={`${config.className} font-medium`}>
      {config.label}
    </Badge>
  )
}

const getPriorityColor = (status: string) => {
  const colors = {
    pending: "border-r-yellow-500",
    in_progress: "border-r-blue-500",
    assigned: "border-r-purple-500", 
    completed: "border-r-green-500",
    cancelled: "border-r-red-500",
    on_hold: "border-r-gray-500"
  }
  return colors[status as keyof typeof colors] || "border-r-gray-300"
}

export default function MaintenanceRequestsPage({ userId }: { userId: number }) {
  const router = useRouter()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
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

      let url = `${API_BASE_URL}/api/dashboard/complex-admin/users/${userId}/maintenance-requests?per_page=${perPage}&page=${pageNum}`
      
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
        throw new Error("فشل في تحميل طلبات الصيانة")
      }

      const json = await res.json()
      const block = json?.data ?? json
      const list: MaintenanceRequest[] = block?.maintenance_requests ?? []
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
        toast.success("تم تحميل طلبات الصيانة بنجاح")
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
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/maintenance/${requestId}`)
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
      return new Date(dateStr).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="p-6 font-arabic bg-gray-50 dark:bg-gray-900 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Wrench className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                طلبات الصيانة
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                إدارة ومراجعة جميع طلبات الصيانة والإصلاحات
              </p>
            </div>
          </div>
          
          {meta.total !== undefined && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Wrench className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                إجمالي الطلبات: {meta.total}
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/10 dark:to-yellow-800/10 border-yellow-200 dark:border-yellow-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-200 dark:bg-yellow-800/30 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">في الانتظار</p>
                  <p className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10 border-blue-200 dark:border-blue-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-200 dark:bg-blue-800/30 rounded-lg">
                  <Loader2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">قيد التنفيذ</p>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                    {requests.filter(r => r.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10 border-green-200 dark:border-green-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-200 dark:bg-green-800/30 rounded-lg">
                  <Wrench className="w-5 h-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">مكتملة</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-300">
                    {requests.filter(r => r.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10 border-purple-200 dark:border-purple-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-200 dark:bg-purple-800/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">مُكلف</p>
                  <p className="text-xl font-bold text-purple-800 dark:text-purple-300">
                    {requests.filter(r => r.status === 'assigned').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="البحث في عناوين الطلبات أو الأقسام..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
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
                    <SelectItem value="assigned">مُكلف</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                    <SelectItem value="cancelled">ملغية</SelectItem>
                    <SelectItem value="on_hold">معلقة</SelectItem>
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
              <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              قائمة طلبات الصيانة
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600 dark:text-orange-400 mb-3" />
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
                            <Wrench className="w-4 h-4" />
                            العنوان
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">الحالة</TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            القسم
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            الشركة
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            الشقة
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            تاريخ الإنشاء
                          </div>
                        </TableHead>
                        <TableHead className="text-center text-gray-700 dark:text-gray-300 font-semibold">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req, idx) => (
                        <TableRow 
                          key={req.id} 
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 border-gray-200 dark:border-gray-700 transition-colors border-r-4 ${getPriorityColor(req.status)}`}
                        >
                          <TableCell className="text-center text-gray-600 dark:text-gray-400 font-medium">
                            {((meta.current_page ?? 1) - 1) * (meta.per_page ?? perPage) + (idx + 1)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="max-w-xs">
                              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {req.title}
                              </div>
                              {req.assigned_at && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  تم التكليف: {formatDateTime(req.assigned_at)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {getStatusBadge(req.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {req.maintenance_department?.name ?? (
                                  <span className="text-gray-400 dark:text-gray-500">غير محدد</span>
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {req.maintenance_company?.name ?? (
                                  <span className="text-gray-400 dark:text-gray-500">غير محدد</span>
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4 text-gray-400" />
                              <div className="text-gray-700 dark:text-gray-300">
                                {req.complex?.building?.apartment ? (
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      شقة {req.complex.building.apartment.number}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      الطابق {req.complex.building.apartment.floor_number}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500">غير محدد</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{formatDate(req.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(req.id)}
                              disabled={actionLoading === req.id}
                              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-600"
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
                                <Wrench className="w-8 h-8 text-gray-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  لا يوجد طلبات صيانة
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  لم يتم العثور على أي طلبات صيانة بالمعايير المحددة
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