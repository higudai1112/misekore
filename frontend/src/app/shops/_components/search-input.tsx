'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

type SearchInputProps = {
    defaultValue?: string
}

export function SearchInput({ defaultValue = '' }: SearchInputProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const params = new URLSearchParams(searchParams.toString())
            if (e.target.value) {
                params.set('q', e.target.value)
            } else {
                params.delete('q')
            }
            router.replace(`${pathname}?${params.toString()}`)
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
