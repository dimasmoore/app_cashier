"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  children?: React.ReactNode
  size?: "sm" | "md" | "lg"
  isSelected?: boolean
  onValueChange?: (checked: boolean) => void
}

function Checkbox({
  className,
  children,
  size = "md",
  isSelected,
  onValueChange,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  const handleCheckedChange = (checked: boolean) => {
    onCheckedChange?.(checked)
    onValueChange?.(checked)
  }

  const sizeClasses = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5"
  }

  return (
    <div className="flex items-center space-x-2">
      <CheckboxPrimitive.Root
        data-slot="checkbox"
        className={cn(
          "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size],
          className
        )}
        checked={isSelected}
        onCheckedChange={handleCheckedChange}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="flex items-center justify-center text-current transition-none"
        >
          <CheckIcon className="size-3.5" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {children && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {children}
        </label>
      )}
    </div>
  )
}

export { Checkbox }
