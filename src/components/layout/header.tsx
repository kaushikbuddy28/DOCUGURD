
import Link from 'next/link';
import { DocuGuardLogo } from '@/components/docuguard-logo';
import { BackButton } from './back-button';

type HeaderProps = {
  showBackButton?: boolean;
};

export function Header({ showBackButton = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-4">
          {showBackButton ? (
            <BackButton />
          ) : (
            <Link href="/" aria-label="Back to homepage" className="flex items-center">
              <DocuGuardLogo />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
