# Retry Strategies

## Retry Logic Pattern

Retry failed commands up to 3 times with exponential backoff:

```javascript
async function retryCommand(command, maxRetries = 3) {
  const delays = [1000, 2000, 4000]; // Exponential backoff
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await command();
      return result; // Success
    } catch (error) {
      if (attempt < maxRetries - 1) {
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delays[attempt]}ms...`);
        await sleep(delays[attempt]);
      } else {
        throw error; // Final attempt failed
    }
  }
}
```

## Retry Conditions

**Retry on**:
- Timeout errors
- Network errors
- Transient failures

**Don't retry on**:
- Syntax errors
- Permanent failures
- Authentication errors

## Logging Retry Attempts

Always log retry attempts for debugging:

```javascript
console.log(`Retrying command (attempt ${attempt + 1}/${maxRetries})`);
console.log(`Error: ${error.message}`);
console.log(`Waiting ${delay}ms before retry`);
```

## Distinguishing Failure Types

Distinguish between transient and permanent failures:

```javascript
function isTransientError(error) {
  const transientErrors = [
    'Timeout',
    'Network error',
    'Connection refused'
  ];
  
  return transientErrors.some(msg => 
    error.message.includes(msg)
  );
}

if (isTransientError(error) && attempt < maxRetries - 1) {
  // Retry
} else {
  // Don't retry
  throw error;
}
```

## Best Practices

- Retry up to 3 times maximum
- Use exponential backoff (1s, 2s, 4s)
- Log all retry attempts
- Distinguish transient vs permanent failures
- Don't retry on syntax/permanent errors
