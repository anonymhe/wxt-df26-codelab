import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins conditional class names and resolves conflicting Tailwind utilities so
 * the last one wins. Re-exported through the `cn` alias configured in
 * tsconfig.json and wxt.config.ts, which is what the shadcn components import.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
