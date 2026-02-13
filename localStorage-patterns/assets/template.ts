// Template for localStorage utilities
// Replace DataType and DEFAULT_DATA with actual types and defaults

const STORAGE_KEY = 'storageKey'; // Use camelCase, match codebase pattern
const DEFAULT_DATA: DataType = {
  // Default values
};

export function loadData(): DataType {
  if (typeof Storage === 'undefined') {
    console.warn('localStorage not available');
    return DEFAULT_DATA;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_DATA;
    
    const parsed = JSON.parse(stored);
    // Validate structure if needed
    return parsed;
  } catch (error) {
    console.error('Error loading data:', error);
    return DEFAULT_DATA;
  }
}

export function saveData(data: DataType): void {
  if (typeof Storage === 'undefined') {
    console.warn('localStorage not available');
    return;
  }
  
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export function getData(): DataType {
  return loadData();
}

// Export key for reference
export { STORAGE_KEY };
