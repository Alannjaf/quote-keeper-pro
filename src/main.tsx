import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './hooks/use-theme'
import App from './App.tsx'
import './index.css'

// Create a client with better cache handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      retry: 0, // Disable retries for failed queries
      refetchOnWindowFocus: true, // Disable refetch on window focus
      refetchOnMount: true, // Disable refetch on component mount
    },
  },
})

// Add the console.log here, after creating the queryClient
console.log('QueryClient config:', queryClient.getDefaultOptions());

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);