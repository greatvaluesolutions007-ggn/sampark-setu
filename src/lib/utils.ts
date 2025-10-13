import type { BasePathType } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getBasePath = (base: BasePathType): string => {
  const isDev = (import.meta as any).env?.DEV;
  
  if (isDev) {
    // In development, use relative URLs to work with Vite proxy
    switch (base) {
      case 'USER':
        return '/api';
      default:
        return '';
    }
  }
  
  // In production, use full URLs
  switch (base) {
    case 'USER':
      {
        const apiProtocol = (import.meta as any).env?.VITE_API_PROTOCOL || 'http';
        const apiHost = (import.meta as any).env?.VITE_API_HOST || 'localhost';
        const apiPort = (import.meta as any).env?.VITE_API_PORT ?? '3000';
        const apiPrefix = (import.meta as any).env?.VITE_API_PREFIX || '/api';
                // return `http://13.235.114.249:3000${apiPrefix}`
        return `${apiProtocol}://${apiHost}${apiPort ? `:${apiPort}` : ''}${apiPrefix}`;
      }
    default:
      {
        const devProtocol = (import.meta as any).env?.VITE_DEV_PROTOCOL || 'http';
        const devHost = (import.meta as any).env?.VITE_DEV_HOST || 'localhost';
        const devPort = (import.meta as any).env?.VITE_DEV_PORT ?? '80';
        // return `http://13.235.114.249:3000${apiPrefix}`
        return `${devProtocol}://${devHost}${devPort ? `:${devPort}` : ''}`;
      }
  }
};