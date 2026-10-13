import { z } from 'zod'

export const ScoreSchema = z.object({
  scores: z.object({
    communication: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
    customer_service_mindset: z.number().min(0).max(100),
    emotional_intelligence: z.number().min(0).max(100),
    answer_structure: z.number().min(0).max(100),
    grammar_vocabulary: z.number().min(0).max(100),
    professionalism: z.number().min(0).max(100),
    cultural_awareness: z.number().min(0).max(100),
  }),
  what_was_good: z.string().min(1),
  what_was_weak: z.string().min(1),
  top_tip: z.string().min(1),
  recruiter_reaction: z.string().min(1),
})

export type ScoreOutput = z.infer<typeof ScoreSchema>
