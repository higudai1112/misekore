'use client'

// 「MISEKOREで保存する」ボタン（未ログイン→会員登録、ログイン済み→お店登録画面へ誘導）
import { useRouter } from 'next/navigation'

type SaveToMisekoreButtonProps = {
  shopId: string
  placeId: string | null
  isLoggedIn: boolean
}

export function SaveToMisekoreButton({ shopId, placeId, isLoggedIn }: SaveToMisekoreButtonProps) {
  const router = useRouter()

  const handleSave = () => {
    if (!isLoggedIn) {
      // 未ログイン: 会員登録画面へ（from=share でオンボーディングのコンテキストを渡す）
      router.push(`/signup?from=share&shopId=${shopId}`)
      return
    }

    // ログイン済み: placeId がある場合は Google Places 経由の登録画面へ、なければ手動入力へ
    if (placeId) {
      router.push(`/shops/new?placeId=${encodeURIComponent(placeId)}`)
    } else {
      router.push('/shops/new?mode=manual')
    }
  }

  return (
    <button
      onClick={handleSave}
      className="w-full rounded-2xl bg-[#8fae8f] py-3.5 text-base font-semibold text-white shadow-sm hover:bg-[#7b997b] active:scale-95 transition-all"
    >
      MISEKOREで保存する
    </button>
  )
}
