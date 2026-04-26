'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { authService } from '@/lib/services'
import { Eye, EyeOff, Loader2, Zap, ArrowRight, Mail, Lock, User } from 'lucide-react'

export default function RegisterPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) { router.replace('/dashboard'); return null }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await authService.register(form)
      login(data.token, data.user)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3

  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500']
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong']

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center page-enter">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Zap size={24} className="text-primary" fill="currentColor" />
          </div>
        </Link>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          Start exploring hobbies today — it's free
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md page-enter-fast relative z-10 mb-12">
        <div className="bg-white py-10 px-4 shadow-sm border border-gray-200 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="field-label">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-field pl-10"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="field-label">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="field-label">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1 h-1.5">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                            strength >= step ? strengthColors[strength] : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${strength === 1 ? 'text-red-600' : strength === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin mr-2" /> Creating account...</>
                ) : (
                  <>Create Account <ArrowRight size={20} className="ml-2" /></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">Or</span>
              </div>
            </div>

            <div className="mt-8 text-center text-sm font-medium">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/auth/login" className="text-gray-900 font-bold hover:text-primary transition-colors underline decoration-primary decoration-2 underline-offset-4">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
