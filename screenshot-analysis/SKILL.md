---
name: Screenshot Analysis
description: Guide for using AI-powered screenshot analysis to validate UI, game states, and visual elements
---

# Screenshot Analysis Skill

This skill guides you on how to effectively use the Screenshot Analyzer MCP server to validate visual elements, UI states, game mechanics, and more through AI-powered vision analysis.

## When to Use Screenshot Analysis

Screenshot analysis is valuable for:

- **UI Validation**: Verify colors, text, layout, and component visibility
- **Game State Checks**: Validate player position, game mechanics, UI elements in games
- **Visual Regression Testing**: Compare screenshots across versions or browsers
- **Accessibility Checks**: Verify contrast, text readability, and visual hierarchy
- **Cross-Browser Validation**: Ensure consistent appearance across browsers
- **Dynamic Content Verification**: Check content that loads asynchronously
- **Error State Detection**: Identify error messages, warnings, or unexpected states

## Available Tools

### `analyze_screenshot`

Analyzes a screenshot using OpenAI Vision API.

**Key Parameters:**

- `screenshot` (required): The full file path to the screenshot image.
- `prompt` (required): Your custom analysis prompt.
- `model`: OpenAI model (default: "gpt-4o")
- `responseFormat`: "text" or "json_object" (default: "text")
- `maxTokens`: Maximum tokens in response
- `temperature`: Generation temperature (default: 0)

## Prompt Crafting Best Practices

### 1. Be Specific and Contextual

**Bad:**

```
"What do you see?"
```

**Good:**

```
"Check if the login button in the top-right corner is visible and what color it is. Also verify if the text says 'Sign In' or 'Log In'."
```

### 2. Include Location and Context

Always specify:

- **Where** to look (top-left, center, specific region)
- **What** to look for (button, text, color, layout)
- **Expected state** (visible, hidden, specific value)

**Example:**

```
"In the header navigation bar, verify that the 'Cart' button is visible and displays the number '3' in a red badge. The button should be positioned on the right side."
```

### 3. Request Structured Output When Needed

For programmatic use, request JSON format:

```
"Analyze this UI and return a JSON object with: { 'loginButtonVisible': boolean, 'loginButtonColor': string, 'headerText': string, 'errorMessages': string[] }"
```

### 4. Handle Dynamic Content

Account for:

- Loading states ("Check if the loading spinner is visible")
- Animations ("Wait for animations to complete, then check...")
- Dynamic data ("Verify the user's name appears in the profile section")

### 5. Cost Optimization

- Use `gpt-4o-mini` for simple checks (colors, visibility, text)
- Use `gpt-4o` for complex analysis (layout analysis, multiple elements, detailed descriptions)
- Set `maxTokens` to limit response length when appropriate

### 6. Multi-Step Validation

Break complex validations into steps:

1. Capture screenshot
2. Analyze for specific element
3. Based on result, capture another screenshot or analyze further

## Common Use Cases

### UI Element Validation

**Prompt Example:**

```
"Verify that the submit button is visible, enabled (not grayed out), and displays the text 'Submit Order'. Check if it's positioned below the form fields."
```

### Color and Styling Checks

**Prompt Example:**

```
"Check the color of the primary action button. It should be blue (#0066CC). Also verify the text is white and the button has rounded corners."
```

### Text Content Verification

**Prompt Example:**

```
"Read the heading text at the top of the page. It should say 'Welcome to Dashboard'. Also check if there's any error message displayed in red text."
```

### Layout and Positioning

**Prompt Example:**

```
"Verify the layout: the sidebar should be on the left (200px wide), the main content area should be in the center, and the header should span the full width at the top."
```

### Game State Validation

**Prompt Example:**

```
"Check the game state: verify the player's health bar shows 75%, the score displays '1,250', and there are 3 enemies visible on screen. The pause button should be in the top-right corner."
```

### Visual Regression

**Prompt Example:**

```
"Compare this screenshot to the expected design. Check for: 1) Header height matches (should be 60px), 2) Logo is positioned correctly, 3) Navigation items are aligned, 4) No unexpected elements or spacing issues."
```

## Workflow Patterns

### Pattern 1: Simple Validation

1. Obtain screenshot
2. Analyze with specific prompt
3. Parse result and validate

### Pattern 2: Multi-Element Check

1. Obtain screenshot
2. Analyze with structured JSON prompt requesting multiple elements
3. Parse JSON and validate all elements

### Pattern 3: Conditional Validation

1. Obtain initial screenshot
2. Analyze to determine current state
3. Based on state, obtain additional screenshots or perform actions
4. Validate final state

### Pattern 4: Comparison Validation

1. Obtain screenshot
2. Obtain screenshot of current state
3. Analyze both (or use comparison logic)
4. Validate differences are expected

## Error Handling

- **Analysis Failures**: Verify API key, check prompt clarity, ensure screenshot is a valid full file path
- **Invalid Format**: Ensure screenshot is a valid file path

## Tips for Effective Analysis

1. **Start Broad, Then Narrow**: First verify overall page state, then focus on specific elements
2. **Use Descriptive Prompts**: Include visual cues (colors, positions, sizes) in your prompts
3. **Leverage Structured Output**: Use JSON format for programmatic validation
4. **Combine with Other Tools**: Use screenshot analysis alongside DOM inspection or API checks
5. **Ensure Base64 Format**: Screenshots must be provided as base64-encoded strings
6. **Iterate on Prompts**: Refine prompts based on analysis results

## Example Workflow

```javascript
// 1. Obtain screenshot (from external source)
// Screenshot should be provided as a valid full file path
const screenshotBase64 = "...";

// 2. Analyze for specific elements
const analysis = await analyze_screenshot({
  screenshot: screenshotBase64,
  prompt:
    "Return JSON with: { 'headerVisible': boolean, 'userName': string, 'notificationCount': number, 'primaryButtonColor': string }",
  responseFormat: "json_object",
  model: "gpt-4o",
});

// 3. Validate results
const result = JSON.parse(analysis.analysis);
if (!result.headerVisible) {
  throw new Error("Header is not visible");
}
if (result.notificationCount !== 3) {
  throw new Error(
    `Expected 3 notifications, found ${result.notificationCount}`,
  );
}
```

## See Also

- `examples/prompt-examples.md` - Detailed prompt examples for various scenarios
- MCP Server README for technical details and configuration
