import * as React from "react"
import { cn } from "@/lib/utils"

// A simple modal implementation. For production, consider Radix Dialog.
export function Modal({ isOpen, onClose, children, className }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, className?: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50">
      <div className={cn("relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg", className)}>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
           &times;
        </button>
        {children}
      </div>
    </div>
  )
}
