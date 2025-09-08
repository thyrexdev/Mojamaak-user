"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Eye, Search, Users, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type UserRow = {
  id: number
  name: string
  email: string
  apartments?: Array<any>
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

export default function ResidentsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<UserRow[]>([])

  // pagination
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [meta, setMeta] = useState<Meta>({})
  const [buttonLoading, setButtonLoading] = useState<{
    prev: boolean
    next: boolean
    refresh: boolean
    [key: string]: boolean
  }>({
    prev: false,
    next: false,
    refresh: false
  })

  const fetchUsers = async (pageNum = 1, showToast = true) => {
    setLoading(pageNum === 1)
    setButtonLoading(prev => ({ ...prev, refresh: true }))
    
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("لم يتم العثور على رمز الدخول", {
          description: "يرجى تسجيل الدخول مرة أخرى",
          duration: 4000,
        })
        return
      }

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/users?per_page=${perPage}&page=${pageNum}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (!res.ok) {
        const errorText = await res.text()
        toast.error("فشل في تحميل بيانات السكان", {
          description: `رمز الخطأ: ${res.status}`,
          duration: 4000,
        })
        return
      }

      const json = await res.json()
      const block = json?.data ?? json
      const list: UserRow[] = block?.users ?? block?.data ?? []
      const metaBlock: Meta = block?.meta ?? {
        total: list.length,
        count: list.length,
        per_page: perPage,
        current_page: pageNum,
        total_pages: 1,
      }

      setUsers(list)
      setMeta(metaBlock)
      setPage(metaBlock.current_page || pageNum)
      
      if (showToast && pageNum === 1) {
        toast.success("تم تحميل بيانات السكان بنجاح", {
          description: `تم العثور على ${metaBlock.total || list.length} مستخدم`,
          duration: 3000,
        })
      }
    } catch (e: any) {
      toast.error("حدث خطأ غير متوقع", {
        description: "يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني",
        duration: 5000,
      })
    } finally {
      setLoading(false)
      setButtonLoading(prev => ({ ...prev, refresh: false, prev: false, next: false }))
    }
  }

  useEffect(() => {
    fetchUsers(1, false)
  }, [])

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [users, searchTerm])

  const handlePrevPage = async () => {
    if (!canPrev) return
    setButtonLoading(prev => ({ ...prev, prev: true }))
    await fetchUsers((meta.current_page ?? 1) - 1, false)
  }

  const handleNextPage = async () => {
    if (!canNext) return
    setButtonLoading(prev => ({ ...prev, next: true }))
    await fetchUsers((meta.current_page ?? 1) + 1, false)
  }

  const handleRefresh = async () => {
    await fetchUsers(meta.current_page ?? 1, false)
    toast.success("تم تحديث البيانات")
  }

  const handleViewDetails = (userId: number) => {
    router.push(`/residents/${userId}`)
  }

  const canPrev = (meta.current_page ?? 1) > 1
  const canNext =
    (meta.current_page ?? 1) < (meta.total_pages ?? 1) ||
    Boolean(meta.next_page_url)

  const totalResidents = meta.total ?? users.length
  const activeResidents = users.filter(user => user.apartments?.length).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-arabic transition-colors" dir="rtl">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي السكان</p>
                <p className="text-2xl font-bold">{totalResidents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">السكان النشطون</p>
                <p className="text-2xl font-bold">{activeResidents}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">غير السكان</p>
                <p className="text-2xl font-bold">{totalResidents - activeResidents}</p>
              </div>
              <Users className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 dark:border-gray-700 transition-colors">
        <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              إدارة السكان
            </CardTitle>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-full sm:w-64 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
              
              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={buttonLoading.refresh}
                className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {buttonLoading.refresh ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600 dark:text-blue-400" />
              <p className="text-lg font-medium">جارٍ التحميل...</p>
              <p className="text-sm mt-1">يرجى الانتظار قليلاً</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <TableHead className="text-center w-[80px] font-bold text-gray-900 dark:text-white">#</TableHead>
                      <TableHead className="text-right font-bold text-gray-900 dark:text-white">الاسم</TableHead>
                      <TableHead className="text-right font-bold text-gray-900 dark:text-white">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right font-bold text-gray-900 dark:text-white">الحالة</TableHead>
                      <TableHead className="text-right font-bold text-gray-900 dark:text-white w-[140px]">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, idx) => (
                      <TableRow 
                        key={user.id} 
                        className={cn(
                          "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                          idx % 2 === 0 && "bg-gray-25 dark:bg-gray-800/30"
                        )}
                      >
                        <TableCell className="text-center font-medium text-gray-600 dark:text-gray-400">
                          {((meta.current_page ?? 1) - 1) * (meta.per_page ?? perPage) + (idx + 1)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-gray-600 dark:text-gray-400">{user.email}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={user.apartments?.length ? "default" : "secondary"}
                            className={cn(
                              user.apartments?.length 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                            )}
                          >
                            {user.apartments?.length ? "ساكن" : "غير ساكن"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(user.id)}
                            className="flex items-center gap-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">عرض التفاصيل</span>
                            <span className="sm:hidden">عرض</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredUsers.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                            <Users className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
                            <p className="text-lg font-medium mb-1">
                              {searchTerm ? "لم يتم العثور على نتائج" : "لا يوجد بيانات"}
                            </p>
                            <p className="text-sm">
                              {searchTerm ? "جرب البحث بكلمات مختلفة" : "لم يتم إضافة أي سكان بعد"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredUsers.length > 0 && !searchTerm && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    الصفحة <span className="font-bold text-blue-600 dark:text-blue-400">{meta.current_page ?? page}</span> من{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400">{meta.total_pages ?? 1}</span>
                    {meta.total && (
                      <span className="mr-2">
                        (إجمالي: <span className="font-bold">{meta.total}</span> مستخدم)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!canPrev || buttonLoading.prev}
                      onClick={handlePrevPage}
                      className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    >
                      {buttonLoading.prev && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!canNext || buttonLoading.next}
                      onClick={handleNextPage}
                      className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    >
                      التالي
                      {buttonLoading.next && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Search Results Info */}
              {searchTerm && filteredUsers.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    تم العثور على <span className="font-bold">{filteredUsers.length}</span> نتيجة للبحث عن "{searchTerm}"
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}