import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 住所から国名・郵便番号を除去し、都道府県名以降のみ返す
// 例: "日本、〒150-0001 東京都渋谷区..." → "東京都渋谷区..."
export function formatAddress(address: string): string {
  return address
    // 国名を除去（例: "日本、" "日本 "）
    .replace(/^日本[、,]\s*/, '')
    // 郵便番号を除去（例: "〒150-0001 " "〒1500001 "）
    .replace(/〒\d{3}[-ー]?\d{4}\s*/, '')
    .trim()
}
