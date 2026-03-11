import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn()', () => {
  it('単一クラスをそのまま返す', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('複数クラスをスペース区切りで結合する', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('falsy な値（undefined, false, null）を無視する', () => {
    expect(cn('foo', undefined, false, null, 'bar')).toBe('foo bar')
  })

  it('条件付きクラスを処理する（オブジェクト形式）', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('Tailwind の競合クラスを後勝ちでマージする', () => {
    // p-2 と p-4 が競合→後ろの p-4 が優先される
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('Tailwind の競合クラスを条件付きでも正しくマージする', () => {
    // 基底クラス p-2 を条件付き p-4 で上書きできる
    expect(cn('p-2', { 'p-4': true })).toBe('p-4')
  })

  it('引数なしで空文字列を返す', () => {
    expect(cn()).toBe('')
  })
})
