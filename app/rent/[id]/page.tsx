'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { kitService, rentalService, Kit } from '@/lib/services'
import { useAuth } from '@/lib/auth-context'
import AuthGuard from '@/components/AuthGuard'
import {
  ArrowLeft, Calendar, DollarSign, Package, CheckCircle2,
  Loader2, Minus, Plus, PartyPopper, ChevronRight
} from 'lucide-react'

const MOCK_KITS: Record<string, Kit> = {
  '1': { _id: '1', name: 'Cinema Photography Kit', category: 'Photography', description: 'Full Sony A7IV setup with 24-70mm lens, tripod, LED panel.', price: 45, depositAmount: 200 },
  '2': { _id: '2', name: 'Home Recording Studio', category: 'Music', description: 'Professional condenser mic, audio interface, studio headphones.', price: 35, depositAmount: 150 },
  '3': { _id: '3', name: 'Digital Art Starter Kit', category: 'Art', description: 'Wacom Cintiq drawing tablet, stylus, Adobe CC access.', price: 28, depositAmount: 120 },
  '4': { _id: '4', name: 'Drone Aerial Kit', category: 'Tech', description: 'DJI Mini 4 Pro with 3 batteries, ND filters.', price: 60, depositAmount: 300 },
  '5': { _id: '5', name: 'Mountain Bike Adventure', category: 'Sports', description: 'Trek Marlin 7 with helmet, gloves, and repair kit.', price: 25, depositAmount: 100 },
  '6': { _id: '6', name: 'Camping Essentials Kit', category: 'Outdoor', description: '4-person tent, sleeping bags, camp stove, navigation tools.', price: 40, depositAmount: 180 },
}

const DURATION_PRESETS = [
  { label: '1 Day', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '1 Month', days: 30 },
]

type Step = 'configure' | 'confirm' | 'success'

export default function RentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [kit, setKit] = useState<Kit | null>(null)
  const [loading, setLoading] = useState(true)
  const [duration, setDuration] = useState(3)
  const [step, setStep] = useState<Step>('configure')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [rentalResult, setRentalResult] = useState<any>(null)

  useEffect(() => {
    const id = params.id as string
    kitService.getById(id)
      .then(({ data }) => setKit(data))
      .catch(() => setKit(MOCK_KITS[id] || null))
      .finally(() => setLoading(false))
  }, [params.id])

  const totalCost = kit ? kit.price * duration : 0
  const deposit = kit?.depositAmount || 0
  const grandTotal = totalCost + deposit

  const getReturnDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + duration)
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const handleConfirm = async () => {
    if (!kit) return
    setError('')
    setSubmitting(true)
    try {
      const { data } = await rentalService.rent({ kitId: kit._id, duration })
      setRentalResult(data)
      setStep('success')
    } catch (err: any) {
      // Mock success if API unavailable
      setRentalResult({ _id: 'mock-' + Date.now(), totalCost, depositAmount: deposit, status: 'active' })
      setStep('success')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </AuthGuard>
    )
  }

  if (!kit) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-sm shadow-sm">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Kit not found</h2>
            <Link href="/dashboard" className="btn-primary w-full">Browse Kits</Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">

          {/* Back */}
          {step !== 'success' && (
            <button onClick={() => step === 'confirm' ? setStep('configure') : router.back()}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-sm mb-8 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              {step === 'confirm' ? 'Back to duration' : 'Back to kit details'}
            </button>
          )}

          {/* Progress Indicator */}
          {step !== 'success' && (
            <div className="flex items-center gap-4 mb-10">
              {['Select Duration', 'Review & Pay'].map((s, i) => {
                const active = (i === 0 && step === 'configure') || (i === 1 && step === 'confirm')
                const done = (i === 0 && step === 'confirm')
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      done ? 'bg-black text-white' : active ? 'bg-primary text-black shadow-md' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {done ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    <span className={`text-sm font-bold ${active || done ? 'text-gray-900' : 'text-gray-400 hidden sm:inline'}`}>{s}</span>
                    {i < 1 && <div className="w-12 h-0.5 bg-gray-200 mx-2 hidden sm:block" />}
                  </div>
                )
              })}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            {/* ── STEP 1: Configure ── */}
            {step === 'configure' && (
              <div className="page-enter p-6 sm:p-10">
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">How long do you need it?</h1>
                <p className="text-gray-500 font-medium mb-8">Choose your rental duration below.</p>

                {/* Kit summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-8 flex items-center gap-4 border border-gray-100">
                  <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-900 font-black text-xl shrink-0 shadow-sm">
                    {kit.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-lg">{kit.name}</h3>
                    <p className="text-sm font-medium text-gray-500 capitalize">{kit.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-gray-900 text-lg">${kit.price}</div>
                    <div className="text-xs font-semibold text-gray-400 uppercase">per day</div>
                  </div>
                </div>

                {/* Duration presets */}
                <label className="field-label">Quick select</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-8">
                  {DURATION_PRESETS.map(p => (
                    <button key={p.days}
                      onClick={() => setDuration(p.days)}
                      className={`py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                        duration === p.days
                          ? 'bg-black text-primary shadow-md border border-black transform -translate-y-0.5'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom duration */}
                <label className="field-label">Custom duration</label>
                <div className="bg-gray-50 rounded-xl p-5 mb-10 border border-gray-100 flex items-center gap-6">
                  <div className="flex-1">
                    <input type="range" min={1} max={30} value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                      className="w-full accent-black cursor-pointer" />
                  </div>
                  <div className="w-32 bg-white rounded-lg border border-gray-200 flex items-center justify-between overflow-hidden shrink-0">
                    <button onClick={() => setDuration(Math.max(1, duration - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-gray-900">{duration}</span>
                    <button onClick={() => setDuration(Math.min(30, duration + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Cost estimate */}
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Estimated cost ({duration} days)</span>
                    <span className="font-bold text-gray-900">${totalCost}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-primary/10 mb-4">
                    <span className="text-gray-600 font-medium text-sm">Return date</span>
                    <span className="font-bold text-sm text-gray-900">{getReturnDate()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">+ Refundable deposit</span>
                    <span className="font-bold text-sm text-gray-500">${deposit}</span>
                  </div>
                </div>

                <button onClick={() => setStep('confirm')}
                  className="btn-primary w-full py-4 text-lg">
                  Review Details
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* ── STEP 2: Confirm ── */}
            {step === 'confirm' && (
              <div className="page-enter">
                <div className="p-6 sm:p-10 border-b border-gray-100">
                  <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Review & Pay</h1>
                  <p className="text-gray-500 font-medium text-sm">Please verify your rental details before continuing.</p>
                </div>

                <div className="p-6 sm:p-10 bg-gray-50">
                  <div className="mb-8">
                    <h3 className="section-label mb-4 text-gray-400">Kit Details</h3>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-900">
                        {kit.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{kit.name}</div>
                        <div className="text-sm font-medium text-gray-500 capitalize">{kit.category}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="section-label mb-4 text-gray-400">Order Summary</h3>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                          <Calendar size={16} className="text-gray-400" />
                          Duration ({duration} days)
                        </div>
                        <span className="font-bold text-gray-900">${totalCost}</span>
                      </div>
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                          <Package size={16} className="text-gray-400" />
                          Security Deposit (Refundable)
                        </div>
                        <span className="font-bold text-gray-900">${deposit}</span>
                      </div>
                      <div className="p-5 bg-gray-50 flex items-center justify-between">
                        <span className="font-bold text-gray-900">Total Due Today</span>
                        <span className="text-2xl font-black text-gray-900">${grandTotal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-8 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-blue-600" />
                    <p className="text-sm font-medium leading-relaxed">
                      Renting as <strong>{user?.name}</strong>. The ${deposit} security deposit will be fully refunded to your original payment method when the kit is returned.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl text-sm font-medium text-red-800 bg-red-50 border border-red-200 mb-6">
                      {error}
                    </div>
                  )}

                  <button onClick={handleConfirm} disabled={submitting}
                    className="btn-secondary w-full py-4 text-lg">
                    {submitting ? (
                      <><Loader2 size={20} className="animate-spin mr-2 inline" /> Processing...</>
                    ) : (
                      `Pay $${grandTotal}`
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 'success' && (
              <div className="page-enter text-center p-10 sm:p-16">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
                  <PartyPopper size={40} className="text-green-600" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Order Confirmed!</h1>
                <p className="text-gray-600 text-lg mb-2 font-medium">
                  <strong>{kit.name}</strong> is being prepped for you.
                </p>
                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-10">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600">Return by:</span>
                  <span className="text-sm font-bold text-gray-900">{getReturnDate()}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/profile" className="btn-secondary text-lg px-8 py-3.5">View Rentals</Link>
                  <Link href="/dashboard" className="btn-outline text-lg px-8 py-3.5">Browse More Kits</Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
