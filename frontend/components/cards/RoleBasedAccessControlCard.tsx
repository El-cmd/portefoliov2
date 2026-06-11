import type React from "react"
import { FeatureCard } from "../FeatureCard"

export const RoleBasedAccessControlCard: React.FC = () => (
  <FeatureCard
    customContent={
      <div className="w-full h-32 mb-6 rounded-lg bg-gray-900/50 backdrop-blur-sm p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-800/80" />
            <div className="flex-1">
              <div className="h-3 bg-gray-800/80 rounded w-3/4 mb-1" />
              <div className="h-2 bg-gray-800/80 rounded w-1/2" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-800/80" />
            <div className="flex-1">
              <div className="h-3 bg-gray-800/80 rounded w-3/4 mb-1" />
              <div className="h-2 bg-gray-800/80 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    }
    title="Role-Based Access Control"
    description="Ensure enterprise security and compliance with role-based access management"
  />
)
