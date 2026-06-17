import { z } from 'zod'

export const CompetitorSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  region: z.string(),
  tags: z.array(z.string()),
})
export type Competitor = z.infer<typeof CompetitorSchema>

export const CompetitorDetailSchema = CompetitorSchema.extend({
  description: z.string().optional(),
  marketShare: z.number().optional(),
  estimatedRevenue: z.number().optional(),
  coverageStates: z.array(z.string()).optional(),
})
export type CompetitorDetail = z.infer<typeof CompetitorDetailSchema>

/** Spring Data Page<Competitor> shape */
export const CompetitorPageSchema = z.object({
  content: z.array(CompetitorSchema),
  totalElements: z.number(),
  totalPages: z.number(),
  page: z.number(),
  size: z.number(),
})
export type CompetitorPage = z.infer<typeof CompetitorPageSchema>
