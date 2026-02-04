import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  {
    variants: {
      variant: {
        /** 主操作（登録・保存など） */
        primary: 'bg-primary text-white hover:bg-primary-dark',

        /** 副操作（ログイン・キャンセル） */
        outline:
          'border border-primary text-primary bg-background hover:bg-accent',

        /** 危険操作（削除） */
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30',

        /** 軽い操作（戻る・カード内操作） */
        ghost: 'text-foreground hover:bg-accent',

        /** テキストリンク */
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        /** 標準 */
        default: 'h-9 px-4',

        /** 小さめ（カード内など） */
        sm: 'h-8 px-3 text-sm',

        /** 大きめ（タイトル画面など） */
        lg: 'h-10 px-6 text-base',

        /** アイコンのみ */
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
