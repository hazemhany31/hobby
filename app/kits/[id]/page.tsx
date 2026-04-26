'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { kitService, Kit } from '@/lib/services'
import AuthGuard from '@/components/AuthGuard'
import {
  ArrowLeft, Star, DollarSign, CheckCircle2, PlayCircle,
  Package, Calendar, Loader2, ChevronRight, Wrench
} from 'lucide-react'

const MOCK_KITS: Record<string, Kit> = {
  '1': { _id: '1', name: 'Cinema Photography Kit', category: 'Photography', description: 'Full Sony A7IV setup with 24-70mm lens, tripod, LED panel, and reflectors. Perfect for portraits and street photography.', price: 45, depositAmount: 200, rating: 4.8, reviewCount: 124, tools: ['Sony A7IV Body', '24-70mm f/2.8 Lens', 'Heavy-Duty Tripod', 'LED Light Panel', 'Reflector Set', 'Memory Cards (x3)', 'UV Filter', 'Camera Bag'] },
  '2': { _id: '2', name: 'Home Recording Studio', category: 'Music', description: 'Professional condenser mic, audio interface, studio headphones, and acoustic foam panels. Record like a pro at home.', price: 35, depositAmount: 150, rating: 4.9, reviewCount: 89, tools: ['Shure SM7B Microphone', 'Focusrite Scarlett 2i2', 'Sony MDR-7506 Headphones', 'Pop Filter', 'Mic Stand', 'XLR Cables (x2)', 'Acoustic Panels'] },
  '3': { _id: '3', name: 'Digital Art Starter Kit', category: 'Art', description: 'Wacom Cintiq drawing tablet, stylus, and access to Adobe Creative Cloud for a full digital art workflow.', price: 28, depositAmount: 120, rating: 4.7, reviewCount: 67, tools: ['Wacom Cintiq 16"', 'Pro Stylus Pen', 'Adobe CC Trial Access', 'Screen Protector', 'Stylus Stand', 'USB-C Hub'] },
  '4': { _id: '4', name: 'Drone Aerial Kit', category: 'Tech', description: 'DJI Mini 4 Pro with 3 batteries, ND filters, and carrying case. 4K footage ready to fly.', price: 60, depositAmount: 300, rating: 4.9, reviewCount: 203, tools: ['DJI Mini 4 Pro', '3x Intelligent Flight Batteries', 'ND Filter Set (4/8/16/64)', 'Carrying Case', 'Charging Hub', 'Spare Propellers'] },
  '5': { _id: '5', name: 'Mountain Bike Adventure', category: 'Sports', description: 'Trek Marlin 7 mountain bike with helmet, gloves, and repair kit. Trails await.', price: 25, depositAmount: 100, rating: 4.6, reviewCount: 55, tools: ['Trek Marlin 7 Bike', 'Bell Helmet', 'Gloves', 'Repair Kit', 'Water Bottle', 'Lock & Key'] },
  '6': { _id: '6', name: 'Camping Essentials Kit', category: 'Outdoor', description: 'A complete camping package with 4-person tent, sleeping bags, camp stove, and navigation tools.', price: 40, depositAmount: 180, rating: 4.7, reviewCount: 91, tools: ['4-Person Tent', '2x Sleeping Bags (3-Season)', 'Camp Stove & Fuel', 'Compass', 'Headlamps (x2)', 'First Aid Kit', 'Cookware Set'] },
}

export default function KitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [kit, setKit] = useState<Kit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params.id as string
    const fetchKit = async () => {
      try {
        const { data } = await kitService.getById(id)
        setKit(data)
      } catch {
        setKit(MOCK_KITS[id] || null)
      } finally {
        setLoading(false)
      }
    }
    fetchKit()
  }, [params.id])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Back */}
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-sm mb-8 transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          {loading ? (
            <div className="flex flex-col items-center py-32 gap-4">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : !kit ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
              <div className="text-5xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kit not found</h2>
              <Link href="/dashboard" className="btn-primary mt-6">Back to Dashboard</Link>
            </div>
          ) : (
            <div className="page-enter space-y-8">
              {/* Hero section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-2 w-full bg-primary" />
                <div className="p-8 sm:p-10 flex flex-col lg:flex-row gap-12">
                  {/* Left */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="badge-primary capitalize">{kit.category}</span>
                      {kit.available !== false && <span className="badge-success">Available Now</span>}
                      {kit.available === false && <span className="badge-danger">Currently Rented</span>}
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">{kit.name}</h1>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">{kit.description}</p>

                    {/* Rating */}
                    {kit.rating && (
                      <div className="flex items-center gap-2 mb-8 bg-gray-50 px-4 py-2 rounded-lg inline-flex">
                        <div className="flex gap-1 text-primary">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={18}
                              className={s <= Math.round(kit.rating!) ? 'text-primary' : 'text-gray-300'}
                              fill={s <= Math.round(kit.rating!) ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-gray-900 ml-1">{kit.rating.toFixed(1)}</span>
                        <span className="text-sm font-medium text-gray-500">({kit.reviewCount} reviews)</span>
                      </div>
                    )}

                    {/* Pricing Pill */}
                    <div className="flex flex-wrap gap-6">
                      <div>
                        <span className="section-label">Daily Rate</span>
                        <div className="flex items-baseline gap-1 mt-1">
                           <span className="text-2xl font-bold text-gray-900">$</span>
                           <span className="text-4xl font-black text-gray-900">{kit.price}</span>
                        </div>
                      </div>
                      
                      {kit.depositAmount && (
                         <>
                           <div className="w-px bg-gray-200 hidden sm:block" />
                           <div>
                             <span className="section-label">Security Deposit</span>
                             <div className="flex items-baseline gap-1 mt-1 text-gray-600">
                                <span className="text-xl font-bold">$</span>
                                <span className="text-3xl font-bold">{kit.depositAmount}</span>
                             </div>
                             <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wide">Fully refundable</p>
                           </div>
                         </>
                      )}
                    </div>
                  </div>

                  {/* Right — Rent CTA */}
                  <div className="lg:w-80 shrink-0">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 sticky top-28">
                      <h3 className="section-label mb-4">Rental Summary</h3>
                      <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">Free Delivery & Pickup</p>
                            <p className="text-xs text-gray-500 mt-0.5">Straight to your door</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">Damage Protection</p>
                            <p className="text-xs text-gray-500 mt-0.5">Full coverage included</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">No Hidden Fees</p>
                            <p className="text-xs text-gray-500 mt-0.5">Deposit refunded on return</p>
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        href={`/rent/${kit._id}`}
                        id={`rent-kit-${kit._id}`}
                        className="btn-primary w-full text-lg py-4 shadow-lg"
                      >
                        <Calendar size={20} />
                        Choose Dates
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools List */}
              {kit.tools && kit.tools.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Wrench size={20} className="text-gray-900" />
                      </div>
                      What's in the Box
                    </h2>
                    <span className="badge-neutral">{kit.tools.length} items</span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {kit.tools.map((tool, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
                          <CheckCircle2 size={16} className="text-gray-900" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tutorials */}
              {kit.tutorials && kit.tutorials.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10">
                  <div className="border-b border-gray-100 pb-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <PlayCircle size={20} className="text-gray-900" />
                      </div>
                      Tutorials & Getting Started
                    </h2>
                  </div>
                  <div className="grid gap-4">
                    {kit.tutorials.map((t, i) => (
                      <a key={i} href={t.url}
                        className="flex items-center justify-between p-5 rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group bg-white"
                        target="_blank" rel="noreferrer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                            <PlayCircle size={24} fill="currentColor" className="text-red-100" />
                          </div>
                          <span className="text-base font-bold text-gray-900">{t.title}</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
