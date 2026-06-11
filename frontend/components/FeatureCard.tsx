import type React from "react"

interface FeatureCardProps {
  customContent: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ customContent, title, description }: FeatureCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gray-800/5 rounded-lg blur-sm transform group-hover:scale-105 transition-all duration-300" />
      <div className="relative h-full p-6 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 flex flex-col">
        <div className="flex-none">{customContent}</div>
        <div className="flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-xl font-normal mb-3 text-white font-mono">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
