import { LayoutDashboard, Users, UserPlus, CheckCircle, ChefHat, QrCode } from "lucide-react";
import { Link, useLocation } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/checkin", label: "Check-in", icon: CheckCircle },
    { href: "/customers", label: "Clientes", icon: Users },
    { href: "/customers/new", label: "Novo Cliente", icon: UserPlus },
    { href: "/qrcodes", label: "QR Codes", icon: QrCode },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 font-serif text-xl font-semibold text-sidebar-primary">
            <ChefHat className="h-6 w-6" />
            <span>Ficheiro</span>
          </div>
          <p className="text-sidebar-foreground/60 text-xs mt-1">Loyalty System</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80'}`}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
            <ChefHat className="h-5 w-5" />
            <span>Ficheiro</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
        
        {/* Mobile Nav */}
        <nav className="md:hidden border-t border-border bg-card flex justify-around p-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center p-2 rounded-md ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
