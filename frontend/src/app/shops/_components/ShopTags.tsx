// お店に関連付けられたタグを一覧表示するコンポーネント
export function ShopTags({
  tags,
}: {
  tags: { id: string; name: string }[]
}) {
  // タグが一つも登録されていない場合は何も表示しない
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="rounded-full bg-accent px-3 py-1 text-sm">
          #{tag.name}
        </span>
      ))}
    </div>
  )
}