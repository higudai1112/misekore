export function ShopTags({
  tags,
}: {
  tags: { id: string; name: string }[]
}) {
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