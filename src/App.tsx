import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { ClientDashboard } from "@/components/client/ClientDashboard";
import { DesignerDashboard } from "@/components/designer/DesignerDashboard";
import { ClientLogin } from "@/components/auth/ClientLogin";
import { DesignerLogin } from "@/components/auth/DesignerLogin";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SeedPage } from "./pages/SeedPage";
import { RequestedCredits } from "./components/designer/RequestedCredits";
import { DesignerProjectsChat } from "./components/designer/DesignerMessages";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/client-login" element={<ClientLogin />} />
              <Route path="/designer-login" element={<DesignerLogin />} />
              <Route path="/seed" element={<SeedPage />} />
              <Route path="/approve-credits" element={<RequestedCredits />} />
              <Route path="/messages" element={<DesignerProjectsChat />} />
              <Route
                path="/client"
                element={
                  <>
                    <Header />
                    <AuthGuard requiredRole="client">
                      <ClientDashboard />
                    </AuthGuard>
                  </>
                }
              />
              <Route
                path="/designer"
                element={
                  <>
                    <Header />
                    <AuthGuard requiredRole="designer">
                      <DesignerDashboard />
                    </AuthGuard>
                  </>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
