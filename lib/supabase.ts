import { createClient } from '@supabase/supabase-js';

// =================================================================
// PERBAIKAN DEFINITIF - KONEKSI SUPABASE
// =================================================================
// Masalah sebelumnya terjadi karena platform ini tidak menyediakan
// variabel lingkungan (process.env) untuk Supabase.
//
// SOLUSI: Menggunakan kredensial yang Anda berikan secara langsung
// untuk memastikan koneksi berhasil dan menyelesaikan error.
// Ini adalah langkah final untuk mengatasi masalah konektivitas.
// =================================================================

const supabaseUrl = "https://wexruddknnoffkatqaos.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleHJ1ZGRrbm5vZmZrYXRxYW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDE2NTYsImV4cCI6MjA4NTMxNzY1Nn0.XDJg9Yn_ahbRO1NmjixGbp-C2f2cH8Ebmph4A1rTdrM";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Kredensial Supabase tidak valid. Harap periksa kembali.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
