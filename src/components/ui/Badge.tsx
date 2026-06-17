import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  color?: string
  variant?: 'industry' | 'type' | 'location'
  className?: string
}

export function Badge({ label, color, variant = 'industry', className }: BadgeProps) {
  const style = color ? { backgroundColor: `${color}18`, color, borderColor: `${color}40` } : undefined

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        !color && variant === 'type' && 'bg-blue-50 text-blue-700 border-blue-200',
        !color && variant === 'location' && 'bg-gray-100 text-gray-600 border-gray-200',
        !color && variant === 'industry' && 'bg-slate-100 text-slate-700 border-slate-200',
        className
      )}
      style={style}
    >
      {label}
    </span>
  )
}
