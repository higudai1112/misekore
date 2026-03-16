export interface RateLimitOptions {
    interval: number // milliseconds
    uniqueTokenPerInterval: number
}

// Minimal in-memory rate limiter mapped by IP/Token
export function rateLimit(options: RateLimitOptions) {
    const tokenCache = new Map<string, number[]>()

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const now = Date.now()
                const tokenCount = tokenCache.get(token) || [0]
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, [tokenCount[0]])
                }
                const currentCount = tokenCache.get(token)!
                const newCount = currentCount[0] + 1
                tokenCache.set(token, [newCount])

                const isRateLimited = newCount > limit

                setTimeout(() => {
                    const count = tokenCache.get(token)!
                    tokenCache.set(token, [count[0] - 1])
                }, options.interval)

                // Clean up map to prevent indefinitely growing memory
                if (tokenCache.size > options.uniqueTokenPerInterval) {
                    // Primitive LRU: Just clear it, okay for MVP
                    tokenCache.clear()
                }

                if (isRateLimited) {
                    reject(new Error('Rate limit exceeded'))
                } else {
                    resolve()
                }
            }),
    }
}
