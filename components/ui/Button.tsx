import * as React from "react"
import { cn } from "@/lib/utils"

// Since we don't have cva or radix-ui installed yet, I will create a simpler version first
// to avoid breaking build with missing dependencies.
// Actually, looking at dependencies, I don't see cva or radix-ui.
// I should stick to a cleaner implementation that doesn't require new deps yet unless I install them.
// The user said "don't break anything". Installing deps is usually safe but "revert back" implies caution.
// I'll stick to a simple Button component first without CVA if possible, or install CVA.
// CVA is very standard. I'll install class-variance-authority.

// WAIT. Usage of 'npx' was in rules. I should probably manually create a button that matches the current styles.
// I'll avoid adding new dependencies for now if I can help it, OR I will install them.
// "class-variance-authority" is lightweight.

// Let's implement a standard button that mimics the existing `.btn-primary` etc.
// from globals.css:
// .btn-primary: px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 ...
// .btn-secondary: ...
// .btn-ghost: ...

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "default" | "glass"
  size?: "default" | "sm" | "lg" | "icon"
}

// Replicating styles from globals.css into Tailwind classes for the component
const variants = {
  primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 border-transparent",
  secondary: "bg-gray-800 hover:bg-gray-700 text-white border-gray-700 border",
  ghost: "bg-transparent hover:bg-white/10 text-white border-white/20 border",
  glass: "backdrop-blur-md border shadow-sm hover:scale-105 bg-white/80 border-gray-200 text-gray-800 hover:bg-white hover:shadow-md dark:bg-gray-900/80 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900",
  default: "bg-white text-gray-900 hover:bg-gray-100 border-gray-200 border dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:border-gray-700"
}

const sizes = {
  default: "px-6 py-3 rounded-xl font-bold",
  sm: "px-4 py-2 rounded-lg font-semibold text-sm",
  lg: "px-8 py-4 rounded-2xl font-bold text-lg",
  icon: "h-10 w-10 p-2 flex items-center justify-center rounded-full"
}

const baseStyles = "inline-flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"

export const buttonVariants = (variant: keyof typeof variants = "default", size: keyof typeof sizes = "default", className: string = "") => {
  return cn(baseStyles, variants[variant], sizes[size], className)
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={buttonVariants(variant, size, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
