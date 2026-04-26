import api from './api'

// ─── AUTH ──────────────────────────────────────────────────────────────────
export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    rating?: number
    createdAt?: string
  }
}

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/api/auth/register', data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/api/auth/login', data),
}

// ─── KITS ──────────────────────────────────────────────────────────────────
export interface Kit {
  _id: string
  id?: string
  name: string
  description: string
  category: string
  price: number
  depositAmount?: number
  tools?: string[]
  tutorials?: { title: string; url: string }[]
  imageUrl?: string
  rating?: number
  reviewCount?: number
  available?: boolean
}

export interface CreateKitPayload {
  name: string
  description: string
  category: string
  price: number
  tools?: string[]
}

export const kitService = {
  getAll: () => api.get<Kit[]>('/api/kits'),

  getById: (id: string) => api.get<Kit>(`/api/kits/${id}`),

  create: (data: CreateKitPayload) => api.post<Kit>('/api/kits', data),
}

// ─── RENTALS ───────────────────────────────────────────────────────────────
export interface RentPayload {
  kitId: string
  duration: number // days
}

export interface Rental {
  _id: string
  kit: Kit
  user: string
  duration: number
  totalCost: number
  depositAmount: number
  status: 'active' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
}

export const rentalService = {
  rent: (data: RentPayload) => api.post<Rental>('/api/rentals/rent', data),

  getUserRentals: () => api.get<Rental[]>('/api/rentals/my'),
}
