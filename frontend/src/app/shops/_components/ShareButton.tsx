'use client'

// お店詳細ページの共有ボタン
// Web Share API が使える環境では native シェアシート、非対応環境ではクリップボードコピー＋Toast
import { toast } from 'sonner'

type ShareButtonProps = {
  shopId: string
  shopName: string
}

export function ShareButton({ shopId, shopName }: ShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/${shopId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shopName,
          text: `${shopName} を店コレで見る`,
          url: shareUrl,
        })
      } catch (err) {
        // ユーザーによるキャンセル（AbortError）は無視する
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Share failed', err)
        }
      }
    } else {
      // Web Share API 非対応: クリップボードコピー
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('共有URLをコピーしました')
      } catch {
        toast.error('URLのコピーに失敗しました')
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="共有"
      className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
    >
      {/* シェアアイコン（SVG） */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    </button>
  )
}
