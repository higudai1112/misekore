'use client'

import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'
import { updateAvatar } from '@/app/actions/update-avatar'

interface AvatarUploadFormProps {
  currentAvatarUrl: string | null
  currentName: string
}

// プロフィール画像のアップロード UI
// アバターをタップしてファイルを選択 → ローカルプレビュー表示 → S3 にアップロード
export function AvatarUploadForm({ currentAvatarUrl, currentName }: AvatarUploadFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // ファイル選択時にプレビューを更新してアップロードを開始する
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ローカルプレビューを即時表示
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)

    const formData = new FormData()
    formData.append('avatar', file)

    startTransition(async () => {
      const result = await updateAvatar(formData)
      if (result.success && result.avatarUrl) {
        // blob URL からサーバー保存済みの URL に切り替える（ページ遷移後も有効）
        setPreviewUrl(result.avatarUrl)
        toast.success('プロフィール画像を更新しました')
      } else {
        // 失敗時は元の画像に戻す
        setPreviewUrl(currentAvatarUrl)
        toast.error(result.error ?? '更新に失敗しました')
      }
    })
  }

  // イニシャル（名前の先頭1文字。未設定の場合は "?"）
  const initial = currentName ? currentName.charAt(0).toUpperCase() : '?'

  return (
    <div className="flex flex-col items-center gap-3">
      {/* アバターボタン: タップでファイル選択ダイアログを開く */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="relative h-24 w-24 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fae8f] focus-visible:ring-offset-2"
        aria-label="プロフィール画像を変更"
      >
        {previewUrl ? (
          // 画像が設定されている場合: overflow-hidden で円形クリッピングを確実にする
          <div className="h-24 w-24 overflow-hidden rounded-full">
            <img
              src={previewUrl}
              alt="プロフィール画像"
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          // 画像が未設定の場合: イニシャル表示
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#dfe8df] text-3xl font-bold text-[#8fae8f]">
            {initial}
          </div>
        )}

        {/* カメラアイコンのオーバーレイ（ホバー時 or タッチ時に表示） */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity hover:opacity-100">
          <Camera className="h-6 w-6 text-white" />
        </div>

        {/* アップロード中スピナー */}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </button>

      {/* hidden ファイル入力 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-xs text-gray-400">タップして画像を変更（5MB以下）</p>
    </div>
  )
}
