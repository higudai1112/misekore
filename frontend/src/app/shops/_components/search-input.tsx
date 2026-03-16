'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useRef } from 'react'

type SearchInputProps = {
    defaultValue?: string
}

export function SearchInput({ defaultValue = '' }: SearchInputProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    // 300ms デバウンス: 入力のたびにDBクエリが走らないようにする
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            if (debounceTimer.current) clearTimeout(debounceTimer.current)
            debounceTimer.current = setTimeout(() => {
                const params = new URLSearchParams(searchParams.toString())
                if (value) {
                    params.set('q', value)
                } else {
                    params.delete('q')
                }
                router.replace(`${pathname}?${params.toString()}`)
            }, 300)
        },
        [router, pathname, searchParams]
    )

    return (
        <div className="rounded-full bg-white px-4 py-3 ring-1 ring-[#8fae8f]/50">
            <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>🔍</span>
                <input
                    defaultValue={defaultValue}
                    onChange={handleChange}
                    placeholder="お店を検索"
                    className="w-full bg-transparent outline-none placeholder:text-gray-400"
                />
            </div>
        </div>
    )
}
