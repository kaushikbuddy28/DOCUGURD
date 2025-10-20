
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { explainConfidenceScore } from '@/ai/flows/explain-confidence-score';
import { generateFraudReport } from '@/ai/flows/generate-fraud-report';
import { summarizeDocumentFindings } from '@/ai/flows/summarize-document-findings';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, FileText, Info } from 'lucide-react';

const documentImage = PlaceHolderImages.find(img => img.id === 'document-1');

const suspectAreas = [
  { top: '15%', left: '50%', width: '35%', height: '8%' },
  { top: '70%', left: '20%', width: '60%', height: '10%' },
  { top: '45%', left: '75%', width: '10%', height: '5%' },
];

export default function AnalysisPage() {
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [report, setReport] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runAnalysis = async () => {
      const score = Math.floor(Math.random() * (85 - 40 + 1) + 40);
      setConfidenceScore(score);

      try {
        const [summaryRes, reportRes, explanationRes] = await Promise.all([
          summarizeDocumentFindings({
            fraudConfidenceScore: score,
            keyAreasOfConcern: "Inconsistencies in font type and size in the signature area, and pixel-level noise around the date field."
          }),
          generateFraudReport({
            analysisResults: "The document exhibits several red flags. The font in the main body does not match the font used in the signature block. There is evidence of digital manipulation around the date, with inconsistent pixel noise suggesting an edit. Metadata analysis shows the document was modified by a different software than the one it was allegedly created with.",
            confidenceScore: score,
            suspectAreas: "Signature block, date field"
          }),
          explainConfidenceScore({
            confidenceScore: score,
            factors: ["text structure", "font analysis", "image noise", "metadata mismatch"]
          })
        ]);
  
        setSummary(summaryRes.summary);
        setReport(reportRes.report);
        setExplanation(explanationRes.explanation);
      } catch (error) {
        console.error("AI analysis failed:", error);
        setSummary("An error occurred while generating the analysis summary.");
        setReport("An error occurred while generating the full report.");
        setExplanation("An error occurred while explaining the score.");
      } finally {
        setIsLoading(false);
      }
    };

    runAnalysis();
  }, []);

  const getScoreStyling = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score > 75) return 'text-destructive';
    if (score > 50) return 'text-chart-4';
    return 'text-chart-2';
  };

  if (!documentImage) {
    return <div>Error: Document image not found.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header showBackButton={true} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto grid gap-8 md:grid-cols-5 lg:grid-cols-3">
          <div className="md:col-span-3 lg:col-span-2">
            <Card className="h-full shadow-lg">
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
                <CardDescription>Potentially forged areas are highlighted.</CardDescription>
              </CardHeader>
              <CardContent className="relative flex items-center justify-center p-2 sm:p-6">
                <Image
                  src={documentImage.imageUrl}
                  alt={documentImage.description}
                  width={800}
                  height={1131}
                  className="rounded-md shadow-md"
                  data-ai-hint={documentImage.imageHint}
                  priority
                />
                {!isLoading && confidenceScore && confidenceScore > 40 && suspectAreas.map((area, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-destructive/70 bg-destructive/20 rounded-sm animate-pulse"
                    style={{ ...area }}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Fraud Confidence Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                {isLoading || confidenceScore === null ? (
                  <>
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </>
                ) : (
                  <>
                    <div className="relative h-32 w-32">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                          className="text-border"
                          cx="18" cy="18" r="15.9155"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        />
                        <circle
                          className={getScoreStyling(confidenceScore)}
                          cx="18" cy="18" r="15.9155"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeDasharray={`${confidenceScore}, 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className={`absolute inset-0 flex items-center justify-center ${getScoreStyling(confidenceScore)}`}>
                        <span className="font-headline text-4xl font-bold">
                          {confidenceScore}
                        </span>
                      </div>
                    </div>
                    <p className={`text-center font-semibold text-lg ${getScoreStyling(confidenceScore)}`}>
                      {confidenceScore > 75 ? "High Likelihood of Forgery" : confidenceScore > 50 ? "Potential Forgery Detected" : "Likely Genuine"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1" className="bg-card border rounded-lg shadow-lg">
                <AccordionTrigger className="px-6 text-base font-semibold">
                  <div className="flex items-center gap-3"><AlertCircle className="h-5 w-5" />Analysis Summary</div>
                </AccordionTrigger>
                <AccordionContent className="px-6 prose prose-sm dark:prose-invert max-w-none">
                  {isLoading ? (
                    <div className="space-y-2 pt-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : <p>{summary}</p>}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="bg-card border rounded-lg shadow-lg mt-6">
                <AccordionTrigger className="px-6 text-base font-semibold">
                  <div className="flex items-center gap-3"><FileText className="h-5 w-5" />Full Report</div>
                </AccordionTrigger>
                <AccordionContent className="px-6 prose prose-sm dark:prose-invert max-w-none">
                   {isLoading ? (
                     <div className="space-y-2 pt-2">
                      <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-11/12" />
                    </div>
                  ) : <p className="whitespace-pre-wrap">{report}</p>}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="bg-card border rounded-lg shadow-lg mt-6">
                <AccordionTrigger className="px-6 text-base font-semibold">
                  <div className="flex items-center gap-3"><Info className="h-5 w-5" />Score Explanation</div>
                </AccordionTrigger>
                <AccordionContent className="px-6 prose prose-sm dark:prose-invert max-w-none">
                   {isLoading ? (
                     <div className="space-y-2 pt-2">
                       <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" />
                    </div>
                  ) : <p className="whitespace-pre-wrap">{explanation}</p>}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
    </div>
  );
}
