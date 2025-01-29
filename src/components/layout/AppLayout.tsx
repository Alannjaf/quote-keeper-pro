import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserAvatar } from "./UserAvatar";
import { ModeToggle } from "./ModeToggle";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="app-layout">
        <AppSidebar />
        <main className="app-main">
          <div className="app-container">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <ModeToggle />
                <UserAvatar />
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}