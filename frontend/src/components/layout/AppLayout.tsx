'use client'

import Footer from './Footer'

type Props = {
  children: React.ReactNode
}

// アプリケーション全体で共通して使用するレイアウトコンポーネント
// フッター（タブバー）を画面下部に固定して表示する役割を持つ
export function AppLayout({ children }: Props) {
  return (
    <div className="min-h-screen pb-16">
      {/* メインコンテンツ部分 */}
      {children}
      {/* 共通のフッターナビゲーション */}
      <Footer />
    </div>
  )
}
