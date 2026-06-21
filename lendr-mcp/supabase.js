import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "[lendr-mcp] SUPABASE_URL is missing. Please check your .env file."
  );
}

if (!supabaseKey) {
  throw new Error(
    "[lendr-mcp] SUPABASE_KEY is missing. Please check your .env file."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);