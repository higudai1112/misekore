'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UtensilsCrossed, Heart, PlusCircle, MapPin, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const tabs: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/shops',     label: 'お店',      icon: UtensilsCrossed },
  { href: '/favorite',  label: 'お気に入り', icon: Heart },
  { href: '/shops/new', label: '登録',      icon: PlusCircle },
  { href: '/map',       label: '地図',      icon: MapPin },
  { href: '/settings',  label: '設定',      icon: Settings },
]

interface FooterProps {
  // プロフィール画像が設定されている場合、設定タブのアイコンをアバター画像に差し替える
  avatarUrl?: string | null
}

export default function Footer({ avatarUrl }: FooterProps) {
  const pathname = usePathname()

  // iOS ネイティブアプリからのアクセスを検出する
  // SwiftUI 側で User-Agent に "MiseKore-iOS" を付与しており、
  // iOS アプリでは SwiftUI の TabBar がナビゲーションを担うため Web フッターは不要
  const [isIOS, setIsIOS] = useState(false)
  useEffect(() => {
    setIsIOS(navigator.userAgent.includes('MiseKore-iOS'))
  }, [])

  // iOS アプリ内では非表示にする（ネイティブ TabBar と二重にならないよう）
  if (isIOS) return null

  return (
    <footer className="fixed right-0 bottom-0 left-0 border-t bg-white">
      <nav className="flex py-2">
        {tabs.map((tab) => {
          // パス完全一致でアクティブ判定（/shops/new にいるとき /shops タブが点灯しないよう）
          const active = pathname === tab.href
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 min-w-0 flex-col items-center gap-0.5 ${active ? 'font-medium text-emerald-600' : 'text-gray-500'}`}
            >
              {/* 設定タブかつプロフィール画像が設定されている場合はアバター画像を表示 */}
              {tab.href === '/settings' && avatarUrl ? (
                <div
                  className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 overflow-hidden rounded-full ${active ? 'ring-2 ring-emerald-600' : ''}`}
                >
                  <img
                    src={avatarUrl}
                    alt="プロフィール"
                    width={20}
                    height={20}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
              {/* 小画面でもはみ出さないよう truncate と小フォント */}
              <span className="truncate text-[11px] sm:text-xs">{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </footer>
  )
}
