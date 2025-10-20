'use server';

/**
 * @fileOverview Explains the fraud confidence score by providing a summary of the factors that contributed to the score.
 *
 * - explainConfidenceScore - A function that generates an explanation of the confidence score.
 * - ExplainConfidenceScoreInput - The input type for the explainConfidenceScore function.
 * - ExplainConfidenceScoreOutput - The return type for the explainConfidenceScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainConfidenceScoreInputSchema = z.object({
  confidenceScore: z.number().describe('The fraud confidence score (0-100).'),
  factors: z
    .array(z.string())
    .describe(
      'A list of factors that contributed to the confidence score, e.g., text structure, layout, fonts, image noise, metadata.'
    ),
});
export type ExplainConfidenceScoreInput = z.infer<typeof ExplainConfidenceScoreInputSchema>;

const ExplainConfidenceScoreOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A human-readable explanation of how the confidence score was calculated and the contribution of each factor.'
    ),
});
export type ExplainConfidenceScoreOutput = z.infer<typeof ExplainConfidenceScoreOutputSchema>;

export async function explainConfidenceScore(
  input: ExplainConfidenceScoreInput
): Promise<ExplainConfidenceScoreOutput> {
  return explainConfidenceScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainConfidenceScorePrompt',
  input: {schema: ExplainConfidenceScoreInputSchema},
  output: {schema: ExplainConfidenceScoreOutputSchema},
  prompt: `You are an AI assistant that explains fraud confidence scores for documents.

  Based on the confidence score ({{confidenceScore}}) and the following contributing factors:
  {{#each factors}}
  - {{this}}
  {{/each}}

  Provide a concise explanation of how the confidence score was derived from these factors.
  Explain the rationale behind the assessment in a way that is easy to understand for a non-expert user.
  Be sure to include that higher confidence score represents higher likelihood of the document being fraudulent.
  `,
});

const explainConfidenceScoreFlow = ai.defineFlow(
  {
    name: 'explainConfidenceScoreFlow',
    inputSchema: ExplainConfidenceScoreInputSchema,
    outputSchema: ExplainConfidenceScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
