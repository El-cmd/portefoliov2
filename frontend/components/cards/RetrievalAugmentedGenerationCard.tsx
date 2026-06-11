import type React from "react"
import { FeatureCard } from "../FeatureCard"

export const RetrievalAugmentedGenerationCard: React.FC = () => (
  <FeatureCard
    customContent={
      <div className="w-full h-32 mb-6 rounded-lg bg-gray-900/50 backdrop-blur-sm flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-between px-12">
          {/* Input/Retrieval Section */}
          <div className="flex flex-col items-center justify-between py-2 h-full space-y-2">
            <div className="w-8 h-8 bg-blue-500/30 rounded-md animate-pulse" />
            <div className="w-8 h-8 bg-cyan-500/30 rounded-md animate-pulse animation-delay-150" />
            <div className="w-8 h-8 bg-teal-500/30 rounded-md animate-pulse animation-delay-300" />
          </div>

          {/* Curved Lines */}
          <div className="flex-1 relative h-full">
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Top curve - starts at y=20 */}
              <path
                d="M0 20 Q 50 20, 100 50"
                className="stroke-blue-400/30"
                strokeWidth="2"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                style={{
                  animation: "dash 3s linear infinite",
                }}
              />
              {/* Middle line - starts at y=50 */}
              <path
                d="M0 50 L 100 50"
                className="stroke-cyan-400/30"
                strokeWidth="2"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                style={{
                  animation: "dash 3s linear infinite",
                  animationDelay: "0.15s",
                }}
              />
              {/* Bottom curve - starts at y=80 */}
              <path
                d="M0 80 Q 50 80, 100 50"
                className="stroke-teal-400/30"
                strokeWidth="2"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                style={{
                  animation: "dash 3s linear infinite",
                  animationDelay: "0.3s",
                }}
              />
            </svg>
          </div>

          {/* Output/Generation Section */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-500/30 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    }
    title="Retrieval Augmented Generation"
    description="Enhance AI-powered information retrieval and generation by combining multiple data sources"
  />
)
