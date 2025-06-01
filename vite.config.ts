
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Esto hace que la variable de entorno VITE_API_KEY que configuras en Vercel
    // esté disponible en tu código del navegador como process.env.API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY)
  },
  server: {
    port: 3000, // Puerto para desarrollo local, Vercel lo maneja diferente
  },
  build: {
    sourcemap: false, // Puedes desactivar sourcemaps para producción
  }
});
