
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './hooks/use-theme'
import App from './App.tsx'
import './index.css'

// Create a client with better cache handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 60, // Cache cleanup after 1 hour of inactivity
      retry: false, // Disable retries for failed queries
      refetchOnWindowFocus: false, // Disable refetch on window focus since we use real-time
      refetchOnMount: true, // Keep refetch on mount for initial data load
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
