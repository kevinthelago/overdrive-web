import { z } from 'zod'

export const OpportunityTypeSchema = z.enum(['UNDERSERVED_LANE', 'COST_ADVANTAGE', 'VOLUME_GAP', 'NEW_MARKET'])
export type OpportunityType = z.infer<typeof OpportunityTypeSchema>

export const OpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: OpportunityTypeSchema,
  region: z.string(),
  score: z.number().min(0).max(100),
  competitorId: z.string().nullable(),
})
export type Opportunity = z.infer<typeof OpportunitySchema>

export const OpportunityDetailSchema = OpportunitySchema.extend({
  description: z.string().optional(),
  estimatedRevenue: z.number().optional(),
  affectedLanes: z.array(z.string()).optional(),
  actionItems: z.array(z.string()).optional(),
})
export type OpportunityDetail = z.infer<typeof OpportunityDetailSchema>

/** Spring Data Page<Opportunity> shape */
export const OpportunityPageSchema = z.object({
  content: z.array(OpportunitySchema),
  totalElements: z.number(),
  totalPages: z.number(),
  page: z.number(),
  size: z.number(),
})
export type OpportunityPage = z.infer<typeof OpportunityPageSchema>

/** Aggregated per-state opportunity score for choropleth rendering. */
export type StateOpportunityScore = {
  stateCode: string
  score: number
  opportunityCount: number
}
