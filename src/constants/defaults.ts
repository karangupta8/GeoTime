// API Configuration
export const DEFAULT_EVENT_LIMIT = 50;
export const DEFAULT_SEARCH_RADIUS = 100; // km for location-based searches
export const DEFAULT_DESCRIPTION_LENGTH = 150; // Max description length for map popups

// Cache Durations (in milliseconds)
export const FRONTEND_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const WIKIPEDIA_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const TOAST_REMOVE_DELAY = 1000000; // Toast display duration

// UI Limits and Thresholds
export const MAX_DESCRIPTION_LENGTH = 100; // For summaries
export const MIN_SENTENCE_LENGTH = 50; // For summary truncation
export const CLUSTER_SIZE_THRESHOLDS = {
  SMALL: 10,
  MEDIUM: 100,
  LARGE: 100
};
export const CLUSTER_SIZES = {
  SMALL: 40,
  MEDIUM: 50,
  LARGE: 60
};

// Animation Durations (in milliseconds)
export const CLUSTER_ANIMATION_DURATION = 500;
export const CARET_BLINK_DURATION = 1000;

// Year Range Configuration
export const DEFAULT_YEAR_RANGE: [number, number] = [1941, 1945];
export const DEFAULT_START_YEAR = 1941;
export const DEFAULT_END_YEAR = 1945;

// Year Range Limits
export const MIN_YEAR = -1000; // 1000 BCE
export const MAX_YEAR = 2025;  // 2025 CE
export const MAX_YEAR_SPAN = 5; // Maximum year range span

// API Year Validation
export const API_MIN_YEAR = -5000; // API validation limit
export const API_MAX_YEAR = new Date().getFullYear(); // Current year 