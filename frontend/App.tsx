import React from "react"
import Typewriter from "typewriter-effect"
import { Shield, Users, Layout, Lock, FolderGit2, Cloud } from "lucide-react"

export function App() {
  return (
    <main className="min-h-screen w-full bg-black text-white p-12">
      <div className="max-w-6xl mx-auto pt-20 pb-16 text-center relative">
        <div className="relative">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl transform scale-150" />
            <h1 className="relative text-4xl md:text-6xl font-bold mb-8">
              <Typewriter
                options={{
                  strings: ["Valentin Loth"],
                  autoStart: true,
                  loop: false,
                  cursor: "",
                  wrapperClassName: "text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300",
                  deleteSpeed: 9999999,
                  delay: 50,
                }}
              />
            </h1>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-500">
          Capabilities
        </h2>
        <div className="mt-2 w-20 h-px mx-auto bg-gradient-to-r from-transparent via-gray-500/50 to-transparent" />
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          customContent={
            <div className="w-full h-32 mb-6 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/40 to-purple-500/40" />
                </div>
              </div>
            </div>
          }
          title="SOC 2 Compliance"
          description="Our product meets SOC 2 standards for secure handling of sensitive information"
        />
        <FeatureCard
          customContent={
            <div className="w-full h-32 mb-6 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center">
              <div className="space-y-2 w-full px-6">
                <div className="h-8 bg-gray-800 rounded-md flex items-center px-3">
                  <span className="text-xs text-gray-400">@company.com</span>
                </div>
                <div className="h-8 bg-gray-800 rounded-md flex items-center px-3">
                  <span className="text-xs text-gray-400">@sub.company.com</span>
                </div>
              </div>
            </div>
          }
          title="SSO and Domain Capture"
          description="Seamlessly manage users with SSO and domain capture"
        />
        <FeatureCard
          customContent={
            <div className="w-full h-32 mb-6 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="h-4 bg-gray-800 rounded w-full" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <div className="h-4 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            </div>
          }
          title="Fine-Grained Permissions"
          description="Effortlessly assign and manage fine-grained permissions with our solution"
        />
        <FeatureCard
          customContent={
            <div className="w-full h-32 mb-6 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-800 rounded w-3/4 mb-1" />
                    <div className="h-2 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-800 rounded w-3/4 mb-1" />
                    <div className="h-2 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          }
          title="Role-Based Access Control"
          description="Ensure enterprise security and compliance with role-based access management"
        />
        <FeatureCard
          customContent={
            <div className="w-full h-32 mb-6 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 p-4">
              <div className="grid grid-cols-2 gap-2 h-full">
                <div className="bg-gray-800 rounded-lg p-2">
                  <div className="h-2 bg-gray-700 rounded mb-2 w-3/4" />
                  <div className="h-2 bg-gray-700 rounded w-1/2" />
                </div>
                <div className="bg-gray-800 rounded-lg p-2">
                  <div className="h-2 bg-gray-700 rounded mb-2 w-3/4" />
                  <div className="h-2 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          }
          title="Workspaces Per Organization"
          description="Organize projects effectively with multiple workspaces per organization"
        />
        <FeatureCard
          customContent={
            <div className="w-full h-32 mb-6 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 p-4">
              <div className="flex items-center justify-center h-full">
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-gray-800 rounded w-full flex items-center px-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                    <span className="text-xs text-gray-400">Successfully deployed</span>
                  </div>
                  <div className="h-4 bg-gray-800 rounded w-full flex items-center px-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                    <span className="text-xs text-gray-400">Cache updated</span>
                  </div>
                </div>
              </div>
            </div>
          }
          title="On-Premise Deployment"
          description="Deploy Pasmic app on-premise for enhanced control and security"
        />
      </div>
    </main>
  )
}

function FeatureCard({ customContent, title, description }) {
  return (
    <div className="relative group h-[360px]">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl blur-xl transform group-hover:scale-105 transition-all duration-300" />
      <div className="relative h-full p-6 bg-gray-950/50 backdrop-blur-xl rounded-xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 flex flex-col">
        <div className="flex-none">{customContent}</div>
        <div className="flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-100">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
