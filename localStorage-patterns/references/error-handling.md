# localStorage Error Handling

## Availability Check

Always check if localStorage is available:

```typescript
if (typeof Storage === 'undefined') {
  console.warn('localStorage not available');
  return DEFAULT_DATA;
}
```

## JSON Parsing with Error Handling

Wrap JSON.parse in try-catch:

```typescript
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_DATA;
  
  const parsed = JSON.parse(stored);
  // Validate structure
  return parsed;
} catch (error) {
  console.error('Error loading data:', error);
  return DEFAULT_DATA;
}
```

## Data Validation

Validate parsed data structure:

```typescript
function validateData(data: any): DataType {
  if (!data || typeof data !== 'object') {
    return DEFAULT_DATA;
  }
  
  // Validate required fields
  if (!data.hasOwnProperty('requiredField')) {
    return DEFAULT_DATA;
  }
  
  return data as DataType;
}
```

## Complete Error Handling Pattern

```typescript
export function loadData(): DataType {
  // 1. Check availability
  if (typeof Storage === 'undefined') {
    console.warn('localStorage not available');
    return DEFAULT_DATA;
  }
  
  try {
    // 2. Get stored value
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_DATA;
    
    // 3. Parse JSON
    const parsed = JSON.parse(stored);
    
    // 4. Validate structure
    return validateData(parsed);
  } catch (error) {
    // 5. Fallback on any error
    console.error('Error loading data:', error);
    return DEFAULT_DATA;
  }
}
```

## Save Error Handling

```typescript
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
    // Handle quota exceeded or other errors
  }
}
```

## Best Practices

- Always check localStorage availability
- Wrap JSON operations in try-catch
- Validate parsed data structure
- Fallback to defaults on any error
- Log errors for debugging
- Handle quota exceeded scenarios
