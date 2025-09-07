"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { UploadCloud, Building2, Plus } from "lucide-react";

type AddressLang = "ar" | "en" | "ku";

type Address = Record<AddressLang, string>;

type ApartmentField =
  | "floor_number"
  | "number"
  | "residency_date"
  | "price"
  | "listing_type"
  | "is_available";

interface Apartment {
  floor_number: string;
  number: string;
  residency_date: string;
  price: string;
  listing_type: string;
  is_available: boolean;
}

export default function AddBuildingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [address, setAddress] = useState<Address>({ ar: "", en: "", ku: "" });
  const [description, setDescription] = useState<Address>({
    ar: "",
    en: "",
    ku: "",
  });
  const [isActive, setIsActive] = useState(true);

  const [apartments, setApartments] = useState<Apartment[]>([
    {
      floor_number: "",
      number: "",
      residency_date: "",
      price: "",
      listing_type: "sale",
      is_available: true,
    },
  ]);

  const handleAddApartment = () => {
    setApartments((prev) => [
      ...prev,
      {
        floor_number: "",
        number: "",
        residency_date: "",
        price: "",
        listing_type: "sale",
        is_available: true,
      },
    ]);
  };

const handleApartmentChange = (
  index: number,
  field: ApartmentField,
  value: string | boolean
) => {
  const updated = [...apartments];
  if (field === "is_available") {
    updated[index][field] = value as boolean;
  } else {
    updated[index][field] = value as string;
  }
  setApartments(updated);
};

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Multi-language address & description
      formData.append("address[ar]", address.ar);
      formData.append("address[en]", address.en);
      formData.append("address[ku]", address.ku);

      formData.append("description[ar]", description.ar);
      formData.append("description[en]", description.en);
      formData.append("description[ku]", description.ku);

      // Building fields
      formData.append("building_date", new Date().toISOString().split("T")[0]); // temporary example
      formData.append("floor_number", "8"); // you can make this dynamic
      formData.append("apartment_number", String(apartments.length));
      formData.append("status", isActive ? "active" : "inactive");

      // Apartments
      apartments.forEach((apt, index) => {
        formData.append(`apartments[${index}][floor_number]`, apt.floor_number);
        formData.append(`apartments[${index}][number]`, apt.number);
        formData.append(`apartments[${index}][price]`, apt.price);
        formData.append(`apartments[${index}][listing_type]`, apt.listing_type);
        formData.append(
          `apartments[${index}][is_available]`,
          apt.is_available ? "1" : "0"
        );
        formData.append(
          `apartments[${index}][residency_date]`,
          apt.residency_date
        );
      });

      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "لم يتم العثور على رمز الدخول",
        });
        return;
      }

      const response = await fetch(
        "https://api.mojamaak.com/api/dashboard/complex-admin/buildings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في إضافة المبنى");
      }

      toast({
        title: "نجاح",
        description: "تم إضافة المبنى بنجاح",
      });
      router.push("/buildings");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إضافة المبنى",
      });
    }
  };

  const handleCancel = () => {
    router.push("/buildings");
  };

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-gray-800" />
          <h1 className="text-2xl font-bold text-gray-900">إضافة مبنى</h1>
        </div>
      </div>

      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Address field */}
            <div className="space-y-2">
              <Label>
                العنوان<span className="text-red-500">*</span>
              </Label>
              <Input
                dir="rtl"
                value={address.ar}
                onChange={(e) => {
                  const value = e.target.value;
                  setAddress({
                    ar: value,
                    en: value,
                    ku: value,
                  });
                }}
              />
            </div>

            {/* Description field */}
            <div className="space-y-2">
              <Label>
                الوصف<span className="text-red-500">*</span>
              </Label>
              <Input
                dir="rtl"
                value={description.ar}
                onChange={(e) => {
                  const value = e.target.value;
                  setDescription({
                    ar: value,
                    en: value,
                    ku: value,
                  });
                }}
              />
            </div>
            {/* Apartments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">الشقق</h2>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddApartment}
                >
                  <Plus className="w-4 h-4 mr-1" /> إضافة شقة
                </Button>
              </div>

              {apartments.map((apt, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-md"
                >
                  <Input
                    placeholder="الطابق"
                    type="number"
                    value={apt.floor_number}
                    onChange={(e) =>
                      handleApartmentChange(
                        index,
                        "floor_number",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="رقم الشقة"
                    value={apt.number}
                    onChange={(e) =>
                      handleApartmentChange(index, "number", e.target.value)
                    }
                  />
                  <Input
                    placeholder="تاريخ السكن"
                    type="date"
                    value={apt.residency_date}
                    onChange={(e) =>
                      handleApartmentChange(
                        index,
                        "residency_date",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="السعر"
                    type="number"
                    value={apt.price}
                    onChange={(e) =>
                      handleApartmentChange(index, "price", e.target.value)
                    }
                  />
                  <Input
                    placeholder="نوع العرض (sale/rent)"
                    value={apt.listing_type}
                    onChange={(e) =>
                      handleApartmentChange(
                        index,
                        "listing_type",
                        e.target.value
                      )
                    }
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm">متاح</span>
                    <Switch
                      checked={apt.is_available}
                      onCheckedChange={(checked) =>
                        handleApartmentChange(index, "is_available", checked)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-start gap-3">
              <span className="text-sm font-medium text-gray-700">الحالة</span>
              <Switch
                id="active-status"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <span className="text-sm text-gray-600">نشط</span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
              <Button
                type="submit"
                onClick={handleSave}
                className="bg-primary-500 text-white"
              >
                حفظ المبنى
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
