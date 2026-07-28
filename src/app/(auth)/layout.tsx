import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <Image
          src="/logo.jpg"
          alt="A.T. Abdulkadiri & Co. logo"
          width={36}
          height={36}
          className="size-9 rounded-md object-cover"
        />
        <div className="leading-tight">
          <p className="text-base font-semibold">A.T. Tenancy Manager</p>
          <p className="text-xs text-muted-foreground">A.T. Abdulkadiri & Co.</p>
        </div>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
