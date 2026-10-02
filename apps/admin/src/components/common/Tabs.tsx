import * as React from "react"
import { cn } from "@/lib/utils"

export function Tabs({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex flex-col", className)}>{children}</div>
}

export function TabsList({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex space-x-2 border-b", className)}>{children}</div>
}

export function TabsTrigger({ children, isActive, onClick, className }: { children: React.ReactNode, isActive?: boolean, onClick?: () => void, className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
        isActive ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ children, isActive, className }: { children: React.ReactNode, isActive?: boolean, className?: string }) {
  if (!isActive) return null;
  return <div className={cn("py-4", className)}>{children}</div>
}
