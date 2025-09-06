"use client";

import { Button } from "@/components/ui/button";
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
  Settings,
  Bell,
  MessageSquare,
  FactoryIcon,
  User2,
  Gift,
  IdCard,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation"; // Import useRouter

interface SidebarProps {
  isOpen: boolean;
  sidebarWidth: number;
}

const menuItems = [
  { href: "/", label: "معلومات المجمع", icon: Grid3X3 },
  { href: "/buildings", label: "إدارة المباني والشقق", icon: Building2 },
  { href: "/residents", label: "إدارة السكان", icon: Users },
  { href: "/financial", label: "المعاملات المالية", icon: DollarSign },
  { href: "/companies", label: "إدارة جهات الصيانة", icon: FactoryIcon },
  { href: "/maintenance", label: "إدارة طلبات الصيانة", icon: HeadphonesIcon },
  { href: "/visits", label: "إدارة طلبات الزيارة", icon: Globe },
  { href: "/users", label: "إدارة المستخدمين", icon: User },
  { href: "/complex-admins", label: "إدارة الإداريين", icon: User2 },
  { href: "/invitations", label: "إدارة الدعوات", icon: IdCard },
];

export default function Sidebar({ isOpen, sidebarWidth }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={`fixed top-0 right-0 h-full bg-primary-500 border-l border-primary-600 transition-all duration-300 z-40 font-arabic shadow-lg overflow-hidden`}
      style={{ width: isOpen ? `${sidebarWidth}px` : "64px" }} // فقط أيقونات عند الإغلاق
    >
      <div className="h-full flex flex-col">
        {/* Top Logo and Control Panel Button */}
        <div
          className={`h-[73px] flex items-center transition-all duration-300 ${
            isOpen ? "p-9" : "p-3"
          }`}
        >
          {/* "مجمعك" Logo - Adjusted for consistent alignment */}
          <div className="flex items-center justify-start gap-2 text-white w-full">
            <div className="w-full flex items-center gap-2">
              {isOpen && (
                <Image
                  src="/logo_white2.png"
                  alt="Logo مجمعك"
                  width={150}
                  height={30}
                  priority
                />
              )}
              {!isOpen && (
                <Image
                  src="/logoicon_white2.png"
                  alt="M"
                  width={30}
                  height={30}
                  priority
                />
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-1" dir="rtl">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full py-3 h-auto transition-all duration-200 
    ${isOpen ? "justify-start text-right px-4" : "justify-center px-0"} 
    ${
      isActive
        ? "bg-primary-50 text-primary-900 border-r-2 border-primary-50"
        : "text-white hover:bg-primary-50 hover:text-primary-900"
    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isOpen ? "ml-3" : ""
                      } flex-shrink-0`}
                    />
                    {isOpen && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer with Logout Button */}
        <div className="p-4 border-t border-blue-300 flex flex-col gap-2">
          <div className="text-center text-xs text-white">
            <p>
              {!isOpen ? (
                "نظام مجمعك © 2025"
              ) : (
                <>
                  جميع الحقوق محفوظة لصالح
                  <br />
                  نظام مجمعك © 2025
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
