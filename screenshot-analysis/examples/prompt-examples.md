# Screenshot Analysis Prompt Examples

This document provides detailed prompt examples for various screenshot analysis scenarios. Use these as templates and adapt them to your specific needs.

## Table of Contents

1. [UI Element Validation](#ui-element-validation)
2. [Color and Styling Checks](#color-and-styling-checks)
3. [Text Content Verification](#text-content-verification)
4. [Layout and Positioning](#layout-and-positioning)
5. [Game State Validation](#game-state-validation)
6. [Visual Regression Testing](#visual-regression-testing)
7. [Accessibility Checks](#accessibility-checks)
8. [Error State Detection](#error-state-detection)
9. [Form Validation](#form-validation)
10. [Responsive Design Checks](#responsive-design-checks)

---

## UI Element Validation

### Basic Visibility Check

```
Check if the "Submit" button is visible on the page. It should be located in the bottom-right area of the form.
```

### Button State Check

```
Verify that the "Add to Cart" button is visible, enabled (not grayed out or disabled), and displays the text "Add to Cart". The button should be blue in color.
```

### Multiple Elements Check (JSON)

```
Analyze the UI and return a JSON object with the following structure:
{
  "loginButtonVisible": boolean,
  "loginButtonText": string,
  "loginButtonColor": string,
  "headerLogoVisible": boolean,
  "navigationMenuVisible": boolean,
  "footerVisible": boolean
}
```

### Element Count Verification

```
Count how many product cards are visible on the page. Each card should have an image, title, price, and "Buy Now" button.
```

---

## Color and Styling Checks

### Specific Color Verification

```
Check the color of the primary action button. It should be exactly #0066CC (blue). Also verify that the text color is white (#FFFFFF) and the button has a border-radius of 8px (rounded corners).
```

### Color Scheme Validation

```
Verify the color scheme of the header: background should be dark blue (#1a1a2e), text should be white, and the logo should be visible. Check if there's a gradient effect from top to bottom.
```

### Styling Consistency

```
Check if all buttons on the page have consistent styling: same background color, same text color, same border radius, and same padding. Report any inconsistencies.
```

---

## Text Content Verification

### Exact Text Match

```
Read the heading text at the top of the page. It should say exactly "Welcome to Dashboard". Also check if there's a subtitle that says "Manage your account settings".
```

### Text Presence Check

```
Verify that the following text elements are present on the page:
1. "Sign In" button text
2. "Forgot Password?" link text
3. Error message (if any) in red text
4. Page title in the browser tab area (if visible)
```

### Dynamic Text Validation

```
Check if the user's name appears in the top-right corner of the header. The name should be displayed next to a profile icon. Also verify the text "Logged in as [name]" is visible.
```

### Text Formatting Check

```
Verify that the price is displayed with proper formatting: it should show a dollar sign ($), have two decimal places, and be in a larger, bold font. Example format: $29.99
```

---

## Layout and Positioning

### Grid Layout Validation

```
Verify the product grid layout: there should be exactly 3 columns of products, each product card should be evenly spaced, and the grid should be centered on the page. Each card should have equal width and height.
```

### Responsive Layout Check

```
Check the layout structure: the sidebar should be on the left side (approximately 250px wide), the main content area should be in the center taking up the remaining space, and the header should span the full width at the top (100% width).
```

### Alignment Verification

```
Verify that all navigation menu items are horizontally aligned in a row, evenly spaced, and centered. The menu should be positioned below the header logo.
```

### Spacing Check

```
Check the spacing between elements: there should be at least 20px of padding around the main content area, and form fields should have 10px spacing between them.
```

---

## Game State Validation

### Player Status Check

```
Check the game HUD (heads-up display): verify the player's health bar shows 75% (green bar), the mana bar shows 50% (blue bar), the score displays "1,250" in the top-right, and the level indicator shows "Level 5".
```

### Game Elements Visibility

```
Verify the game state: there should be 3 enemy sprites visible on screen, the player character should be in the center-bottom area, and the pause button should be visible in the top-right corner. Check if any power-ups are visible.
```

### UI Overlay Validation

```
Check if the game menu overlay is visible: it should have a semi-transparent dark background, show "PAUSED" text in the center, and display three buttons: "Resume", "Settings", and "Quit". The buttons should be centered vertically.
```

### Inventory Check

```
Verify the inventory panel: it should show 8 item slots, 3 of which are filled with items (have icons visible). The inventory panel should be positioned on the right side of the screen.
```

---

## Visual Regression Testing

### Design Comparison

```
Compare this screenshot to the expected design specifications:
1. Header height should be exactly 60px
2. Logo should be positioned 20px from the left edge
3. Navigation items should be aligned horizontally with 30px spacing
4. Main content area should have 40px padding on all sides
5. Footer should be at the bottom with height of 80px
Report any deviations from these specifications.
```

### Element Position Check

```
Verify the exact positions of key elements:
- Logo: top-left corner, 10px from top and left edges
- Search bar: centered horizontally, 20px from top
- User avatar: top-right corner, 15px from top and right edges
- Navigation: below header, 5px spacing
Report any positioning errors.
```

### Spacing Consistency

```
Check spacing consistency across the page: all sections should have uniform 40px vertical spacing, all cards should have 20px margin, and all buttons should have 16px padding. Report any inconsistencies.
```

---

## Accessibility Checks

### Contrast Verification

```
Check text contrast: all text should have sufficient contrast against its background. Specifically, verify that:
- Dark text on light backgrounds is clearly readable
- Light text on dark backgrounds is clearly readable
- No text appears in colors that blend with the background
Report any contrast issues.
```

### Text Size Check

```
Verify that all text is readable: headings should be larger than body text, and body text should be at least 14px in size. Check if any text appears too small to read comfortably.
```

### Focus Indicators

```
Check if interactive elements (buttons, links, form fields) have visible focus indicators when they should be focused. Look for outline, border, or background color changes that indicate focus state.
```

### Visual Hierarchy

```
Verify the visual hierarchy: the most important information should be most prominent (largest, boldest, or most colorful). Check if the page follows a clear visual hierarchy from most to least important elements.
```

---

## Error State Detection

### Error Message Detection

```
Check if there are any error messages displayed on the page. Look for:
- Red text indicating errors
- Error icons or symbols
- Alert boxes or banners
- Inline error messages near form fields
Report the text of any error messages found.
```

### Warning Detection

```
Scan the page for warning messages. Look for yellow or orange colored text, warning icons, or alert banners. Report any warnings and their locations.
```

### Success State Verification

```
Verify if a success message is displayed. It should be green in color and say something like "Success" or "Saved successfully". Check if it's positioned prominently (usually top-center or top-right).
```

### Loading State Check

```
Check if the page is in a loading state: look for loading spinners, progress bars, skeleton screens, or "Loading..." text. Report what loading indicators are visible and where.
```

---

## Form Validation

### Form Field Visibility

```
Verify that all required form fields are visible:
- Email input field
- Password input field
- "Remember me" checkbox
- "Submit" button
Check if each field has a visible label.
```

### Form Field States

```
Check the state of form fields:
- Which fields have values entered?
- Which fields show validation errors (red border or error text)?
- Is the submit button enabled or disabled?
- Are any fields marked as required (with asterisk or "required" text)?
```

### Form Layout Check

```
Verify the form layout: all fields should be vertically stacked with consistent spacing (approximately 16px between fields), labels should be above their respective inputs, and the submit button should be at the bottom, centered or right-aligned.
```

---

## Responsive Design Checks

### Mobile Layout Verification

```
Verify the mobile layout (viewport appears to be mobile-sized):
- Navigation should be a hamburger menu (three horizontal lines icon)
- Content should be stacked vertically (single column)
- Text should be readable without horizontal scrolling
- Buttons should be full-width or appropriately sized for touch
- No horizontal overflow or cut-off elements
```

### Desktop Layout Verification

```
Verify the desktop layout (viewport appears to be desktop-sized):
- Navigation should be a horizontal menu bar
- Content should use multiple columns where appropriate
- Sidebar should be visible (if applicable)
- Elements should be properly spaced and not cramped
- Footer should span full width
```

### Breakpoint Check

```
Analyze the current layout and determine which responsive breakpoint is active. Check if:
- Layout switches from mobile to tablet or desktop appropriately
- Elements resize correctly
- Navigation changes format appropriately
- Images scale properly
Report the apparent breakpoint and any issues.
```

---

## Advanced Examples

### Multi-Step Validation (JSON)

```
Analyze this screenshot comprehensively and return a detailed JSON object:
{
  "pageTitle": string,
  "header": {
    "visible": boolean,
    "logoVisible": boolean,
    "navigationItems": string[],
    "userMenuVisible": boolean
  },
  "mainContent": {
    "visible": boolean,
    "sections": number,
    "hasSidebar": boolean
  },
  "forms": {
    "count": number,
    "fields": string[],
    "submitButtons": number
  },
  "errors": string[],
  "warnings": string[],
  "colors": {
    "primary": string,
    "background": string,
    "text": string
  }
}
```

### Conditional Analysis

```
First, check if this is a logged-in user view (look for user menu, profile icon, or "Logout" button). If logged in, verify the user's name is displayed. If not logged in, check if there's a "Sign In" button visible. Report the authentication state and relevant UI elements.
```

### Comparison Prompt

```
Compare the current state to the expected state:
- Expected: Blue "Submit" button with white text
- Expected: Form with 5 fields visible
- Expected: No error messages
- Expected: Header logo in top-left
Report any differences between expected and actual state.
```

---

## Tips for Using These Examples

1. **Customize for Your Context**: Replace generic terms (like "Submit button") with your specific element names
2. **Combine Prompts**: Use multiple analysis calls for complex validations
3. **Iterate**: Refine prompts based on initial results
4. **Use Structured Output**: Request JSON format when you need programmatic validation
5. **Be Specific**: Include exact colors, positions, and text when possible
6. **Account for Dynamic Content**: Mention loading states, animations, or async content

---

## Model Selection Guide

- **gpt-4o-mini**: Use for simple checks (visibility, basic colors, text presence)
- **gpt-4o**: Use for complex analysis (layout, multiple elements, detailed descriptions, JSON output)
