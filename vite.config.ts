import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		host: "0.0.0.0",
		port: 5173,
		proxy: {
			'/api': {
				target: process.env.VITE_API_URL || 'http://localhost:3000',
				changeOrigin: true,
			}
		},
		watch: {
			usePolling: false, // DESACTIVADO para desarrollo local
			ignored: [
				"**/node_modules/**",
				"**/dist/**",
				"**/.git/**",
				"**/coverage/**",
				"**/.vscode/**",
				"**/tmp/**",
				"**/temp/**"
			],
		},
	},
	build: {
		target: 'esnext',
		minify: 'esbuild',
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					router: ['react-router-dom'],
					ui: ['lucide-react', 'react-hot-toast']
				}
			}
		}
	},
	optimizeDeps: {
		include: ['react', 'react-dom', 'react-router-dom'],
		exclude: ['@vite/client', '@vite/env']
	},
});
