import * as React from "react"
import { cn } from "@/lib/utils"

interface LinkProps extends React.ComponentProps<"a"> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary"
}

function Link({ 
  className, 
  size = "md",
  variant = "default",
  ...props 
}: LinkProps) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  }

  const variantClasses = {
    default: "text-foreground hover:text-foreground/80",
    primary: "text-primary hover:text-primary/80",
    secondary: "text-muted-foreground hover:text-foreground"
  }

  return (
    <a
      className={cn(
        "inline-flex items-center underline-offset-4 hover:underline transition-colors",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Link }
