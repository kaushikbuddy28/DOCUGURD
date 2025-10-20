
"use client";

// Import necessary hooks and components.
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// Import AI flow functions.
import { explainConfidenceScore } from '@/ai/flows/explain-confidence-score';
import { generateFraudReport } from '@/ai/flows/generate-fraud-report';
import { summarizeDocumentFindings } from '@/ai/flows/summarize-document-findings';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, FileText, Info } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Find the placeholder document image from the JSON data.
const documentImage = PlaceHolderImages.find(img => img.id === 'document-1');

// Define hardcoded "suspect areas" for highlighting on the document image.
// These are positioned absolutely based on percentages.
const suspectAreas = [
  { top: '15%', left: '50%', width: '35%', height: '8%' },
  { top: '70%', left: '20%', width: '60%', height: '10%' },
  { top: '45%', left: '75%', width: '10%', height: '5%' },
];

// This is the main component for the analysis results page.
export default function AnalysisPage({ params }: { params: { id: string } }) {
  // State variables to hold the analysis results.
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [report, setReport] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true); // State to manage loading UI.

  const auth = useAuth();
  const firestore = useFirestore();
  const user = auth.currentUser;

  // `useEffect` hook runs once when the component mounts to perform the analysis.
  useEffect(() => {
    const runAnalysis = async () => {
      // Simulate a fraud confidence score for demonstration.
      const score = Math.floor(Math.random() * (85 - 40 + 1) + 40);
      setConfidenceScore(score);

      try {
        // Run all AI analysis flows in parallel for efficiency.
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
  
        // Update state with the results from the AI flows.
        setSummary(summaryRes.summary);
        setReport(reportRes.report);
        setExplanation(explanationRes.explanation);

        // Save analysis results to Firestore
        if (user && firestore) {
            const analysisId = `analysis_${Date.now()}`;
            const analysisRef = doc(firestore, `users/${user.uid}/documents/${params.id}/analysis_results`, analysisId);
            const analysisData = {
                forgeryScore: score,
                reportSummary: summaryRes.summary,
                analysisDate: new Date().toISOString(),
                suspectAreas: JSON.stringify(suspectAreas.map(a => `top: ${a.top}, left: ${a.left}`)),
            };
            // Use the non-blocking update function. It handles its own errors.
            setDocumentNonBlocking(analysisRef, analysisData, { merge: true });
        }

      } catch (error) {
        console.error("AI analysis failed:", error);
        // Set error messages if any of the AI calls fail.
        setSummary("An error occurred while generating the analysis summary.");
        setReport("An error occurred while generating the full report.");
        setExplanation("An error occurred while explaining the score.");
      } finally {
        // Set loading to false once all operations are complete.
        setIsLoading(false);
      }
    };

    runAnalysis();
  }, [params.id, user, firestore]); // The dependency array ensures this effect runs when params, user or firestore change.

  // This function determines the color of the score display based on the score value.
  const getScoreStyling = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score > 75) return 'text-destructive'; // High risk = red
    if (score > 50) return 'text-chart-4'; // Medium risk = yellow/orange
    return 'text-chart-2'; // Low risk = green
  };

  // Handle case where the document image fails to load.
  if (!documentImage) {
    return <div>Error: Document image not found.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header showBackButton={true} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto grid gap-8 md:grid-cols-5 lg:grid-cols-3">
          {/* Left column: Document Preview */}
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
                  priority // Prioritize loading this image as it's the main content.
                />
                {/* Conditionally render suspect area highlights if not loading and score is high enough. */}
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

          {/* Right column: Analysis Results */}
          <div className="md:col-span-2 lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Fraud Confidence Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                {isLoading || confidenceScore === null ? (
                  // Show skeletons while loading.
                  <>
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </>
                ) : (
                  // Show the score chart and text once loaded.
                  <>
                    <div className="relative h-32 w-32">
                      {/* SVG for the circular progress bar. */}
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

            {/* Accordion for displaying detailed analysis sections. */}
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1" className="bg-card border rounded-lg shadow-lg">
                <AccordionTrigger className="px-6 text-base font-semibold">
                  <div className="flex items-center gap-3"><AlertCircle className="h-5 w-5" />Analysis Summary</div>
                </AccordionTrigger>
                <AccordionContent className="px-6 prose prose-sm dark:prose-invert max-w-none">
                  {isLoading ? (
                    <div className="space-y-2 pt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
                  ) : <p>{summary}</p>}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="bg-card border rounded-lg shadow-lg mt-6">
                <AccordionTrigger className="px-6 text-base font-semibold">
                  <div className="flex items-center gap-3"><FileText className="h-5 w-5" />Full Report</div>
                </AccordionTrigger>
                <AccordionContent className="px-6 prose prose-sm dark:prose-invert max-w-none">
                   {isLoading ? (
                     <div className="space-y-2 pt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-11/12" /></div>
                  ) : <p className="whitespace-pre-wrap">{report}</p>}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="bg-card border rounded-lg shadow-lg mt-6">
                <AccordionTrigger className="px-6 text-base font-semibold">
                  <div className="flex items-center gap-3"><Info className="h-5 w-5" />Score Explanation</div>
                </AccordionTrigger>
                <AccordionContent className="px-6 prose prose-sm dark:prose-invert max-w-none">
                   {isLoading ? (
                     <div className="space-y-2 pt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
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
