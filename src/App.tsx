import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import BreedersPage from "./pages/BreedersPage";
import SiresPage from "./pages/SiresPage";
import AnimalPage from "./pages/AnimalPage";
import SirePage from "./pages/SirePage";
import WinnersPage from "./pages/WinnersPage";
import { MarketPage, HaulersPage } from "./pages/PlaceholderPage";
import SubmitWinnerPage from "./pages/SubmitWinnerPage";
import AuthPage from "./pages/AuthPage";
import BreederProfilePage from "./pages/BreederProfilePage";
import AdminPage from "./pages/AdminPage";
import PricingPage from "./pages/PricingPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/breeders" element={<BreedersPage />} />
            <Route path="/sires" element={<SiresPage />} />
            <Route path="/animal/:id" element={<AnimalPage />} />
            <Route path="/sire/:id" element={<SirePage />} />
            <Route path="/winners" element={<WinnersPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/haulers" element={<HaulersPage />} />
            <Route path="/submit" element={<SubmitWinnerPage />} />
            <Route path="/breeder/:username" element={<BreederProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
