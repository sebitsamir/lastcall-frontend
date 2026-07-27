import clsx from "clsx";
import { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// This function takes any number of class names, filters out of falsy values,
// and merges them intelligently
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}