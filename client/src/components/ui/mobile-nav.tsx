import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, Users, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const vendorNavItems = [
    { href: "/vendor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/group-buy", icon: Users, label: "Group Buy" },
    { href: "/rescue", icon: Heart, label: "Rescue" },
    { href: "/vendor/profile", icon: User, label: "Profile" },
  ];

  const buyerNavItems = [
    { href: "/buyer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/rescue", icon: Heart, label: "Rescue" },
    { href: "/vendors", icon: Users, label: "Vendors" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const navItems = user.role === 'vendor' ? vendorNavItems : buyerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <button 
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-colors",
                  isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
