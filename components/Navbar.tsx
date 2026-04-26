'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Menu, X, Zap, LogOut, User, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center transition-transform group-hover:scale-105">
              <Zap size={18} className="text-primary" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">HobbyGo</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Browse Kits
                </Link>
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                    pathname === '/profile'
                      ? 'text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User size={18} />
                  {user?.name?.split(' ')[0]}
                </Link>
                <div className="w-px h-5 bg-gray-200" />
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm px-5 py-2.5">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md pb-4">
          <div className="px-4 pt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={20} className="text-gray-400" /> Browse Kits
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={20} className="text-gray-400" /> Profile
                </Link>
                <div className="my-2 border-t border-gray-100 px-4" />
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 font-medium hover:bg-red-50 transition-all text-left"
                >
                  <LogOut size={20} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary flex justify-center mt-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
