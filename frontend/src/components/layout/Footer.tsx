'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UtensilsCrossed, Heart, PlusCircle, MapPin, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const tabs: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: '/shops', label: 'お店一覧', icon: UtensilsCrossed },
  { href: '/favorite', label: 'お気に入り', icon: Heart },
  { href: '/shops/new', label: '登録', icon: PlusCircle, exact: true },
  { href: '/map', label: '地図', icon: MapPin },
  { href: '/settings', label: '設定', icon: Settings },
]

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className="fixed right-0 bottom-0 left-0 border-t bg-white">
      <nav className="flex justify-around py-2 text-xs">
        {tabs.map((tab) => {
          // exact=true のタブは完全一致、それ以外は前方一致でアクティブ判定
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 ${active ? 'font-medium text-emerald-600' : 'text-gray-500'}`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </footer>
  )
}
