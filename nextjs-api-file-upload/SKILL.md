---
name: nextjs-api-file-upload
description: For Next.js App Router, use request.formData() and stream/parse the file (e.g. CSV) in the route handler. Do not use Express-style middleware (e.g. multer) in API routes—it can block the request pipeline and cause hangs. Use when implementing file upload in Next.js API routes.
---

# Next.js API File Upload (App Router)

This project uses **Next.js App Router**. File upload in API routes must use Next.js built-in handling, not Express middleware.

## Do Not Use

- **Express middleware** (e.g. multer) in API routes. It can block the request pipeline and cause long hangs (e.g. login or upload appearing stuck).

## Do Use

- **`request.formData()`** in the route handler.
- **Stream or parse the file** (e.g. CSV) inside the handler after calling `formData()`.

## Example Pattern

```typescript
// In app/api/upload/route.ts (or similar)
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return Response.json({ error: 'No file' }, { status: 400 });
  // Parse/stream file in handler (e.g. CSV parsing)
  // ...
}
```

## Integration

- Can be merged into a broader "Next.js API" skill if one exists. Use for any task that adds or changes file upload in Next.js App Router API routes.
