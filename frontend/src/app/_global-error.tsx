export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">エラーが発生しました</h2>
        <p className="text-sm text-gray-600">予期しない問題が発生しました</p>
        <button
          onClick={() => reset()}
          className="rounded bg-black px-4 py-2 text-white"
        >
          再読み込み
        </button>
      </div>
    </div>
  )
}
