import type React from "react"
import { FeatureCard } from "../FeatureCard"

export const WorkspacesPerOrganizationCard: React.FC = () => (
  <FeatureCard
    customContent={
      <div className="w-full h-32 mb-6 rounded-lg bg-gray-900/50 backdrop-blur-sm p-4">
        <div className="grid grid-cols-2 gap-2 h-full">
          <div className="bg-gray-800/80 rounded-lg p-2">
            <div className="h-2 bg-gray-700 rounded mb-2 w-3/4" />
            <div className="h-2 bg-gray-700 rounded w-1/2" />
          </div>
          <div className="bg-gray-800/80 rounded-lg p-2">
            <div className="h-2 bg-gray-700 rounded mb-2 w-3/4" />
            <div className="h-2 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    }
    title="Workspaces Per Organization"
    description="Organize projects effectively with multiple workspaces per organization"
  />
)
