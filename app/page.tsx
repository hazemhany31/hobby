'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  ArrowRight, Camera, Music, Palette, Cpu, Bike, Leaf,
  Star, Shield, Truck, RotateCcw, Zap, CheckCircle2
} from 'lucide-react'

const categories = [
  { name: 'Photography', icon: Camera, desc: 'DSLRs, lenses, lighting' },
  { name: 'Music', icon: Music, desc: 'Guitars, keyboards, mics' },
  { name: 'Art & Design', icon: Palette, desc: 'Paints, tablets, supplies' },
  { name: 'Technology', icon: Cpu, desc: '3D printers, drones, VR' },
  { name: 'Sports', icon: Bike, desc: 'Bikes, boards, gear' },
  { name: 'Outdoor', icon: Leaf, desc: 'Camping, hiking kits' },
]

const features = [
  { icon: Shield, title: 'Fully Insured', desc: 'Every kit is insured. Rent with zero stress.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Next-day delivery to your door.' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Free pickup when your rental ends.' },
  { icon: Star, title: 'Expert Kits', desc: 'Curated tools used by real hobbyists.' },
]

const testimonials = [
  { name: 'Sara M.', role: 'Photographer', text: 'Tried a cinema camera before buying. Saved me $3,000!', rating: 5 },
  { name: 'Ahmed K.', role: 'Musician', text: 'Rented a full recording setup for a weekend. Mind-blowing.', rating: 5 },
  { name: 'Lena T.', role: 'Artist', text: 'The art kit had everything I needed. Quality was premium.', rating: 5 },
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 page-enter">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold bg-primary/10 text-primary-700 border border-primary/20">
              <Zap size={16} className="text-primary-600" />
              The smart way to explore hobbies
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight mb-8">
              Rent Any <span className="text-primary">Hobby Kit.</span>
              <br />
              <span className="text-gray-900">Explore Everything.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
              Photography, music, art, tech — rent professional kits for days or weeks. 
              Try before you invest thousands. Delivered to your door.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/auth/register" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                Start Exploring Free
                <ArrowRight size={20} />
              </Link>
              <Link href="/auth/login" className="btn-outline text-lg px-8 py-4 w-full sm:w-auto">
                Sign In
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-center items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold">SM</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-200 flex items-center justify-center text-xs font-bold text-primary-800">AK</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-800">LT</div>
                </div>
                <span className="text-sm font-semibold text-gray-600">2,400+ happy renters</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-primary">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                </div>
                <span className="text-sm font-semibold text-gray-600">4.9/5 Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER ──────────────────────────────────── */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="section-label">Categories</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Every Hobby, Covered</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">Choose from hundreds of curated kits designed to give you the perfect start.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link key={idx} href="/auth/register" className="card-hover p-6 flex items-start gap-4 group">
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 group-hover:bg-primary group-hover:border-primary transition-colors">
                <cat.icon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-gray-600 text-sm">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-label">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Rent in 3 Steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gray-100 -z-10" />
            {[
              { n: '1', title: 'Choose a Kit', desc: 'Browse hundreds of curated hobby kits across 6 categories.' },
              { n: '2', title: 'Pick Duration', desc: 'Rent for 1 day to 30 days. Flexible pricing, no commitments.' },
              { n: '3', title: 'Get Delivered', desc: 'We deliver to your door and pick up when you\'re done.' },
            ].map((step) => (
              <div key={step.n} className="bg-white px-6 py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-2xl font-black text-gray-900 mb-6 shadow-primary z-10">
                  {step.n}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="section-label">Why HobbyGo</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">Built for Explorers, Designed for Trust</h2>
            <p className="text-lg text-gray-600 mb-8">We take the friction out of trying new things. Every rental is backed by our comprehensive protection policy.</p>
            
            <div className="space-y-6">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200">
                    <f.icon size={20} className="text-gray-900" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{f.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-[2rem] transform translate-x-6 translate-y-6" />
            <div className="relative bg-black rounded-[2rem] p-10 text-white shadow-2xl">
               <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                 <Star className="text-primary" fill="currentColor" />
                 Hear from Renters
               </h3>
               <div className="space-y-8">
                 {testimonials.map((t, i) => (
                   <div key={i}>
                     <p className="text-lg mb-4 leading-relaxed font-medium">"{t.text}"</p>
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-primary">{t.name[0]}</div>
                       <div>
                         <p className="font-bold">{t.name}</p>
                         <p className="text-sm text-gray-400">{t.role}</p>
                       </div>
                     </div>
                     {i < testimonials.length - 1 && <hr className="border-gray-800 mt-8" />}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Ready to find your next passion?
            </h2>
            <p className="text-gray-800 text-xl mb-10 font-medium">
              Join 2,400+ hobbyists. Your first rental has zero commitment.
            </p>
            <Link href="/auth/register" className="btn-secondary text-lg px-10 py-5 inline-flex shadow-lg shadow-black/20">
              Create Free Account
              <ArrowRight size={20} />
            </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <Zap size={16} className="text-primary" fill="currentColor" />
            </div>
            <span className="font-bold text-gray-900 text-xl tracking-tight">HobbyGo</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">© {new Date().getFullYear()} HobbyGo. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-semibold text-gray-600">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
