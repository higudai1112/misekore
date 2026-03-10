'use server'

import { auth } from '@/lib/auth'

export async function sendContact(formData: FormData) {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: '認証が必要です' }

    const subject = (formData.get('subject') as string | null)?.trim()
    const message = (formData.get('message') as string | null)?.trim()
    const senderEmail = session.user?.email ?? ''

    if (!subject) return { success: false, error: '件名を入力してください' }
    if (!message) return { success: false, error: '内容を入力してください' }

    const workerUrl = process.env.CLOUDFLARE_CONTACT_WORKER_URL
    if (!workerUrl) {
        console.error('CLOUDFLARE_CONTACT_WORKER_URL is not set')
        return { success: false, error: '送信設定が未完了です。管理者にお問い合わせください。' }
    }

    const res = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: senderEmail, subject, message }),
    })

    if (!res.ok) {
        console.error('Cloudflare Worker error:', res.status, await res.text())
        return { success: false, error: '送信に失敗しました。しばらくしてから再度お試しください。' }
    }

    return { success: true }
}
