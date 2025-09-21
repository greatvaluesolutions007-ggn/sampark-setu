import type { BasePathType } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getBasePath = (type: BasePathType): string | undefined => {
  switch (type) {
    case "USER":
      return import.meta.env.VITE_APP_BASE_PATH_USER;
  }
};