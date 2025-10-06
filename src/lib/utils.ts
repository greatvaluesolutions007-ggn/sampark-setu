import type { BasePathType } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getBasePath = (base: BasePathType): string => {
  switch (base) {
    case 'USER':
      {
        const apiProtocol = (import.meta as any).env?.VITE_API_PROTOCOL || 'http';
        const apiHost = (import.meta as any).env?.VITE_API_HOST || 'localhost';
        const apiPort = (import.meta as any).env?.VITE_API_PORT ?? '3000';
        const apiPrefix = (import.meta as any).env?.VITE_API_PREFIX || '/api';
        return `${apiProtocol}://${apiHost}${apiPort ? `:${apiPort}` : ''}${apiPrefix}`;
      }
    default:
      {
        const devProtocol = (import.meta as any).env?.VITE_DEV_PROTOCOL || 'http';
        const devHost = (import.meta as any).env?.VITE_DEV_HOST || 'localhost';
        const devPort = (import.meta as any).env?.VITE_DEV_PORT ?? '8000';
        return `${devProtocol}://${devHost}${devPort ? `:${devPort}` : ''}`;
      }
  }
};