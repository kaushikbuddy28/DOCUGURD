
"use client";

// Import necessary hooks and components from React, Next.js, and local files.
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileCheck2, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { InfoPopup } from '@/components/home/info-popup';
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// This is the main component for the homepage.
export default function Home() {
  const router = useRouter(); // Hook for programmatic navigation.
  const { toast } = useToast(); // Hook for showing toast notifications.
  const [dragging, setDragging] = useState(false); // State to track if a file is being dragged over the dropzone.
  const [uploading, setUploading] = useState(false); // State to track if the file is currently being "uploaded".
  const [file, setFile] = useState<File | null>(null); // State to hold the selected file.
  const [isInfoPopupOpen, setInfoPopupOpen] = useState(true); // State for the info popup.

  const auth = useAuth();
  const firestore = useFirestore();
  const user = auth.currentUser;

  // This function handles changes to the file input (e.g., when a user selects a file).
  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      // Check if the file size exceeds the 10MB limit.
      if (selectedFile.size > 10 * 1024 * 1024) { 
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile); // If the file is valid, store it in the state.
    }
  };

  // The following four functions handle the drag-and-drop functionality for the file upload area.
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
      handleFileChange(e.dataTransfer.files[0]); // Handle the dropped file.
      e.dataTransfer.clearData();
    }
  };

  // This function is called when the "Analyse Document" button is clicked.
  const handleAnalyse = useCallback(async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a document to analyse.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);

    if (user && firestore) {
      const docId = Date.now().toString();
      const userDocRef = doc(firestore, `users/${user.uid}/documents`, docId);

      try {
        await setDoc(userDocRef, {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadDate: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error saving document data:", error);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Could not save document information.",
        });
        setUploading(false);
        return;
      }
      router.push(`/analysis/${docId}`);
    } else {
        // Handle non-logged in user case, for now just proceed
        const docId = Date.now().toString();
        router.push(`/analysis/${docId}`);
    }
    
  }, [file, router, toast, user, firestore]);

  // `useMemo` is used to dynamically calculate the background color of the dropzone based on its state.
  const dropzoneBg = useMemo(() => {
    if (dragging) return 'bg-accent/60';
    if (file) return 'bg-accent/30';
    return 'bg-secondary';
  }, [dragging, file]);

  return (
    <div className="flex flex-col min-h-screen">
       <InfoPopup open={isInfoPopupOpen} onOpenChange={setInfoPopupOpen} />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl text-center">
          <h2 className="font-headline text-4xl sm:text-5xl font-bold mb-4">
            Verify Your Documents
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Upload a document to instantly check for signs of forgery using our AI-powered analysis tool.
          </p>

          {/* The file dropzone area */}
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
              className="hidden" // The actual file input is hidden and triggered programmatically.
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
              disabled={uploading}
            />
            <div className="flex flex-col items-center justify-center space-y-4 text-foreground">
              {file ? (
                // Displayed when a file has been selected.
                <>
                  <FileCheck2 className="w-16 h-16 text-primary" />
                  <p className="font-medium text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground">Ready to be analysed</p>
                </>
              ) : (
                // Displayed when no file is selected.
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
        <Button variant="link" onClick={() => setInfoPopupOpen(true)} className="gap-2">
            <Info className="h-4 w-4" /> What is DocuGuard?
        </Button>
        <div>© {new Date().getFullYear()} DocuGuard. All rights reserved.</div>
      </footer>
    </div>
  );
}
