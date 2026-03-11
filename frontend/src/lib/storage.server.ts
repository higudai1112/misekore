import 'server-only'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

// S3クライアントをシングルトンで管理（HMR時の増殖防止）
const globalForS3 = globalThis as unknown as { s3: S3Client | undefined }

const s3 =
  globalForS3.s3 ??
  new S3Client({
    region: process.env.S3_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForS3.s3 = s3
}

const BUCKET = process.env.S3_BUCKET_NAME!
const REGION = process.env.S3_REGION!

/**
 * ファイルを S3 にアップロードし、公開 URL を返す
 * @param file アップロードするファイル
 * @returns S3 公開 URL（例: https://misekore.s3.ap-northeast-3.amazonaws.com/uploads/xxx.jpg）
 */
export async function uploadToS3(file: File): Promise<string> {
  const extension = file.name.split('.').pop() || 'jpg'
  const key = `uploads/${randomUUID()}.${extension}`

  const arrayBuffer = await file.arrayBuffer()

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type || 'image/jpeg',
    })
  )

  // S3 標準エンドポイントの公開 URL を返す
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
}
