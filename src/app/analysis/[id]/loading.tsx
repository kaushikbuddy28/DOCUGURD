
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalysisLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header showBackButton={true} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto grid gap-8 md:grid-cols-5 lg:grid-cols-3">
          <div className="md:col-span-3 lg:col-span-2">
            <Card className="h-full shadow-lg">
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-2 sm:p-6">
                <Skeleton className="w-full aspect-[1/1.414] max-w-lg" />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Fraud Confidence Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
