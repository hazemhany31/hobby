'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { rentalService, Rental } from '@/lib/services'
import AuthGuard from '@/components/AuthGuard'
import {
  User, Star, Calendar, Package, Clock, CheckCircle2,
  LayoutDashboard, LogOut, TrendingUp, ArrowRight
} from 'lucide-react'

const MOCK_RENTALS: Rental[] = [
  {
    _id: 'r1',
    kit: { _id: '4', name: 'Drone Aerial Kit', category: 'Tech', description: '', price: 60, depositAmount: 300 },
    user: 'me',
    duration: 3,
    totalCost: 180,
    depositAmount: 300,
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
  },
  {
    _id: 'r2',
    kit: { _id: '1', name: 'Cinema Photography Kit', category: 'Photography', description: '', price: 45, depositAmount: 200 },
    user: 'me',
    duration: 7,
    totalCost: 315,
    depositAmount: 200,
    status: 'completed',
    startDate: new Date(Date.now() - 14 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
]

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    rentalService.getUserRentals()
      .then(({ data }) => setRentals(Array.isArray(data) && data.length > 0 ? data : MOCK_RENTALS))
      .catch(() => setRentals(MOCK_RENTALS))
      .finally(() => setLoading(false))
  }, [])

  const activeRentals = rentals.filter(r => r.status === 'active')
  const completedRentals = rentals.filter(r => r.status === 'completed')
  const totalSpent = rentals.reduce((s, r) => s + r.totalCost, 0)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const daysLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86400000))
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Profile Header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8 page-enter relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />
            
            <div className="relative flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-black flex items-center justify-center text-4xl font-black text-primary shadow-lg shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{user?.name}</h1>
                <p className="text-gray-500 font-medium mb-4">{user?.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <Star size={16} className="text-primary" fill="currentColor" />
                    <span className="text-sm font-bold text-gray-900">{(user?.rating || 5.0).toFixed(1)}</span>
                  </div>
                  <span className="badge-success">Verified Renter</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/dashboard" className="btn-primary text-sm px-6 py-3 shrink-0">
                  <LayoutDashboard size={16} />
                  Browse Kits
                </Link>
                <button onClick={logout} className="btn-outline text-sm px-6 py-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shrink-0">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Rentals', value: rentals.length, icon: Package, color: 'text-gray-900', bg: 'bg-white' },
              { label: 'Active Now', value: activeRentals.length, icon: Clock, color: 'text-success', bg: 'bg-green-50 text-success border-success/20' },
              { label: 'Completed', value: completedRentals.length, icon: CheckCircle2, color: 'text-gray-600', bg: 'bg-white' },
              { label: 'Total Spent', value: `$${totalSpent}`, icon: TrendingUp, color: 'text-gray-900', bg: 'bg-white' },
            ].map((stat, i) => (
              <div key={i} className={`rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center ${stat.bg.includes('bg-white') ? 'bg-white border-gray-200' : stat.bg}`}>
                <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100 ${stat.bg.includes('text-success') ? '!bg-white border-transparent' : ''}`}>
                  <stat.icon size={20} className={stat.bg.includes('text-success') ? 'text-success' : 'text-gray-400'} />
                </div>
                <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-sm font-semibold text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Active Rentals */}
          {activeRentals.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-success" />
                Active Rentals
              </h2>
              <div className="grid gap-4">
                {activeRentals.map(rental => (
                  <div key={rental._id} className="bg-white rounded-2xl border border-green-200 shadow-sm p-6 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-success" />
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="badge-success">Active</span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{rental.kit.category}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl mb-3">{rental.kit.name}</h3>
                        <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                            <Calendar size={14} className="text-gray-400" /> 
                            {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
                          </span>
                          <span className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-green-700">
                            <Clock size={14} /> 
                            {daysLeft(rental.endDate)} days left
                          </span>
                        </div>
                      </div>
                      <div className="md:text-right shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-200 w-full md:w-auto">
                        <div className="text-sm font-semibold text-gray-500 mb-1 uppercase text-left md:text-right">Total Paid</div>
                        <div className="text-3xl font-black text-gray-900">${rental.totalCost}</div>
                        <div className="text-xs font-semibold text-gray-400 mt-1 uppercase text-left md:text-right">{rental.duration} days</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rental History */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-gray-400" />
              History
            </h2>
            {loading ? (
              <div className="space-y-4">
                {[1,2].map(i => (
                  <div key={i} className="card p-6">
                    <div className="skeleton h-6 w-1/2 rounded mb-3" />
                    <div className="skeleton h-4 w-1/3 rounded" />
                  </div>
                ))}
              </div>
            ) : completedRentals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-500 font-medium">No completed rentals yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {completedRentals.map(rental => (
                  <div key={rental._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-gray-300 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="badge-neutral border border-gray-200">Returned</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{rental.kit.category}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{rental.kit.name}</h3>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
                      </p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <div className="text-2xl font-black text-gray-900">${rental.totalCost}</div>
                      <div className="text-xs font-semibold text-gray-400 mt-1 uppercase sm:text-right">{rental.duration} days</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
