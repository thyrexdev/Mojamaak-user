'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

export default function AddApartmentPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  const [formData, setFormData] = useState({
    floor_number: '',
    number: '',
    price: '',
    listing_type: '',
    is_available: '1',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem('token')
    if (!token) return toast.error('Token manquant')

    const body = new FormData()
    body.append('apartments[0][floor_number]', formData.floor_number)
    body.append('apartments[0][number]', formData.number)
    body.append('apartments[0][price]', formData.price)
    body.append('apartments[0][listing_type]', formData.listing_type)
    body.append('apartments[0][is_available]', formData.is_available)

    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/buildings/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      })

      if (!res.ok) throw new Error('Erreur lors de l’ajout')

      toast.success('تمت إضافة الشقة بنجاح')
      router.push('/buildings')
    } catch (err) {
      console.error(err)
      toast.error('فشل في إضافة الشقة')
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto font-arabic" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إضافة شقة جديدة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>الطابق</Label>
            <Input name="floor_number" value={formData.floor_number} onChange={handleChange} />
          </div>
          <div>
            <Label>رقم الشقة</Label>
            <Input name="number" value={formData.number} onChange={handleChange} />
          </div>
          <div>
            <Label>السعر</Label>
            <Input name="price" value={formData.price} onChange={handleChange} />
          </div>
          <div>
            <Label>نوع العرض</Label>
            <Input
              name="listing_type"
              placeholder="sale / rent"
              value={formData.listing_type}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>الحالة</Label>
            <select
              name="is_available"
              className="w-full border rounded px-3 py-2"
              value={formData.is_available}
              onChange={handleChange}
            >
              <option value="1">متوفرة</option>
              <option value="0">محجوزة</option>
            </select>
          </div>

          <Button onClick={handleSubmit} className="bg-primary-500 hover:bg-primary-600 text-white w-full">
            تأكيد الإضافة
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
