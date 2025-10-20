// This directive marks this module as a "server" module, which can be imported
// by client-side components but will only ever execute on the server.
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This is the main configuration object for Genkit.
// It initializes Genkit and configures the plugins it will use.
export const ai = genkit({
  // The `plugins` array is where we tell Genkit which AI services to connect to.
  // In this case, we're using the Google AI plugin to access Gemini models.
  plugins: [googleAI()],
  
  // The `model` property sets the default AI model to be used for generation tasks.
  // Here, we're using 'gemini-2.5-flash', a fast and capable model from Google.
  // This can be overridden in specific `ai.generate()` or `ai.definePrompt()` calls.
  model: 'googleai/gemini-2.5-flash',
});
