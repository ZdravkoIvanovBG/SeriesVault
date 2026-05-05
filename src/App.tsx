import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SeriesProvider } from "@/context/SeriesContext";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import SeriesDetail from "./pages/SeriesDetail";
import Index from "./pages/Index";
import Watched from "./pages/Watched";
import Watchlist from "./pages/Watchlist";
import TierList from "./pages/TierList";
import Upcoming from "./pages/Upcoming";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SeriesProvider>
            <Header />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/watched" element={<ProtectedRoute><Watched /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
              <Route path="/tier-list" element={<ProtectedRoute><TierList /></ProtectedRoute>} />
              <Route path="/upcoming" element={<ProtectedRoute><Upcoming /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/series/:id" element={<ProtectedRoute><SeriesDetail /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SeriesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
