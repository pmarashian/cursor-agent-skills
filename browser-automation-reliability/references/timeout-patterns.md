# Timeout Patterns

## Default Timeouts

- **Text search**: 10 seconds
- **Element interaction**: 10 seconds
- **Navigation**: 15 seconds
- **Test seam commands**: 5 seconds
- **Screenshot**: 5 seconds

## Configurable Timeouts

Set explicit timeout for each command type:

```javascript
// Example timeout configuration
const TIMEOUTS = {
  textSearch: 10000,      // 10 seconds
  elementClick: 10000,    // 10 seconds
  navigation: 15000,      // 15 seconds
  testSeam: 5000,         // 5 seconds
  screenshot: 5000        // 5 seconds
};
```

## Exponential Backoff

When retrying after timeout:

```javascript
const delays = [1000, 2000, 4000]; // 1s, 2s, 4s

for (let attempt = 0; attempt < 3; attempt++) {
  try {
    // Execute command with timeout
    await executeWithTimeout(command, TIMEOUTS[type]);
    break; // Success
  } catch (error) {
    if (attempt < 2) {
      await sleep(delays[attempt]); // Wait before retry
    } else {
      throw error; // Final attempt failed
    }
  }
}
```

## Timeout Detection

Detect when command exceeds timeout:

```javascript
function executeWithTimeout(command, timeout) {
  return Promise.race([
    command(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}
```

## Best Practices

- Set timeouts appropriate to command type
- Use shorter timeouts for test seam commands (faster)
- Use longer timeouts for navigation (slower)
- Fail fast when timeout exceeded
- Log timeout occurrences for debugging
