export function ShopMemo({ memo }: { memo: string | null }) {
  if (!memo) return null

  return (
    <div>
      <h3 className="text-sm font-semibold mb-1">メモ</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {memo}
      </p>
    </div>
  )
}