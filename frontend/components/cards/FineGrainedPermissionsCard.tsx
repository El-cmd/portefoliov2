import type React from "react"
import { FeatureCard } from "../FeatureCard"

export const FineGrainedPermissionsCard: React.FC = () => (
  <FeatureCard
    customContent={
      <div className="w-full h-32 mb-6 rounded-lg bg-gray-900/50 backdrop-blur-sm p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-gray-600" />
            <div className="h-4 bg-gray-800/80 rounded w-full" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-gray-600" />
            <div className="h-4 bg-gray-800/80 rounded w-3/4" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-gray-600" />
            <div className="h-4 bg-gray-800/80 rounded w-1/2" />
          </div>
        </div>
      </div>
    }
    title="Fine-Grained Permissions"
    description="Effortlessly assign and manage fine-grained permissions with our solution"
  />
)
