
"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackButton() {
  const router = useRouter();

  return (
    <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-sm">
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
