// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kqjznewgfiwzbxhwtubn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxanpuZXdnZml3emJ4aHd0dWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxMzYzODYsImV4cCI6MjA1MzcxMjM4Nn0.Vazh-vXj3NZpPXzxOD9zhVaqA71sIjVhk3IW7jy8jq0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);