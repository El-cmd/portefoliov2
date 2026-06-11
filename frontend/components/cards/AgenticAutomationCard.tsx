import type React from "react"
import { FeatureCard } from "../FeatureCard"

export const AgenticAutomationCard: React.FC = () => (
  <FeatureCard
    customContent={
      <div className="w-full h-32 mb-6 rounded-lg bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
        <div className="w-full h-full p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-blue-500/40" />
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-full bg-blue-500/40 animate-data-flow" />
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-purple-500/40" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-green-500/40" />
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-full bg-green-500/40 animate-data-flow-reverse" />
            </div>
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500/40" />
            </div>
          </div>
        </div>
      </div>
    }
    title="Agentic Automation"
    description="Empower your workflows with intelligent, autonomous agents that adapt and evolve"
  />
)
