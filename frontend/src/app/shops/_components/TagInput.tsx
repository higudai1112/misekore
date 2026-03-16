'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const FREQUENT_TAGS = [
    '居酒屋', 'ランチ', '子連れ', 'デート', '個室',
    'カフェ', 'おしゃれ', 'ディナー', '女子会', '焼肉'
]

const MAX_TAGS = 10
const MAX_LENGTH = 20

export function TagInput() {
    const [tags, setTags] = useState<string[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const inputRef = useRef<HTMLInputElement>(null)

    // サジェストの計算 (最大5件)
    const suggestions = FREQUENT_TAGS
        .filter(tag => tag.includes(inputValue) && !tags.includes(tag))
        .slice(0, 5)

    const handleAddTag = (tagToAdd: string) => {
        setError(null)
        const trimmedTag = tagToAdd.trim()

        if (!trimmedTag) return

        if (trimmedTag.length > MAX_LENGTH) {
            setError(`タグは${MAX_LENGTH}文字以内で入力してください`)
            return
        }

        if (tags.length >= MAX_TAGS) {
            setError(`タグは最大${MAX_TAGS}個までです`)
            return
        }

        if (tags.includes(trimmedTag)) {
            setError('既に追加されているタグです')
            return
        }

        setTags([...tags, trimmedTag])
        setInputValue('')
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove))
        setError(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault() // フォームの送信を防ぐ
            if (inputValue.trim()) {
                handleAddTag(inputValue)
            }
        }
    }

    return (
        <div className="space-y-3">
            {/* エラーメッセージ */}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {/* 選択済みタグ */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-foreground"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 rounded-full p-0.5 hover:bg-accent hover:text-accent-foreground"
                            >
                                <X className="size-3" />
                                <span className="sr-only">削除</span>
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* 隠しフィールド: Server Action送信用のデータ */}
            {tags.map((tag) => (
                <input key={`hidden-${tag}`} type="hidden" name="tags[]" value={tag} />
            ))}

            {/* 入力欄とサジェストのコンテナ */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        setError(null)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 outline-none ring-1 ring-inset ring-gray-300 focus:bg-white focus:ring-2 focus:ring-[#8fae8f]"
                    placeholder="例: スイーツ (Enterで追加)"
                    disabled={tags.length >= MAX_TAGS}
                />

                {/* サジェスト (入力中かつ候補がある場合) */}
                {isFocused && inputValue.trim() && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-md">
                        <ul className="py-1">
                            {suggestions.map((suggestion) => (
                                <li key={`suggest-${suggestion}`}>
                                    <button
                                        type="button"
                                        // blurより先に発火させるためにonMouseDownを使用
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            handleAddTag(suggestion)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {suggestion}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* よく使うタグ */}
            <div>
                <p className="mb-2 text-xs font-medium text-gray-500">よく使うタグ</p>
                <div className="flex flex-wrap gap-2">
                    {FREQUENT_TAGS.map((tag) => {
                        const isSelected = tags.includes(tag)
                        return (
                            <button
                                key={`freq-${tag}`}
                                type="button"
                                onClick={() => handleAddTag(tag)}
                                disabled={isSelected || tags.length >= MAX_TAGS}
                                className={cn(
                                    "rounded-full border px-3 py-1 text-sm text-gray-600 transition",
                                    isSelected
                                        ? "opacity-50 pointer-events-none bg-gray-50"
                                        : "hover:bg-accent hover:text-accent-foreground bg-white"
                                )}
                            >
                                {tag}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
