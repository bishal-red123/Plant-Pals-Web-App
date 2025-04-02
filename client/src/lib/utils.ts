import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-500 text-white';
    case 'processing':
      return 'bg-blue-500 text-white';
    case 'shipped':
      return 'bg-indigo-500 text-white';
    case 'delivered':
      return 'bg-green-500 text-white';
    case 'canceled':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

export function getDifficultyLabel(level: string): string {
  switch (level.toLowerCase()) {
    case 'beginner':
      return 'Easy';
    case 'intermediate':
      return 'Moderate';
    case 'expert':
      return 'Advanced';
    default:
      return level;
  }
}

export function getWaterRequirementLabel(level: string): string {
  switch (level.toLowerCase()) {
    case 'low':
      return 'Low - Water every 2-3 weeks';
    case 'medium':
      return 'Medium - Water weekly';
    case 'high':
      return 'High - Water 2-3 times per week';
    default:
      return level;
  }
}

export function getLightRequirementLabel(level: string): string {
  switch (level.toLowerCase()) {
    case 'low':
      return 'Low - Can tolerate shade';
    case 'medium':
      return 'Medium - Bright indirect light';
    case 'high':
      return 'High - Direct sunlight needed';
    default:
      return level;
  }
}
