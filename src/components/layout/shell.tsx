import { SidebarContent } from "./sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 border-r border-border/40 bg-background/70 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
