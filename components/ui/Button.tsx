import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default:
          "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-100 dark:bg-[#14141e] dark:text-[#ebebef] dark:border-[#1e1e2a] dark:hover:bg-[#181824]",
        primary:
          "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-[#ebebef] dark:text-[#0d0d12] dark:hover:bg-white shadow-subtle border border-transparent font-semibold",
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-[#181824] dark:text-[#ebebef] dark:hover:bg-[#20202e] border border-transparent",
        ghost:
          "bg-transparent text-zinc-600 hover:text-zinc-900 dark:text-[#8b8b9e] dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-white/[0.04]",
        glass:
          "bg-white/90 border border-zinc-200 text-zinc-800 hover:bg-zinc-100 dark:bg-[#14141e]/90 dark:border-[#1e1e2a] dark:text-[#ebebef] dark:hover:bg-[#181824]",
        destructive:
          "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20",
        outline:
          "border border-zinc-200 dark:border-[#1e1e2a] hover:bg-zinc-100 dark:hover:bg-[#161622] text-zinc-900 dark:text-[#ebebef]",
        link: "underline-offset-4 hover:underline text-[#5e6ad2]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 py-1.5 text-xs",
        lg: "h-10 px-5 py-2.5 text-sm",
        icon: "h-8 w-8 p-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
