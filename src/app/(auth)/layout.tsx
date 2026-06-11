import { Building2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Building2 className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-semibold">Tenancy Manager</p>
          <p className="text-xs text-muted-foreground">A.T Properties</p>
        </div>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
