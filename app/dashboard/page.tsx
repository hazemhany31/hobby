'use client'

import { useEffect, useState } from 'react'
import { kitService, Kit } from '@/lib/services'
import { useAuth } from '@/lib/auth-context'
import AuthGuard from '@/components/AuthGuard'
import KitCard from '@/components/KitCard'
import { Search, SlidersHorizontal, Zap, TrendingUp, X } from 'lucide-react'

const CATEGORIES = ['All', 'Photography', 'Music', 'Art', 'Tech', 'Sports', 'Outdoor']

const MOCK_KITS: Kit[] = [
  { _id: '1', name: 'Cinema Photography Kit', category: 'Photography', description: 'Full Sony A7IV setup with 24-70mm lens, tripod, LED panel, and reflectors. Perfect for portraits and street photography.', price: 45, depositAmount: 200, rating: 4.8, reviewCount: 124, available: true, tools: ['Sony A7IV', '24-70mm f/2.8', 'Tripod', 'LED Panel', 'Reflector'], tutorials: [{ title: 'Getting Started with Sony A7IV', url: '#' }] },
  { _id: '2', name: 'Home Recording Studio', category: 'Music', description: 'Professional condenser mic, audio interface, studio headphones, and acoustic foam panels. Record like a pro.', price: 35, depositAmount: 150, rating: 4.9, reviewCount: 89, available: true, tools: ['Shure SM7B Mic', 'Focusrite Interface', 'Studio Headphones', 'Pop Filter'], tutorials: [{ title: 'Recording Vocals at Home', url: '#' }] },
  { _id: '3', name: 'Digital Art Starter Kit', category: 'Art', description: 'Wacom Cintiq drawing tablet, stylus, and access to Adobe Creative Cloud for a full digital art workflow.', price: 28, depositAmount: 120, rating: 4.7, reviewCount: 67, available: true, tools: ['Wacom Cintiq 16', 'Stylus Pen', 'Adobe CC Access'], tutorials: [{ title: 'Digital Illustration Basics', url: '#' }] },
  { _id: '4', name: 'Drone Aerial Kit', category: 'Tech', description: 'DJI Mini 4 Pro with 3 batteries, ND filters, and carrying case. 4K footage ready to fly.', price: 60, depositAmount: 300, rating: 4.9, reviewCount: 203, available: true, tools: ['DJI Mini 4 Pro', '3x Batteries', 'ND Filter Set', 'Carrying Case'], tutorials: [{ title: 'Safe Drone Flying for Beginners', url: '#' }] },
  { _id: '5', name: 'Mountain Bike Adventure', category: 'Sports', description: 'Trek Marlin 7 mountain bike with helmet, gloves, and repair kit. Trails await.', price: 25, depositAmount: 100, rating: 4.6, reviewCount: 55, available: true, tools: ['Trek Marlin 7', 'Helmet', 'Gloves', 'Repair Kit'], tutorials: [{ title: 'Basic Trail Riding Techniques', url: '#' }] },
  { _id: '6', name: 'Camping Essentials Kit', category: 'Outdoor', description: 'A complete camping package with 4-person tent, sleeping bags, camp stove, and navigation tools.', price: 40, depositAmount: 180, rating: 4.7, reviewCount: 91, available: true, tools: ['4-Person Tent', '2x Sleeping Bags', 'Camp Stove', 'Compass', 'First Aid Kit'], tutorials: [{ title: 'Leave No Trace Camping', url: '#' }] },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [kits, setKits] = useState<Kit[]>([])
  const [filtered, setFiltered] = useState<Kit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular')

  useEffect(() => {
    const fetchKits = async () => {
      try {
        const { data } = await kitService.getAll()
        const list = Array.isArray(data) && data.length > 0 ? data : MOCK_KITS
        setKits(list)
        setFiltered(list)
      } catch {
        setKits(MOCK_KITS)
        setFiltered(MOCK_KITS)
      } finally {
        setLoading(false)
      }
    }
    fetchKits()
  }, [])

  useEffect(() => {
    let result = [...kits]
    if (activeCategory !== 'All') {
      result = result.filter(k => k.category?.toLowerCase() === activeCategory.toLowerCase())
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(k =>
        k.name.toLowerCase().includes(q) || k.description.toLowerCase().includes(q)
      )
    }
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price)
    else result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    setFiltered(result)
  }, [kits, search, activeCategory, sortBy])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-12 page-enter">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={20} className="text-primary" fill="currentColor" />
              <span className="text-primary-700 font-bold uppercase tracking-widest text-xs">Welcome back, {user?.name?.split(' ')[0]}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Browse Hobby Kits</h1>
            <p className="text-gray-600 mt-3 text-lg font-medium">
              {kits.length} kits available right now — what will you try next?
            </p>
          </div>

          {/* Controls: Search, Sort, Filters */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-10 page-enter">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="kit-search"
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-10 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Search gear, categories, brands..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                )}
              </div>
              
              {/* Sort */}
              <div className="relative min-w-[200px]">
                <SlidersHorizontal size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  id="kit-sort"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-10 py-3.5 text-gray-900 font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  id={`filter-${cat.toLowerCase()}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-black text-primary shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Info */}
          {!loading && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                <TrendingUp size={16} className="text-primary-600" />
                Showing {filtered.length} results
                {search && <span className="text-gray-400 font-normal">for "{search}"</span>}
              </div>
            </div>
          )}

          {/* Kits Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 flex flex-col gap-4">
                  <div className="skeleton h-14 w-14 rounded-xl" />
                  <div className="skeleton h-6 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                  <div className="flex justify-between mt-6 pt-6 border-t border-gray-100">
                    <div className="skeleton h-8 w-24 rounded" />
                    <div className="skeleton h-10 w-10 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No kits found</h3>
              <p className="text-gray-500 font-medium">Try adjusting your filters or search term to find what you're looking for.</p>
              <button onClick={() => { setSearch(''); setActiveCategory('All') }}
                className="btn-primary mt-8">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((kit, i) => (
                <div key={kit._id} style={{ animationDelay: `${i * 50}ms` }} className="page-enter">
                  <KitCard kit={kit} />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </AuthGuard>
  )
}
