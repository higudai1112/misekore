'use server'

import { auth } from '@/lib/auth'
import { query } from '@/lib/db.server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: '認証が必要です' }

    const name = (formData.get('name') as string | null)?.trim()
    if (!name) return { success: false, error: '表示名を入力してください' }
    if (name.length > 50) return { success: false, error: '表示名は50文字以内で入力してください' }

    await query(
        `UPDATE "Profile" SET name = $1, "updatedAt" = NOW() WHERE "userId" = $2`,
        [name, userId]
    )

    revalidatePath('/settings/profile')
    return { success: true }
}
