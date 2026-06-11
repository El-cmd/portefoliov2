import type React from "react"
import { FeatureCard } from "../FeatureCard"

export const OnPremiseDeploymentCard: React.FC = () => (
  <FeatureCard
    customContent={
      <div className="w-full h-32 mb-6 rounded-lg bg-gray-900/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center h-full">
          <div className="space-y-2 w-full">
            <div className="h-4 bg-gray-800/80 rounded w-full flex items-center px-3">
              <div className="h-2 w-2 rounded-full bg-gray-600 mr-2" />
              <span className="text-xs text-gray-400 font-mono">Successfully deployed</span>
            </div>
            <div className="h-4 bg-gray-800/80 rounded w-full flex items-center px-3">
              <div className="h-2 w-2 rounded-full bg-gray-600 mr-2" />
              <span className="text-xs text-gray-400 font-mono">Cache updated</span>
            </div>
          </div>
        </div>
      </div>
    }
    title="On-Premise Deployment"
    description="Deploy Pasmic app on-premise for enhanced control and security"
  />
)
