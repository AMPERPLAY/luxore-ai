import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Asegúrate de tener este plugin si usas React

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // No necesitamos loadEnv aquí si vamos a tomarla directamente de process.env
  // que Vercel nos dará (si la nombramos correctamente VITE_API_KEY)

  return {
    plugins: [react()], // Asegúrate de tener este plugin si usas React
    define: {
      // Aquí está la clave:
      // Hacemos que process.env.API_KEY en tu código del navegador
      // tome el valor de la variable de entorno VITE_API_KEY
      // que Vercel proporciona.
      'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY)
    },
    server: {
      port: 3000, // Esto es para desarrollo local, Vercel lo ignora
    },
    build: {
      sourcemap: false,
    }
  };
});