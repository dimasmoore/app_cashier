import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  variant?: "bordered" | "flat" | "faded" | "underlined"
  size?: "sm" | "md" | "lg"
  onValueChange?: (value: string) => void
}

function Input({
  className,
  type,
  label,
  startContent,
  endContent,
  variant = "bordered",
  size = "md",
  onValueChange,
  onChange,
  ...props
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
    onValueChange?.(e.target.value)
  }

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-9 text-sm",
    lg: "h-12 text-base"
  }

  const variantClasses = {
    bordered: "border-input bg-transparent",
    flat: "border-transparent bg-muted",
    faded: "border-input/50 bg-muted/50",
    underlined: "border-0 border-b-2 border-input rounded-none bg-transparent"
  }

  return (
    <div className="w-full">
      {label && (
        <label className="text-sm font-medium text-foreground mb-2 block">
          {label}
        </label>
      )}
      <div className="relative">
        {startContent && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {startContent}
          </div>
        )}
        <input
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full min-w-0 rounded-md border px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            sizeClasses[size],
            variantClasses[variant],
            startContent && "pl-10",
            endContent && "pr-10",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        {endContent && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            {endContent}
          </div>
        )}
      </div>
    </div>
  )
}

export { Input }
