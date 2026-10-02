import { cn } from "@/lib/utils";

export function Toast({ message, type = 'info', onClose }: { message: string, type?: 'info' | 'success' | 'error', onClose: () => void }) {
  return (
    <div className={cn("fixed bottom-4 right-4 rounded-md p-4 shadow-lg flex items-center justify-between text-sm", {
      'bg-blue-50 text-blue-800 border border-blue-200': type === 'info',
      'bg-green-50 text-green-800 border border-green-200': type === 'success',
      'bg-red-50 text-red-800 border border-red-200': type === 'error',
    })}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100">&times;</button>
    </div>
  )
}
