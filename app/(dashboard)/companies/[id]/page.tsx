"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type TranslationItem = {
  name: string
  location: string
  description: string
}

type Translations = {
  en?: TranslationItem
  ar?: TranslationItem
  ku?: TranslationItem
}

type Contact = {
  id: number
  type: string
  value: string
  type_translations?: {
    en?: string
    ar?: string
    ku?: string
  }
}

type MaintenanceAdmin = {
  id: number
  name: string
  email: string
  phone: string
}

type MaintenanceDepartment = {
  id: number
  name: string
  description: string
  icon: string
}

export type Company = {
  id: number
  name: string
  location: string
  logo: string
  description: string
  type: "internal" | "external"
  maintenance_department?: MaintenanceDepartment
  maintenance_admins?: MaintenanceAdmin[]
  contacts?: Contact[]
  translations?: Translations
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export default function CompanyDetailsPage() {
  const { id } = useParams()
const [company, setCompany] = useState<Company | null>(null)

  const fetchCompanyDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Aucun token trouvé")

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/maintenance-companies/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error("Échec du chargement des détails")

      const json = await res.json()
      setCompany(json.data)
    } catch (error) {
      console.error("Erreur lors du chargement des détails de la société :", error)
    }
  }

  useEffect(() => {
    if (id) fetchCompanyDetails()
  }, [id])

const ar: TranslationItem | undefined = company?.translations?.ar

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            تفاصيل شركة الصيانة
          </CardTitle>
        </CardHeader>
   <CardContent className="space-y-6 pt-0">
  {!company ? (
    <p className="text-gray-500">جاري تحميل التفاصيل...</p>
  ) : (
    <div className="space-y-6">

      {/* معلومات أساسية */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">الاسم</p>
          <p className="font-medium text-gray-900">{ar?.name}</p>
        </div>
        <div>
          <p className="text-gray-500">النوع</p>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium border ${
            company.type === "internal"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200"
          }`}>
            {company.type === "internal" ? "داخلية" : "خارجية"}
          </span>
        </div>
        <div>
          <p className="text-gray-500">الموقع</p>
          <p className="font-medium text-gray-900 whitespace-pre-wrap">{ar?.location}</p>
        </div>
        <div>
          <p className="text-gray-500">القسم</p>
          <p className="font-medium text-gray-900">{company.maintenance_department?.name || "-"}</p>
        </div>
        <div>
          <p className="text-gray-500">تاريخ الإضافة</p>
          <p className="font-medium text-gray-900">{new Date(company.created_at).toLocaleDateString("ar-EG")}</p>
        </div>
      </div>

      <Separator />

      {/* وصف */}
      <div>
        <p className="text-gray-500 text-sm mb-1">الوصف</p>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{ar?.description}</p>
      </div>

      <Separator />

      {/* المسؤولون */}
      <div>
        <p className="text-gray-500 text-sm mb-1">المسؤولون</p>
        <ul className="space-y-1 list-disc list-inside text-sm text-gray-800">
          {(company.maintenance_admins?.length ?? 0) > 0 ? (
            company.maintenance_admins?.map((admin) => (
              <li key={admin.id}>
                <span className="font-medium">{admin.name}</span> ({admin.email} - {admin.phone})
              </li>
            ))
          ) : (
            <li>لا يوجد</li>
          )}
        </ul>
      </div>

      <Separator />

      {/* بيانات الاتصال */}
      <div>
        <p className="text-gray-500 text-sm mb-1">بيانات الاتصال</p>
        <ul className="space-y-1 list-disc list-inside text-sm text-gray-800">
          {(company.contacts?.length ?? 0) > 0 ? (
            company.contacts!.map((contact) => (
              <li key={contact.id}>
                {contact.type_translations?.ar || contact.type}: {contact.value}
              </li>
            ))
          ) : (
            <li>لا يوجد</li>
          )}
        </ul>
      </div>
    </div>
  )}
</CardContent>

      </Card>
    </div>
  )
}
