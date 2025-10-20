'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type InfoPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InfoPopup({ open, onOpenChange }: InfoPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to DocuGuard!</DialogTitle>
          <DialogDescription className="pt-2">
            Your AI-powered partner for detecting document forgery.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong>What is this website?</strong>
            <br />
            DocuGuard is a tool that uses artificial intelligence to analyze
            documents and identify potential signs of digital tampering or
            forgery.
          </p>
          <p>
            <strong>How does it work?</strong>
            <br />
            Simply upload a document (like a PDF, JPG, or PNG). Our AI will
            scan it for inconsistencies in fonts, pixel noise, metadata, and
            other digital fingerprints to calculate a forgery confidence score.
          </p>
          <p>
            You&apos;ll receive a detailed report highlighting suspicious areas and an
            explanation of the findings.
          </p>
        </div>
        <DialogClose asChild>
            <Button type="button" variant="secondary" className='mt-4'>
                Close
            </Button>
        </DialogClose>
        <DialogClose asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
