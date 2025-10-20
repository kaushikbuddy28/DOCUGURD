
import { ShieldCheck } from 'lucide-react';

export function DocuGuardLogo() {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-8 w-8 text-primary" />
      <h1 className="font-headline text-2xl font-bold text-primary">DocuGuard</h1>
    </div>
  );
}
