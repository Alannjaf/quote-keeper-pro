import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './hooks/use-theme'
import App from './App.tsx'
import './index.css'

// Create a client with better cache handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Reset stale time to 0 to ensure fresh data
      gcTime: 0, // Disable garbage collection temporarily to debug
      retry: false, // Disable retries for failed queries
      refetchOnWindowFocus: true, // Enable refetch on window focus
      refetchOnMount: true, // Enable refetch on component mount
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