import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  
  const variantClasses = {
    default: "border-transparent bg-blue-600 text-white",
    secondary: "border-transparent bg-gray-100 text-gray-900",
    destructive: "border-transparent bg-red-600 text-white",
    outline: "text-gray-900 border-gray-200"
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`} {...props} />
  )
}

export { Badge }
