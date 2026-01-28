'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/want', label: '行きたい' },
  { href: '/recommend', label: 'おすすめ' },
  { href: '/create', label: '登録' },
  { href: '/map', label: '地図' },
  { href: '/settings', label: '設定' },
]

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <nav className="flex justify-around py-2 text-xs">
        {tabs.map((tab) => {
          // アクティブ判定
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center ${
                active ? 'text-emerald-600 font-medium' : 'text-gray-500'
              }`}
            >
              {/* アイコンを後で追加 */}
              <span className="text-lg">⚫️</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </footer>
  )
}