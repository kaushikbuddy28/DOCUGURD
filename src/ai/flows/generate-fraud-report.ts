
'use server';

/**
 * @fileOverview A fraud report generation AI agent.
 * This file defines a Genkit flow that takes in fraud analysis data and
 * generates a detailed, human-readable report.
 *
 * - generateFraudReport - An exported function that clients can call to trigger the flow.
 * - GenerateFraudReportInput - The Zod schema for the input data.
 * - GenerateFraudReportOutput - The Zod schema for the expected output.
 */

import {ai} from '@/ai/genkit'; // Import the configured Genkit instance.
import {z} from 'genkit'; // Import Zod for schema validation.

// Define the schema for the input data using Zod.
// This ensures that the data passed to the flow is in the correct format.
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
// Create a TypeScript type from the Zod schema.
export type GenerateFraudReportInput = z.infer<typeof GenerateFraudReportInputSchema>;

// Define the schema for the output data.
// This tells the AI model what format the response should be in.
const GenerateFraudReportOutputSchema = z.object({
  report: z.string().describe('A detailed report summarizing the fraud analysis.'),
});
// Create a TypeScript type from the Zod schema.
export type GenerateFraudReportOutput = z.infer<typeof GenerateFraudReportOutputSchema>;

// This is the exported wrapper function that external code will call.
// It simply passes its input to the Genkit flow.
export async function generateFraudReport(input: GenerateFraudReportInput): Promise<GenerateFraudReportOutput> {
  return generateFraudReportFlow(input);
}

// Define a Genkit "prompt". This is a template for the request to the AI model.
const prompt = ai.definePrompt({
  name: 'generateFraudReportPrompt', // A unique name for this prompt.
  input: {schema: GenerateFraudReportInputSchema}, // The input schema.
  output: {schema: GenerateFraudReportOutputSchema}, // The desired output schema.
  // The prompt string itself. It uses Handlebars syntax `{{{...}}}` to insert input data.
  prompt: `You are an AI expert specializing in generating fraud reports for documents.

You will use the provided analysis results, confidence score, and suspect areas to create a comprehensive fraud report.

Analysis Results: {{{analysisResults}}}
Confidence Score: {{{confidenceScore}}}
Suspect Areas: {{{suspectAreas}}}

Generate a detailed report summarizing these findings. Clearly indicate whether the document is likely genuine or forged, and highlight the potential risks associated with the document.
`,
});

// Define the Genkit "flow". A flow orchestrates AI and code execution.
const generateFraudReportFlow = ai.defineFlow(
  {
    name: 'generateFraudReportFlow', // A unique name for this flow.
    inputSchema: GenerateFraudReportInputSchema, // The flow's input schema.
    outputSchema: GenerateFraudReportOutputSchema, // The flow's output schema.
  },
  async input => {
    // Execute the prompt with the given input.
    const {output} = await prompt(input);
    // Return the output from the AI model, which will be validated against the output schema.
    return output!;
  }
);
