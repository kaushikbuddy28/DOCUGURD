'use server';

/**
 * @fileOverview Summarizes the document forgery detection findings.
 *
 * - summarizeDocumentFindings - A function that takes in forgery detection results and returns a concise summary.
 * - SummarizeDocumentFindingsInput - The input type for the summarizeDocumentFindings function.
 * - SummarizeDocumentFindingsOutput - The return type for the summarizeDocumentFindings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentFindingsInputSchema = z.object({
  fraudConfidenceScore: z
    .number()
    .describe('The overall confidence score indicating the likelihood of forgery (0-100).'),
  keyAreasOfConcern: z
    .string()
    .describe('Detailed description of the areas of the document where tampering is suspected.'),
});
export type SummarizeDocumentFindingsInput = z.infer<
  typeof SummarizeDocumentFindingsInputSchema
>;

const SummarizeDocumentFindingsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the forgery detection results, including the overall confidence score and key areas of concern.'
    ),
});
export type SummarizeDocumentFindingsOutput = z.infer<
  typeof SummarizeDocumentFindingsOutputSchema
>;

export async function summarizeDocumentFindings(
  input: SummarizeDocumentFindingsInput
): Promise<SummarizeDocumentFindingsOutput> {
  return summarizeDocumentFindingsFlow(input);
}

const summarizeDocumentFindingsPrompt = ai.definePrompt({
  name: 'summarizeDocumentFindingsPrompt',
  input: {schema: SummarizeDocumentFindingsInputSchema},
  output: {schema: SummarizeDocumentFindingsOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing document forgery detection results.

  Based on the following information, provide a concise summary (under 100 words) of the document's authenticity for a user. Include the overall confidence score and key areas of concern.

  Fraud Confidence Score: {{{fraudConfidenceScore}}}
  Key Areas of Concern: {{{keyAreasOfConcern}}}`,
});

const summarizeDocumentFindingsFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFindingsFlow',
    inputSchema: SummarizeDocumentFindingsInputSchema,
    outputSchema: SummarizeDocumentFindingsOutputSchema,
  },
  async input => {
    const {output} = await summarizeDocumentFindingsPrompt(input);
    return output!;
  }
);
