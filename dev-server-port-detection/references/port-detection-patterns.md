# Port Detection Patterns by Build Tool

## Vite

**Default port**: 5173

**Configuration locations**:
- `vite.config.ts`: `server.port` option
- `package.json`: `PORT` environment variable in scripts
- Command line: `--port` flag

**Detection pattern**:
```typescript
// vite.config.ts
export default {
  server: {
    port: 3000  // Check this value
  }
}
```

**Terminal output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Webpack Dev Server

**Default port**: 8080

**Configuration locations**:
- `webpack.config.js`: `devServer.port`
- `package.json`: `PORT` environment variable

**Terminal output**:
```
webpack 5.x.x compiled successfully
i ｢wds｣: Project is running at http://localhost:8080/
```

## Next.js

**Default port**: 3000

**Configuration locations**:
- `package.json`: `PORT` environment variable
- Command line: `-p` or `--port` flag

**Terminal output**:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

## Create React App

**Default port**: 3000

**Configuration locations**:
- `.env` file: `PORT=3000`
- `package.json`: `PORT` environment variable

**Terminal output**:
```
Compiled successfully!

You can now view my-app in the browser.

  Local:            http://localhost:3000
```

## Detection Priority

1. Configuration files (vite.config.ts, webpack.config.js)
2. Environment variables (package.json scripts, .env files)
3. Running processes (lsof, netstat)
4. Terminal output parsing
5. Sequential port testing with timeout
