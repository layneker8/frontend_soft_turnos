// src/config/env.ts
import type { EnvConfig } from "@/@types";

export const env: EnvConfig = {
    NAME_APP: import.meta.env.VITE_NAME_APP || 'My App',
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
    AUTH_TOKEN: import.meta.env.VITE_AUTH_TOKEN,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
};

// Validación opcional de variables requeridas
if (!env.API_URL) {
    throw new Error('VITE_API_URL es requerida');
}

export default env;