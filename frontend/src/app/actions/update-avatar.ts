'use server'

import { auth } from '@/lib/auth'
import { query } from '@/lib/db.server'
import { uploadToS3 } from '@/lib/storage.server'
import { revalidatePath } from 'next/cache'

// プロフィール画像を S3 にアップロードして DB の avatarUrl を更新する Server Action
// S3 バケットにはパブリック読み取りのバケットポリシーが必要
// （Block Public Access を無効化し、s3:GetObject を全体に許可すること）
export async function updateAvatar(
  formData: FormData
): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: '認証が必要です' }

  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) return { success: false, error: '画像を選択してください' }

  // バリデーション: 5MB 以下、画像形式のみ
  if (file.size > 5 * 1024 * 1024) return { success: false, error: '画像は5MB以下にしてください' }
  if (!file.type.startsWith('image/')) return { success: false, error: '画像ファイルを選択してください' }

  // S3 にアップロードして公開 URL を取得
  const imageUrl = await uploadToS3(file)

  // Profile テーブルの avatarUrl を更新
  await query(
    `UPDATE "Profile" SET "avatarUrl" = $1, "updatedAt" = NOW() WHERE "userId" = $2`,
    [imageUrl, userId]
  )

  // 全ページのレイアウトキャッシュを無効化（フッターのアバター表示を即時反映するため）
  revalidatePath('/', 'layout')
  return { success: true, avatarUrl: imageUrl }
}
