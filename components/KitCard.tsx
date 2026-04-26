'use client'

import Link from 'next/link'
import { Kit } from '@/lib/services'
import { Star, ArrowRight, Camera, Music, Palette, Cpu, Bike, Leaf } from 'lucide-react'

const categoryIcons: Record<string, React.ReactNode> = {
  photography: <Camera size={18} />,
  music: <Music size={18} />,
  art: <Palette size={18} />,
  tech: <Cpu size={18} />,
  sports: <Bike size={18} />,
  outdoor: <Leaf size={18} />,
}

interface KitCardProps {
  kit: Kit
}

export default function KitCard({ kit }: KitCardProps) {
  const cat = kit.category?.toLowerCase() || 'other'
  const icon = categoryIcons[cat] || <Star size={18} />

  return (
    <div className="card-hover group relative overflow-hidden flex flex-col bg-white">
      {/* Top accent line */}
      <div className="h-1.5 w-full bg-primary" />

      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 group-hover:bg-primary group-hover:border-primary transition-colors shrink-0">
            {icon}
          </div>
          <span className="badge-neutral border border-gray-200 capitalize text-[11px] px-2.5 py-0.5">{kit.category || 'General'}</span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-1">{kit.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {kit.description}
          </p>
        </div>

        {/* Rating */}
        {kit.rating !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className="flex text-primary">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={s <= Math.round(kit.rating || 0) ? 'text-primary' : 'text-gray-200'}
                  fill={s <= Math.round(kit.rating || 0) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-500 ml-1">
              {kit.rating?.toFixed(1)} ({kit.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">$</span>
              <span className="text-2xl font-black text-gray-900">{kit.price}</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">/day</span>
            </div>
            {kit.depositAmount && (
              <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                +${kit.depositAmount} deposit
              </p>
            )}
          </div>

          <Link
            href={`/kits/${kit._id || kit.id}`}
            className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200 group-hover:bg-black group-hover:text-primary group-hover:border-black transition-all"
          >
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
