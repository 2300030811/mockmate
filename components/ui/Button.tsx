import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background transition-all duration-300 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800",
        primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 border-transparent hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/50",
        secondary: "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700",
        ghost: "bg-transparent text-white border border-white/20 hover:bg-white/10",
        glass: "bg-white/80 border border-gray-200 text-gray-800 shadow-sm backdrop-blur-md hover:bg-white hover:shadow-md dark:bg-gray-900/80 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900",
        destructive: "bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-11 px-6 py-3 font-bold",
        sm: "h-9 px-4 py-2 rounded-lg font-semibold text-xs",
        lg: "h-14 px-8 py-4 rounded-2xl font-bold text-lg",
        icon: "h-10 w-10 p-2 rounded-full",
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
