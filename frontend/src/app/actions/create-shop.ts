'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { writeFile, mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'

export async function createShop(formData: FormData) {
  // 認証チェック
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  const userId = session.user.id

  // バリデーション
  const name = formData.get('name') as string
  if (!name?.trim()) throw new Error('Name is required')

  const memo = (formData.get('memo') as string) || null
  const placeId = (formData.get('placeId') as string) || null
  const address = (formData.get('address') as string) || null
  const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : null
  const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : null
  const tags = formData.getAll('tags[]') as string[]

  // Shop・UserShop・Tag・ShopTag をトランザクションで登録
  const { shopId } = await prisma.$transaction(async (tx) => {
    // placeId が指定されていれば既存 Shop を再利用、なければ新規作成
    let shop = placeId
      ? await tx.shop.findFirst({ where: { placeId } })
      : null

    if (!shop) {
      shop = await tx.shop.create({
        data: { name, address, lat, lng, placeId },
      })
    }

    // ユーザーとお店を紐づける（初期ステータスは WANT）
    await tx.userShop.create({
      data: { userId, shopId: shop.id, status: 'WANT', memo },
    })

    // タグを upsert して ShopTag を登録（Tag.name に @unique があるため upsert 可能）
    for (const tagName of tags) {
      const tag = await tx.tag.upsert({
        where: { name: tagName },
        create: { name: tagName },
        update: {},
      })
      await tx.shopTag.create({
        data: { shopId: shop.id, tagId: tag.id },
      })
    }

    return { shopId: shop.id }
  })

  // 写真のアップロード（ファイルシステム操作はトランザクション外で実行）
  // TODO: Issue #21 で S3 等のクラウドストレージへ移行予定
  const photos = formData.getAll('photos') as File[]
  if (photos.length > 0) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    for (const photo of photos) {
      if (photo.size > 0) {
        const extension = photo.name.split('.').pop() || 'jpg'
        const filename = `${randomUUID()}.${extension}`
        const filepath = path.join(uploadDir, filename)

        const arrayBuffer = await photo.arrayBuffer()
        await writeFile(filepath, Buffer.from(arrayBuffer))

        await prisma.shopPhoto.create({
          data: { shopId, userId, imageUrl: `/uploads/${filename}` },
        })
      }
    }
  }

  redirect('/shops')
}
