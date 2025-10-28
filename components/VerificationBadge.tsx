'use client'

import { Badge } from "@/components/ui/badge"
import { Shield, Crown, Star, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationBadgeProps {
  badge: 'unverified' | 'verified' | 'premium' | 'elite'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function VerificationBadge({ badge, size = 'md', className }: VerificationBadgeProps) {
  const badgeConfig = {
    unverified: {
      icon: null,
      label: 'Unverified',
      variant: 'secondary' as const,
      className: 'text-muted-foreground'
    },
    verified: {
      icon: CheckCircle,
      label: 'Verified',
      variant: 'default' as const,
      className: 'text-green-600 bg-green-50 border-green-200'
    },
    premium: {
      icon: Star,
      label: 'Premium',
      variant: 'default' as const,
      className: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    elite: {
      icon: Crown,
      label: 'Elite',
      variant: 'default' as const,
      className: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  }

  const config = badgeConfig[badge]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  )
}

// Trust Score Component
interface TrustScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function TrustScore({ score, size = 'md', showLabel = true }: TrustScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={cn('flex items-center gap-2', sizeClasses[size])}>
      <Shield className={cn('w-4 h-4', getScoreColor(score))} />
      <span className={cn('font-medium', getScoreColor(score))}>
        {score}/100
      </span>
      {showLabel && (
        <span className="text-muted-foreground">Trust Score</span>
      )}
    </div>
  )
}
