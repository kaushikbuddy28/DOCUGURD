
"use client";

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileCheck2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleAnalyse = useCallback(() => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a document to analyse.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    // Simulate upload and processing time
    setTimeout(() => {
      const docId = Date.now().toString(); // Use timestamp as a unique ID for simulation
      router.push(`/analysis/${docId}`);
    }, 1500);
  }, [file, router, toast]);

  const dropzoneBg = useMemo(() => {
    if (dragging) return 'bg-accent/60';
    if (file) return 'bg-accent/30';
    return 'bg-secondary';
  }, [dragging, file]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl text-center">
          <h2 className="font-headline text-4xl sm:text-5xl font-bold mb-4">
            Verify Your Documents
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Upload a document to instantly check for signs of forgery using our AI-powered analysis tool.
          </p>

          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-10 sm:p-16 transition-colors duration-300 cursor-pointer",
              dropzoneBg,
              dragging ? 'border-primary' : 'border-border'
            )}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
              disabled={uploading}
            />
            <div className="flex flex-col items-center justify-center space-y-4 text-foreground">
              {file ? (
                <>
                  <FileCheck2 className="w-16 h-16 text-primary" />
                  <p className="font-medium text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground">Ready to be analysed</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-16 h-16 text-muted-foreground" />
                  <p className="font-medium text-lg">
                    Drag & drop your file here or <span className="text-accent-foreground font-semibold">browse</span>
                  </p>
                  <p className="text-sm text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                </>
              )}
            </div>
          </div>
          <Button
            onClick={handleAnalyse}
            disabled={!file || uploading}
            size="lg"
            className="mt-8 w-full max-w-xs"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analysing...
              </>
            ) : "Analyse Document"}
          </Button>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} DocuGuard. All rights reserved.
      </footer>
    </div>
  );
}
