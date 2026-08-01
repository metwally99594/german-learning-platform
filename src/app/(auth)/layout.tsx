export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/20" />
      <div className="absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      {children}
    </div>
  );
}
