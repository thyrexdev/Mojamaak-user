"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Home, 
  Wrench, 
  UserCheck, 
  Phone, 
  Mail, 
  Building2,
  Calendar,
  DollarSign,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

const getStatusConfig = (status: string) => {
  switch (status) {
    case "pending":
      return { 
        label: "قيد المعالجة", 
        variant: "secondary" as const,
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        icon: Clock
      }
    case "confirmed":
      return { 
        label: "مقبول", 
        variant: "default" as const,
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle2
      }
    case "in_progress":
      return { 
        label: "قيد التنفيذ", 
        variant: "secondary" as const,
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        icon: Info
      }
    case "completed":
      return { 
        label: "مكتمل", 
        variant: "default" as const,
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle2
      }
    case "rejected":
      return { 
        label: "مرفوض", 
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: XCircle
      }
    default:
      return { 
        label: status, 
        variant: "outline" as const,
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
        icon: AlertCircle
      }
  }
}

export default function ResidentDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userId = params?.id

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

  // Button loading states
  const [buttonLoading, setButtonLoading] = useState<{
    maintPrev: boolean
    maintNext: boolean
    visitPrev: boolean
    visitNext: boolean
    refresh: boolean
  }>({
    maintPrev: false,
    maintNext: false,
    visitPrev: false,
    visitNext: false,
    refresh: false
  })

  const perPage = 10

  const authHeader = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("لم يتم العثور على رمز الدخول", {
        description: "يرجى تسجيل الدخول مرة أخرى",
        duration: 4000,
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
        toast.error("فشل في تحميل بيانات الساكن", {
          description: `رمز الخطأ: ${res.status}`,
          duration: 4000,
        })
        return
      }
      const json = await res.json()
      const data = json?.data ?? json
      setProfile(data)
    } catch (e) {
      toast.error("حدث خطأ غير متوقع", {
        description: "أثناء تحميل بيانات الساكن",
        duration: 5000,
      })
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadMaint = async (page = 1, showToast = false) => {
    setLoadingMaint(true)
    const isNext = page > (maintMeta.current_page ?? 1)
    const isPrev = page < (maintMeta.current_page ?? 1)
    
    if (isNext) setButtonLoading(prev => ({ ...prev, maintNext: true }))
    if (isPrev) setButtonLoading(prev => ({ ...prev, maintPrev: true }))
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/users/${userId}/maintenance-requests?per_page=${perPage}&page=${page}`,
        { headers: authHeader() }
      )
      if (!res.ok) {
        toast.error("فشل في تحميل طلبات الصيانة", {
          description: `رمز الخطأ: ${res.status}`,
          duration: 4000,
        })
        return
      }
      const json = await res.json()
      const block = json?.data ?? json
      setMaint(block?.maintenance_requests ?? [])
      setMaintMeta(block?.meta ?? {})
      
      if (showToast) {
        toast.success("تم تحميل طلبات الصيانة بنجاح")
      }
    } catch (e) {
      toast.error("حدث خطأ غير متوقع", {
        description: "أثناء تحميل طلبات الصيانة",
        duration: 5000,
      })
    } finally {
      setLoadingMaint(false)
      setButtonLoading(prev => ({ ...prev, maintNext: false, maintPrev: false }))
    }
  }

  const loadVisits = async (page = 1, showToast = false) => {
    setLoadingVisits(true)
    const isNext = page > (visitMeta.current_page ?? 1)
    const isPrev = page < (visitMeta.current_page ?? 1)
    
    if (isNext) setButtonLoading(prev => ({ ...prev, visitNext: true }))
    if (isPrev) setButtonLoading(prev => ({ ...prev, visitPrev: true }))
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/users/${userId}/visit-requests?per_page=${perPage}&page=${page}`,
        { headers: authHeader() }
      )
      if (!res.ok) {
        toast.error("فشل في تحميل طلبات الزيارة", {
          description: `رمز الخطأ: ${res.status}`,
          duration: 4000,
        })
        return
      }
      const json = await res.json()
      const block = json?.data ?? json
      setVisits(block?.visit_requests ?? [])
      setVisitMeta(block?.meta ?? {})
      
      if (showToast) {
        toast.success("تم تحميل طلبات الزيارة بنجاح")
      }
    } catch (e) {
      toast.error("حدث خطأ غير متوقع", {
        description: "أثناء تحميل طلبات الزيارة",
        duration: 5000,
      })
    } finally {
      setLoadingVisits(false)
      setButtonLoading(prev => ({ ...prev, visitNext: false, visitPrev: false }))
    }
  }

  const handleRefresh = async () => {
    setButtonLoading(prev => ({ ...prev, refresh: true }))
    await Promise.all([
      loadProfile(),
      loadMaint(maintMeta.current_page ?? 1, true),
      loadVisits(visitMeta.current_page ?? 1, true)
    ])
    setButtonLoading(prev => ({ ...prev, refresh: false }))
    toast.success("تم تحديث جميع البيانات")
  }

  useEffect(() => {
    if (!userId) return
    loadProfile()
    loadMaint(1)
    loadVisits(1)
  }, [userId])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const apartmentsCount = profile?.apartments?.length ?? 0
  const activeApartments = profile?.apartments?.filter(apt => !apt.is_available).length ?? 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-arabic transition-colors" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              تفاصيل الساكن
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              عرض معلومات الساكن وطلباته
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={buttonLoading.refresh}
          className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {buttonLoading.refresh ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <RefreshCw className="h-4 w-4 ml-2" />
          )}
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي الشقق</p>
                <p className="text-2xl font-bold">{apartmentsCount}</p>
              </div>
              <Home className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">طلبات الصيانة</p>
                <p className="text-2xl font-bold">{maintMeta.total ?? 0}</p>
              </div>
              <Wrench className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">طلبات الزيارة</p>
                <p className="text-2xl font-bold">{visitMeta.total ?? 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 dark:border-gray-700 mb-6 transition-colors">
        <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            بيانات الساكن
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loadingProfile ? (
            <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin ml-4 text-blue-600 dark:text-blue-400" />
              <p className="text-lg font-medium">جارٍ التحميل...</p>
            </div>
          ) : profile ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">الاسم</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.name}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني</div>
                  <div className="font-semibold text-gray-900 dark:text-white break-all">{profile.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">الهاتف</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.phone || "غير محدد"}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium">لا توجد بيانات</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apartments Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 dark:border-gray-700 mb-6 transition-colors">
        <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            شقق الساكن
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!profile || profile.apartments?.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-500 dark:text-gray-400">
              <Home className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium mb-1">لا توجد شقق</p>
              <p className="text-sm">لم يتم تسجيل أي شقق لهذا الساكن</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {profile.apartments!.map((apt) => (
                <div 
                  key={apt.id} 
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        شقة رقم {apt.number}
                      </span>
                    </div>
                    <Badge 
                      variant={apt.is_available ? "secondary" : "default"}
                      className={cn(
                        apt.is_available 
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      )}
                    >
                      {apt.is_available ? "متاحة" : "محجوزة"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">المبنى:</span>
                        <span className="font-medium text-gray-900 dark:text-white mr-1">
                          {apt.building?.address ?? "غير محدد"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">الطابق:</span>
                        <span className="font-medium text-gray-900 dark:text-white mr-1">
                          {apt.floor_number}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">السعر:</span>
                        <span className="font-medium text-gray-900 dark:text-white mr-1">
                          {apt.price}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">النوع:</span>
                        <span className="font-medium text-gray-900 dark:text-white mr-1">
                          {apt.listing_type}
                        </span>
                      </div>
                    </div>
                    
                    {apt.residency_date && (
                      <div className="flex items-center gap-2 col-span-2">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">تاريخ السكن:</span>
                          <span className="font-medium text-gray-900 dark:text-white mr-1">
                            {formatDate(apt.residency_date)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Requests */}
      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger 
            value="maintenance" 
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
          >
            <Wrench className="h-4 w-4" />
            طلبات الصيانة
          </TabsTrigger>
          <TabsTrigger 
            value="visits"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
          >
            <UserCheck className="h-4 w-4" />
            طلبات الزيارة
          </TabsTrigger>
        </TabsList>

        {/* Maintenance Requests Tab */}
        <TabsContent value="maintenance" className="mt-6">
          <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 dark:border-gray-700 transition-colors">
            <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                طلبات الصيانة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loadingMaint ? (
                <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-8 w-8 animate-spin ml-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-lg font-medium">جارٍ التحميل...</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableHead className="text-center w-[80px] font-bold text-gray-900 dark:text-white">#</TableHead>
                          <TableHead className="text-right font-bold text-gray-900 dark:text-white">القسم</TableHead>
                          <TableHead className="text-right font-bold text-gray-900 dark:text-white">العنوان</TableHead>
                          <TableHead className="text-center font-bold text-gray-900 dark:text-white">الشقة</TableHead>
                          <TableHead className="text-center font-bold text-gray-900 dark:text-white">الحالة</TableHead>
                          <TableHead className="text-center font-bold text-gray-900 dark:text-white">التاريخ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {maint.map((r, idx) => {
                          const aptNum = r?.complex?.building?.apartment?.number ?? "غير محدد"
                          const created = r.created_at ? formatDate(r.created_at) : "غير محدد"
                          const statusConfig = getStatusConfig(r.status)
                          const StatusIcon = statusConfig.icon
                          
                          return (
                            <TableRow 
                              key={r.id}
                              className={cn(
                                "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                                idx % 2 === 0 && "bg-gray-25 dark:bg-gray-800/30"
                              )}
                            >
                              <TableCell className="text-center font-medium text-gray-600 dark:text-gray-400">
                                {((maintMeta.current_page ?? 1) - 1) * (maintMeta.per_page ?? 10) + (idx + 1)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {r.maintenance_department?.name ?? "غير محدد"}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="text-gray-900 dark:text-white">{r.title}</div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="font-medium text-gray-900 dark:text-white">{aptNum}</div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={cn("flex items-center gap-1", statusConfig.color)}>
                                  <StatusIcon className="h-3 w-3" />
                                  {statusConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-gray-600 dark:text-gray-400">{created}</div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        
                        {maint.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                              <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                <Wrench className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
                                <p className="text-lg font-medium mb-1">لا توجد طلبات صيانة</p>
                                <p className="text-sm">لم يتم تقديم أي طلبات صيانة من هذا الساكن</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Maintenance Pagination */}
                  {maint.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        الصفحة <span className="font-bold text-blue-600 dark:text-blue-400">{maintMeta.current_page ?? 1}</span> من{" "}
                        <span className="font-bold text-blue-600 dark:text-blue-400">{maintMeta.total_pages ?? 1}</span>
                        {maintMeta.total && (
                          <span className="mr-2">
                            (إجمالي: <span className="font-bold">{maintMeta.total}</span> طلب)
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={(maintMeta.current_page ?? 1) <= 1 || buttonLoading.maintPrev}
                          onClick={() => loadMaint((maintMeta.current_page ?? 1) - 1)}
                          className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                          {buttonLoading.maintPrev && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                          السابق
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={(maintMeta.current_page ?? 1) >= (maintMeta.total_pages ?? 1) || buttonLoading.maintNext}
                          onClick={() => loadMaint((maintMeta.current_page ?? 1) + 1)}
                          className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                          التالي
                          {buttonLoading.maintNext && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visit Requests Tab */}
        <TabsContent value="visits" className="mt-6">
          <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 dark:border-gray-700 transition-colors">
            <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                طلبات الزيارة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loadingVisits ? (
                <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-8 w-8 animate-spin ml-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-lg font-medium">جارٍ التحميل...</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableHead className="text-center w-[80px] font-bold text-gray-900 dark:text-white">#</TableHead>
                          <TableHead className="text-right font-bold text-gray-900 dark:text-white">اسم الزائر</TableHead>
                          <TableHead className="text-center font-bold text-gray-900 dark:text-white">الهاتف</TableHead>
                          <TableHead className="text-center font-bold text-gray-900 dark:text-white">التاريخ</TableHead>
                          <TableHead className="text-center font-bold text-gray-900 dark:text-white">الوقت</TableHead>
                          <TableHead className="text-center font-bold text-gray-900 dark:text-white">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visits.map((v, idx) => {
                          const statusConfig = getStatusConfig(v.status)
                          const StatusIcon = statusConfig.icon
                          
                          return (
                            <TableRow 
                              key={v.id}
                              className={cn(
                                "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                                idx % 2 === 0 && "bg-gray-25 dark:bg-gray-800/30"
                              )}
                            >
                              <TableCell className="text-center font-medium text-gray-600 dark:text-gray-400">
                                {((visitMeta.current_page ?? 1) - 1) * (visitMeta.per_page ?? 10) + (idx + 1)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="font-medium text-gray-900 dark:text-white">{v.visiter_name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-900 dark:text-white">{v.visiter_phone}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-900 dark:text-white">{v.visit_date}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-900 dark:text-white">{v.visit_time}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={cn("flex items-center gap-1 justify-center", statusConfig.color)}>
                                  <StatusIcon className="h-3 w-3" />
                                  {statusConfig.label}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        
                        {visits.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                              <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                <UserCheck className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
                                <p className="text-lg font-medium mb-1">لا توجد طلبات زيارة</p>
                                <p className="text-sm">لم يتم تقديم أي طلبات زيارة من هذا الساكن</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Visit Pagination */}
                  {visits.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        الصفحة <span className="font-bold text-blue-600 dark:text-blue-400">{visitMeta.current_page ?? 1}</span> من{" "}
                        <span className="font-bold text-blue-600 dark:text-blue-400">{visitMeta.total_pages ?? 1}</span>
                        {visitMeta.total && (
                          <span className="mr-2">
                            (إجمالي: <span className="font-bold">{visitMeta.total}</span> طلب)
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={(visitMeta.current_page ?? 1) <= 1 || buttonLoading.visitPrev}
                          onClick={() => loadVisits((visitMeta.current_page ?? 1) - 1)}
                          className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                          {buttonLoading.visitPrev && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                          السابق
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={(visitMeta.current_page ?? 1) >= (visitMeta.total_pages ?? 1) || buttonLoading.visitNext}
                          onClick={() => loadVisits((visitMeta.current_page ?? 1) + 1)}
                          className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                          التالي
                          {buttonLoading.visitNext && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}