import type React from "react"
import { AgenticAutomationCard } from "./cards/AgenticAutomationCard"
import { RetrievalAugmentedGenerationCard } from "./cards/RetrievalAugmentedGenerationCard"
import { AIEnabledKnowledgeBaseCard } from "./cards/AIEnabledKnowledgeBaseCard"
import { FineGrainedPermissionsCard } from "./cards/FineGrainedPermissionsCard"
import { RoleBasedAccessControlCard } from "./cards/RoleBasedAccessControlCard"
import { WorkspacesPerOrganizationCard } from "./cards/WorkspacesPerOrganizationCard"

export const FeatureCards: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    <AgenticAutomationCard />
    <RetrievalAugmentedGenerationCard />
    <AIEnabledKnowledgeBaseCard />
    <FineGrainedPermissionsCard />
    <RoleBasedAccessControlCard />
    <WorkspacesPerOrganizationCard />
  </div>
)
