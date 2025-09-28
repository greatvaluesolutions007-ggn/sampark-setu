import type { BasePathType } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getBasePath = (base: BasePathType): string => {
  switch (base) {
    case 'USER':
      return 'http://localhost:3000/api';
    default:
      return 'http://localhost:5173'; // This might be the issue
  }
};