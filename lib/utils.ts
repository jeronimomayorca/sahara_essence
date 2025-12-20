import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPerfumeImageUrl(imageName: string | null | undefined): string {
  if (!imageName) return "/placeholder.svg"
  if (imageName.startsWith("http")) return imageName
  return `https://kwtkwtvnskytohiyixmw.supabase.co/storage/v1/object/public/perfume_images/${imageName}`
}

