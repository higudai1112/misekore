// 広告バナーコンポーネント
// isPremiumがtrueの場合は何も表示しない（広告非表示がプレミアム特典）
// isPremiumがfalseの場合は広告プレースホルダーを表示（実際のAdSense/AdMob連携は後日）

type AdBannerProps = {
    isPremium: boolean
}

export function AdBanner({ isPremium }: AdBannerProps) {
    // プレミアムユーザーには広告を表示しない
    if (isPremium) return null

    return (
        <div className="flex h-14 w-full items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
            広告
        </div>
    )
}
