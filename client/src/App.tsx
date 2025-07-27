import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import VendorDashboard from "@/pages/vendor-dashboard";
import BuyerDashboard from "@/pages/buyer-dashboard";
import GroupBuy from "@/pages/group-buy";
import Rescue from "@/pages/rescue";
import VendorProfile from "@/pages/vendor-profile";

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Redirect to={user.role === 'vendor' ? '/vendor/dashboard' : '/buyer/dashboard'} />;
  }

  return <>{children}</>;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login">
        {user ? (
          <Redirect to={user.role === 'vendor' ? '/vendor/dashboard' : '/buyer/dashboard'} />
        ) : (
          <Login />
        )}
      </Route>
      
      {/* Vendor routes */}
      <Route path="/vendor/dashboard">
        <ProtectedRoute requiredRole="vendor">
          <VendorDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor/profile">
        <ProtectedRoute requiredRole="vendor">
          <VendorProfile />
        </ProtectedRoute>
      </Route>
      
      {/* Buyer routes */}
      <Route path="/buyer/dashboard">
        <ProtectedRoute requiredRole="buyer">
          <BuyerDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Shared routes */}
      <Route path="/group-buy">
        <ProtectedRoute>
          <GroupBuy />
        </ProtectedRoute>
      </Route>
      
      <Route path="/rescue">
        <ProtectedRoute>
          <Rescue />
        </ProtectedRoute>
      </Route>
      
      {/* Catch-all redirect for authenticated users */}
      <Route path="/dashboard">
        {user ? (
          <Redirect to={user.role === 'vendor' ? '/vendor/dashboard' : '/buyer/dashboard'} />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
