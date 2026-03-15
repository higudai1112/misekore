'use client'

import { useEffect, useState } from 'react'
import Footer from './Footer'

type Props = {
  children: React.ReactNode
  avatarUrl?: string | null
}

// クライアント側の iOS 判定と Footer へのアバター URL 受け渡しを担う Client Component
// AppLayout（Server Component）から呼び出される
export function AppLayoutClient({ children, avatarUrl }: Props) {
  // iOS ネイティブアプリでは SwiftUI の TabBar があるため pb-16 は不要
  const [isIOS, setIsIOS] = useState(false)
  useEffect(() => {
    setIsIOS(navigator.userAgent.includes('MiseKore-iOS'))
  }, [])

  return (
    <div className={`min-h-screen ${isIOS ? '' : 'pb-16'}`}>
      {/* メインコンテンツ部分 */}
      {children}
      {/* 共通のフッターナビゲーション（iOS ネイティブアプリでは非表示） */}
      <Footer avatarUrl={avatarUrl} />
    </div>
  )
}
