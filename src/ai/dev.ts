import { config } from 'dotenv';
config();

import '@/ai/flows/generate-fraud-report.ts';
import '@/ai/flows/summarize-document-findings.ts';
import '@/ai/flows/explain-confidence-score.ts';