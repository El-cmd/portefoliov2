import type React from "react"
import { FeatureCard } from "../FeatureCard"

export const AIEnabledKnowledgeBaseCard: React.FC = () => (
  <FeatureCard
    customContent={
      <div className="w-full h-32 mb-6 rounded-lg bg-gray-900/50 backdrop-blur-sm flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Central node */}
          <circle cx="50" cy="50" r="6" className="fill-purple-500/40" />

          {/* Main outer nodes */}
          <circle cx="25" cy="25" r="4" className="fill-blue-500/40" />
          <circle cx="75" cy="25" r="4" className="fill-green-500/40" />
          <circle cx="25" cy="75" r="4" className="fill-yellow-500/40" />
          <circle cx="75" cy="75" r="4" className="fill-red-500/40" />

          {/* Additional nodes */}
          <circle cx="15" cy="50" r="3" className="fill-cyan-500/40" />
          <circle cx="85" cy="50" r="3" className="fill-pink-500/40" />
          <circle cx="50" cy="15" r="3" className="fill-indigo-500/40" />
          <circle cx="50" cy="85" r="3" className="fill-orange-500/40" />

          {/* New nodes */}
          <circle cx="35" cy="15" r="2" className="fill-teal-500/40" />
          <circle cx="65" cy="15" r="2" className="fill-lime-500/40" />
          <circle cx="35" cy="85" r="2" className="fill-amber-500/40" />
          <circle cx="65" cy="85" r="2" className="fill-rose-500/40" />
          <circle cx="15" cy="35" r="2" className="fill-sky-500/40" />
          <circle cx="85" cy="35" r="2" className="fill-fuchsia-500/40" />
          <circle cx="15" cy="65" r="2" className="fill-emerald-500/40" />
          <circle cx="85" cy="65" r="2" className="fill-violet-500/40" />

          {/* Connecting lines */}
          <line x1="50" y1="50" x2="25" y2="25" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="50" y1="50" x2="75" y2="25" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="50" y1="50" x2="25" y2="75" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="50" y1="50" x2="75" y2="75" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="25" y1="25" x2="15" y2="50" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="75" y1="25" x2="85" y2="50" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="25" y1="75" x2="50" y2="85" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="75" y1="75" x2="50" y2="15" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="25" y1="25" x2="35" y2="15" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="75" y1="25" x2="65" y2="15" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="25" y1="75" x2="35" y2="85" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="75" y1="75" x2="65" y2="85" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="25" y1="25" x2="15" y2="35" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="75" y1="25" x2="85" y2="35" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="25" y1="75" x2="15" y2="65" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="75" y1="75" x2="85" y2="65" className="stroke-gray-600/30" strokeWidth="1" />

          {/* New connecting lines */}
          <line x1="25" y1="25" x2="85" y2="50" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="75" y1="25" x2="15" y2="50" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="25" y1="75" x2="50" y2="15" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="75" y1="75" x2="50" y2="85" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="35" y1="15" x2="75" y2="75" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="65" y1="15" x2="25" y2="75" className="stroke-gray-600/30" strokeWidth="1" />

          <line x1="50" y1="15" x2="50" y2="85" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="15" y1="35" x2="85" y2="65" className="stroke-gray-600/30" strokeWidth="1" />
          <line x1="15" y1="65" x2="85" y2="35" className="stroke-gray-600/30" strokeWidth="1" />

          {/* Animated pulses */}
          <circle className="fill-blue-500 animate-pulse-flow">
            <animateMotion
              path="M25 25 L50 50"
              dur="2s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
            />
          </circle>
          <circle className="fill-green-500 animate-pulse-flow">
            <animateMotion
              path="M75 25 L50 50"
              dur="2s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="0.5s"
            />
          </circle>
          <circle className="fill-yellow-500 animate-pulse-flow">
            <animateMotion
              path="M25 75 L50 50"
              dur="2s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="1s"
            />
          </circle>
          <circle className="fill-red-500 animate-pulse-flow">
            <animateMotion
              path="M75 75 L50 50"
              dur="2s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="1.5s"
            />
          </circle>
          <circle className="fill-cyan-500 animate-pulse-flow">
            <animateMotion
              path="M15 50 L25 25"
              dur="1.5s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="0.25s"
            />
          </circle>
          <circle className="fill-pink-500 animate-pulse-flow">
            <animateMotion
              path="M85 50 L75 25"
              dur="1.5s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="0.75s"
            />
          </circle>
          <circle className="fill-indigo-500 animate-pulse-flow">
            <animateMotion
              path="M50 15 L75 75"
              dur="1.5s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="1.25s"
            />
          </circle>
          <circle className="fill-orange-500 animate-pulse-flow">
            <animateMotion
              path="M50 85 L25 75"
              dur="1.5s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="1.75s"
            />
          </circle>
          <circle className="fill-teal-500 animate-pulse-flow">
            <animateMotion
              path="M35 15 L25 25"
              dur="1.5s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="0.1s"
            />
          </circle>
          <circle className="fill-lime-500 animate-pulse-flow">
            <animateMotion
              path="M65 15 L75 25"
              dur="1.5s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="0.6s"
            />
          </circle>
          <circle className="fill-amber-500 animate-pulse-flow">
            <animateMotion
              path="M35 85 L25 75"
              dur="1.5s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="1.1s"
            />
          </circle>
          <circle className="fill-rose-500 animate-pulse-flow">
            <animateMotion
              path="M65 85 L75 75"
              dur="1.5s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.99;1"
              calcMode="linear"
              begin="1.6s"
            />
          </circle>
        </svg>
      </div>
    }
    title="AI-Enabled Knowledge Graph"
    description="Harness the power of AI to create a dynamic, interconnected knowledge graph with real-time information flow"
  />
)
