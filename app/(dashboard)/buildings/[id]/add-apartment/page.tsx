'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, Plus, ArrowLeft } from 'lucide-react'

// Zod validation schema
const apartmentSchema = z.object({
  floor_number: z.string()
    .min(1, 'رقم الطابق مطلوب')
    .regex(/^\d+$/, 'يجب أن يكون رقم الطابق رقماً صحيحاً'),
  number: z.string()
    .min(1, 'رقم الشقة مطلوب')
    .max(10, 'رقم الشقة يجب أن يكون أقل من 10 أحرف'),
  price: z.string()
    .min(1, 'السعر مطلوب')
    .regex(/^\d+(\.\d{1,2})?$/, 'السعر يجب أن يكون رقماً صحيحاً'),
  listing_type: z.enum(['sale', 'rent'], {
    errorMap: () => ({ message: 'يجب اختيار نوع العرض (بيع أو إيجار)' })
  }),
  is_available: z.enum(['0', '1'])
})

type ApartmentFormData = z.infer<typeof apartmentSchema>

export default function AddApartmentPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  const form = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      floor_number: '',
      number: '',
      price: '',
      listing_type: 'sale',
      is_available: '1',
    },
  })

  const onSubmit = async (data: ApartmentFormData) => {
    setIsSubmitting(true)
    
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('خطأ في المصادقة', {
        description: 'لم يتم العثور على رمز الدخول'
      })
      setIsSubmitting(false)
      return
    }

    const body = new FormData()
    body.append('apartments[0][floor_number]', data.floor_number)
    body.append('apartments[0][number]', data.number)
    body.append('apartments[0][price]', data.price)
    body.append('apartments[0][listing_type]', data.listing_type)
    body.append('apartments[0][is_available]', data.is_available)

    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/buildings/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'فشل في إضافة الشقة')
      }

      toast.success('تم بنجاح!', {
        description: 'تمت إضافة الشقة بنجاح'
      })
      
      router.push('/buildings')
    } catch (error) {
      toast.error('حدث خطأ', {
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الشقة'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto p-6 max-w-2xl font-arabic" dir="rtl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              إضافة شقة جديدة
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              أدخل تفاصيل الشقة الجديدة في المبنى
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            رجوع
          </Button>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800 transition-colors duration-200">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
              <Plus className="w-5 h-5 ml-2 text-blue-500" />
              بيانات الشقة
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Floor Number */}
                  <FormField
                    control={form.control}
                    name="floor_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                          رقم الطابق
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="مثال: 1"
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-colors"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Apartment Number */}
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                          رقم الشقة
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="مثال: 101"
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-colors"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                        السعر
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="مثال: 250000"
                          className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-colors"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Listing Type */}
                  <FormField
                    control={form.control}
                    name="listing_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                          نوع العرض
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white">
                              <SelectValue placeholder="اختر نوع العرض" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectItem value="sale" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                              للبيع
                            </SelectItem>
                            <SelectItem value="rent" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                              للإيجار
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Availability Status */}
                  <FormField
                    control={form.control}
                    name="is_available"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                          حالة التوفر
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white">
                              <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectItem value="1" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                              متوفرة
                            </SelectItem>
                            <SelectItem value="0" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                              محجوزة
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 dark:text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 ml-2" />
                        تأكيد الإضافة
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}