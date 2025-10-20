'use server';

/**
 * @fileOverview A fraud report generation AI agent.
 *
 * - generateFraudReport - A function that handles the fraud report generation process.
 * - GenerateFraudReportInput - The input type for the generateFraudReport function.
 * - GenerateFraudReportOutput - The return type for the generateFraudReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFraudReportInputSchema = z.object({
  analysisResults: z
    .string()
    .describe('The AI analysis results of the document.'),
  confidenceScore: z
    .number()
    .describe('The fraud confidence score indicating the likelihood of forgery.'),
  suspectAreas: z
    .string()
    .describe('The visually highlighted suspect areas on the document.'),
});
export type GenerateFraudReportInput = z.infer<typeof GenerateFraudReportInputSchema>;

const GenerateFraudReportOutputSchema = z.object({
  report: z.string().describe('A detailed report summarizing the fraud analysis.'),
});
export type GenerateFraudReportOutput = z.infer<typeof GenerateFraudReportOutputSchema>;

export async function generateFraudReport(input: GenerateFraudReportInput): Promise<GenerateFraudReportOutput> {
  return generateFraudReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFraudReportPrompt',
  input: {schema: GenerateFraudReportInputSchema},
  output: {schema: GenerateFraudReportOutputSchema},
  prompt: `You are an AI expert specializing in generating fraud reports for documents.

You will use the provided analysis results, confidence score, and suspect areas to create a comprehensive fraud report.

Analysis Results: {{{analysisResults}}}
Confidence Score: {{{confidenceScore}}}
Suspect Areas: {{{suspectAreas}}}

Generate a detailed report summarizing these findings. Clearly indicate whether the document is likely genuine or forged, and highlight the potential risks associated with the document.
`,
});

const generateFraudReportFlow = ai.defineFlow(
  {
    name: 'generateFraudReportFlow',
    inputSchema: GenerateFraudReportInputSchema,
    outputSchema: GenerateFraudReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
