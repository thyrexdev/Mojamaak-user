import { Button } from "@/components/ui/button"
import {
  Grid3X3,
  Users,
  Building2,
  Globe,
  User,
  DollarSign,
  HeadphonesIcon,
  BarChart3,
  Info,
  Download,
  Settings,
} from "lucide-react"

export default function Header() {
  return (
    <header className="bg-gray-50 p-4">
      <div className="flex justify-between items-start">
        {/* Left side - Dashboard Title */}
        <div className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg">
          <Grid3X3 className="w-5 h-5" />
          <span className="font-semibold">لوحة التحكم</span>
        </div>

        {/* Right side - Menu Items */}
        <div className="flex flex-col gap-2" dir="rtl">
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <Users className="w-4 h-4 ml-2" />
            إدارة السكان
          </Button>
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <Users className="w-4 h-4 ml-2" />
            إدارة المجتمعات
          </Button>
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <Building2 className="w-4 h-4 ml-2" />
            إدارة شركات الصيانة
          </Button>
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <Globe className="w-4 h-4 ml-2" />
            التحكم بواجهة الويب
          </Button>
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <User className="w-4 h-4 ml-2" />
            إدارة البروفايل
          </Button>
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <DollarSign className="w-4 h-4 ml-2" />
            المعاملات المالية
          </Button>
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <HeadphonesIcon className="w-4 h-4 ml-2" />
            الشكاوي والدعم
          </Button>
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <BarChart3 className="w-4 h-4 ml-2" />
            إدارة العروض
          </Button>
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <Settings className="w-4 h-4 ml-2" />
            الإعدادات
          </Button>
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <Info className="w-4 h-4 ml-2" />
            إدارة المحتوى
          </Button>
          <Button variant="ghost" className="justify-start text-right hover:bg-orange-50 hover:text-orange-600">
            <Download className="w-4 h-4 ml-2" />
            تسجيل الدخول
          </Button>
        </div>
      </div>
    </header>
  )
}
