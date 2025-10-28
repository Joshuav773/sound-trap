'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Music, Radio, Video, DollarSign, FileAudio } from "lucide-react"
import type { LicenseTemplate } from "@shared/schema"

interface LicenseTemplateCardProps {
  template: LicenseTemplate
  onSelect?: (template: LicenseTemplate) => void
  selected?: boolean
  showPrice?: boolean
}

export default function LicenseTemplateCard({ 
  template, 
  onSelect, 
  selected = false,
  showPrice = true 
}: LicenseTemplateCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exclusive': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'lease': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'free': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exclusive': return <CheckCircle className="w-4 h-4" />
      case 'lease': return <Music className="w-4 h-4" />
      case 'free': return <FileAudio className="w-4 h-4" />
      default: return <Music className="w-4 h-4" />
    }
  }

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge className={getTypeColor(template.type)}>
            {getTypeIcon(template.type)}
            <span className="ml-1 capitalize">{template.type}</span>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Plain Language Summary */}
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">What's Included:</h4>
          <p className="text-sm text-muted-foreground">{template.plainLanguageSummary}</p>
        </div>

        {/* Rights Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Usage Rights:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span>{template.musicVideos} Music Video{template.musicVideos !== 1 ? 's' : ''}</span>
            </div>
            {template.streamLimit && (
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-muted-foreground" />
                <span>{template.streamLimit.toLocaleString()} Streams</span>
              </div>
            )}
            {template.radioAirplay && (
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Radio Airplay</span>
              </div>
            )}
            {template.commercialUse && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Commercial Use</span>
              </div>
            )}
          </div>
        </div>

        {/* Files Included */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Files Included:</h4>
          <div className="flex flex-wrap gap-2">
            {template.includesMp3 && (
              <Badge variant="outline" className="text-xs">MP3</Badge>
            )}
            {template.includesWav && (
              <Badge variant="outline" className="text-xs">WAV</Badge>
            )}
            {template.includesStems && (
              <Badge variant="outline" className="text-xs">Stems</Badge>
            )}
            {template.includesTrackout && (
              <Badge variant="outline" className="text-xs">Trackout</Badge>
            )}
          </div>
        </div>

        {/* Price and Action */}
        {showPrice && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-2xl font-bold text-primary">
              ${template.price}
            </div>
            {onSelect && (
              <Button 
                onClick={() => onSelect(template)}
                variant={selected ? "default" : "outline"}
                size="sm"
              >
                {selected ? 'Selected' : 'Select License'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// License Summary Component for Beat Cards
interface LicenseSummaryProps {
  template: LicenseTemplate
  compact?: boolean
}

export function LicenseSummary({ template, compact = false }: LicenseSummaryProps) {
  if (compact) {
    return (
      <div className="text-xs text-muted-foreground">
        {template.musicVideos} video{template.musicVideos !== 1 ? 's' : ''}
        {template.streamLimit && ` • ${template.streamLimit.toLocaleString()} streams`}
        {template.radioAirplay && ' • Radio'}
        {template.commercialUse && ' • Commercial'}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{template.name}</span>
        <span className="text-lg font-bold text-primary">${template.price}</span>
      </div>
      <p className="text-sm text-muted-foreground">{template.plainLanguageSummary}</p>
      <div className="flex flex-wrap gap-1">
        {template.includesMp3 && <Badge variant="outline" className="text-xs">MP3</Badge>}
        {template.includesWav && <Badge variant="outline" className="text-xs">WAV</Badge>}
        {template.includesStems && <Badge variant="outline" className="text-xs">Stems</Badge>}
      </div>
    </div>
  )
}
