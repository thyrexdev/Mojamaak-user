"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building2, Plus, Trash2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.mojamaak.com";

type Apt = {
  id?: number;                 // present for existing apts
  floor_number: string;
  number: string;
  residency_date: string;
  price: string;
  listing_type: "sale" | "rent";
  is_available: boolean;
  _markedForDelete?: boolean;  // local flag (existing apts only)
  _isNew?: boolean;            // local flag (new apts to create)
};

export default function EditBuildingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const buildingId = useMemo(() => Number(params?.id), [params?.id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // multilingual
  const [address, setAddress] = useState<{ ar: string; en: string; ku: string }>({
    ar: "",
    en: "",
    ku: "",
  });
  const [description, setDescription] = useState<{ ar: string; en: string; ku: string }>({
    ar: "",
    en: "",
    ku: "",
  });

  // other building fields used in your add/update requests
  const [statusActive, setStatusActive] = useState(true);
  const [floorNumber, setFloorNumber] = useState<string>(""); // optional (you sent in add)
  const [buildingDate, setBuildingDate] = useState<string>(""); // yyyy-mm-dd

  const [apartments, setApartments] = useState<Apt[]>([]);

  // ---- fetch current building (GET /buildings/:id) ----
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !buildingId) return;

        const res = await fetch(
          `${API_BASE_URL}/api/dashboard/complex-admin/buildings/${buildingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const json = await res.json();

        // try common shapes (your list used json.data.building or data?.building? adapt here)
        const b =
          json?.data?.building ??
          json?.data ??
          json;

        // Pre-fill Arabic with server strings if translations aren’t provided by the API
        const serverAddress = b?.address ?? "";
        const serverDescription = b?.description ?? "";

        setAddress({
          ar: b?.translations?.ar?.address ?? serverAddress ?? "",
          en: b?.translations?.en?.address ?? "",
          ku: b?.translations?.ku?.address ?? "",
        });

        setDescription({
          ar: b?.translations?.ar?.description ?? serverDescription ?? "",
          en: b?.translations?.en?.description ?? "",
          ku: b?.translations?.ku?.description ?? "",
        });

        // optional fields – keep empty if backend doesn’t send them
        setStatusActive(String(b?.status ?? "active") === "active");
        setFloorNumber(String(b?.floor_number ?? ""));
        if (b?.building_date) {
          // normalize to YYYY-MM-DD
          setBuildingDate(String(b.building_date).slice(0, 10));
        }

        const apts: Apt[] = Array.isArray(b?.apartments)
          ? b.apartments.map((a: any) => ({
              id: a.id,
              floor_number: String(a.floor_number ?? ""),
              number: String(a.number ?? ""),
              residency_date: a.residency_date ? String(a.residency_date).slice(0, 10) : "",
              price: String(a.price ?? ""),
              listing_type: (a.listing_type as "sale" | "rent") ?? "sale",
              is_available: Boolean(Number(a.is_available ?? 1)),
            }))
          : [];

        setApartments(apts);
      } catch (e) {
        console.error("Fetch building failed:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [buildingId]);

  // ---- handlers ----
  const addApartment = () => {
    setApartments((prev) => [
      ...prev,
      {
        _isNew: true,
        floor_number: "",
        number: "",
        residency_date: "",
        price: "",
        listing_type: "sale",
        is_available: true,
      },
    ]);
  };

  const updateApt = (idx: number, field: keyof Apt, value: any) => {
    setApartments((prev) => {
      const copy = [...prev];
      (copy[idx] as any)[field] = value;
      return copy;
    });
  };

  const toggleDeleteApt = (idx: number) => {
    setApartments((prev) => {
      const copy = [...prev];
      // only existing apts can be marked for deletion
      if (copy[idx].id) {
        copy[idx]._markedForDelete = !copy[idx]._markedForDelete;
      } else {
        // it's a new (unsaved) apt; removing from UI is enough
        copy.splice(idx, 1);
      }
      return copy;
    });
  };

  const onCancel = () => router.push("/buildings");

  // ---- save (POST /buildings/:id) form-data like your Postman “update” ----
  const onSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const fd = new FormData();

      // translations (your postman shows address[en|ar|ku], description[en|ar|ku])
      fd.append("address[ar]", address.ar);
      fd.append("address[en]", address.en);
      fd.append("address[ku]", address.ku);

      fd.append("description[ar]", description.ar);
      fd.append("description[en]", description.en);
      fd.append("description[ku]", description.ku);

      // optional building fields you sent in add:
      if (buildingDate) fd.append("building_date", buildingDate);
      if (floorNumber) fd.append("floor_number", floorNumber);
      fd.append("apartment_number", String(apartments.length));
      fd.append("status", statusActive ? "active" : "inactive");

      // new apartments only (backend “update” sample typically uses
      //   - apartments[...] to add new ones
      //   - delete_apartments[] to remove existing ones)
      let newIdx = 0;
      apartments.forEach((a) => {
        if (a._isNew && !a._markedForDelete) {
          fd.append(`apartments[${newIdx}][floor_number]`, a.floor_number);
          fd.append(`apartments[${newIdx}][number]`, a.number);
          fd.append(`apartments[${newIdx}][price]`, a.price);
          fd.append(`apartments[${newIdx}][listing_type]`, a.listing_type);
          fd.append(`apartments[${newIdx}][is_available]`, a.is_available ? "1" : "0");
          fd.append(`apartments[${newIdx}][residency_date]`, a.residency_date || "");
          newIdx++;
        }
      });

      // deletions
      let delIdx = 0;
      apartments.forEach((a) => {
        if (a.id && a._markedForDelete) {
          fd.append(`delete_apartments[${delIdx}]`, String(a.id));
          delIdx++;
        }
      });

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/buildings/${buildingId}`,
        {
          method: "POST", // your Postman “update” uses POST (form-data)
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Update failed ${res.status}: ${msg}`);
      }

      alert("✅ تم تحديث المبنى بنجاح");
      router.push("/buildings");
    } catch (e) {
      console.error(e);
      alert("❌ فشل تحديث المبنى");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-gray-800" />
          <h1 className="text-2xl font-bold text-gray-900">تعديل المبنى</h1>
        </div>
      </div>

      <Card className="bg-white shadow-sm max-w-4xl mx-auto">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-center">جارٍ التحميل…</p>
          ) : (
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Address (ar/en/ku) */}
              {(["ar", "en", "ku"] as const).map((lang) => (
                <div className="space-y-2" key={`addr-${lang}`}>
                  <Label>
                    العنوان ({lang})<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    value={address[lang]}
                    onChange={(e) => setAddress({ ...address, [lang]: e.target.value })}
                  />
                </div>
              ))}

              {/* Description (ar/en/ku) */}
              {(["ar", "en", "ku"] as const).map((lang) => (
                <div className="space-y-2" key={`desc-${lang}`}>
                  <Label>
                    الوصف ({lang})<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    value={description[lang]}
                    onChange={(e) => setDescription({ ...description, [lang]: e.target.value })}
                  />
                </div>
              ))}

              {/* optional building fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>تاريخ المبنى</Label>
                  <Input
                    type="date"
                    value={buildingDate}
                    onChange={(e) => setBuildingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>عدد الطوابق (اختياري)</Label>
                  <Input
                    type="number"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex items-end gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="mb-0">حالة المبنى</Label>
                    <Switch checked={statusActive} onCheckedChange={setStatusActive} />
                    <span className="text-sm text-gray-600">{statusActive ? "نشط" : "غير نشط"}</span>
                  </div>
                </div>
              </div>

              {/* Apartments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">الشقق</h2>
                  <Button type="button" variant="ghost" onClick={addApartment}>
                    <Plus className="w-4 h-4 mr-1" /> إضافة شقة
                  </Button>
                </div>

                {apartments.length === 0 && (
                  <p className="text-sm text-gray-500">لا توجد شقق حالياً.</p>
                )}

                {apartments.map((apt, idx) => (
                  <div
                    key={`${apt.id ?? "new"}-${idx}`}
                    className={`grid grid-cols-2 md:grid-cols-6 gap-3 border p-4 rounded-md ${
                      apt._markedForDelete ? "opacity-50" : ""
                    }`}
                  >
                    <Input
                      placeholder="الطابق"
                      type="number"
                      value={apt.floor_number}
                      onChange={(e) => updateApt(idx, "floor_number", e.target.value)}
                      disabled={apt._markedForDelete}
                    />
                    <Input
                      placeholder="رقم الشقة"
                      value={apt.number}
                      onChange={(e) => updateApt(idx, "number", e.target.value)}
                      disabled={apt._markedForDelete}
                    />
                    <Input
                      placeholder="تاريخ السكن"
                      type="date"
                      value={apt.residency_date}
                      onChange={(e) => updateApt(idx, "residency_date", e.target.value)}
                      disabled={apt._markedForDelete}
                    />
                    <Input
                      placeholder="السعر"
                      type="number"
                      value={apt.price}
                      onChange={(e) => updateApt(idx, "price", e.target.value)}
                      disabled={apt._markedForDelete}
                    />
                    <Input
                      placeholder="sale / rent"
                      value={apt.listing_type}
                      onChange={(e) =>
                        updateApt(idx, "listing_type", e.target.value as "sale" | "rent")
                      }
                      disabled={apt._markedForDelete}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">متاح</span>
                        <Switch
                          checked={apt.is_available}
                          onCheckedChange={(v) => updateApt(idx, "is_available", v)}
                          disabled={apt._markedForDelete}
                        />
                      </div>

                      <Button
                        type="button"
                        variant={apt._markedForDelete ? "outline" : "destructive"}
                        size="icon"
                        title={apt.id ? "وضع/إلغاء علامة الحذف" : "حذف من القائمة"}
                        onClick={() => toggleDeleteApt(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {apt._markedForDelete && apt.id && (
                      <div className="col-span-2 md:col-span-6 text-xs text-red-600">
                        ستتم إزالة هذه الشقة عند الحفظ.
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  إلغاء
                </Button>
                <Button type="submit" onClick={onSave} disabled={saving} className="bg-primary-500 text-white">
                  {saving ? "جارٍ الحفظ…" : "حفظ التعديلات"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
