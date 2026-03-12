'use server'

import { auth } from '@/lib/auth'

export async function sendContact(formData: FormData) {
    const session = await auth()

    const subject = (formData.get('subject') as string | null)?.trim()
    const message = (formData.get('message') as string | null)?.trim()
    // 未ログインユーザーの場合は「未ログインユーザー」として送信
    const senderEmail = session?.user?.email ?? '未ログインユーザー'

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
