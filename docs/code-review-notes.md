# Code Review Notes

**Reviewer:** Self-review with AI assistance  
**Date:** July 6, 2026

## Strengths

1. **Clear separation of concerns** — Shared types, API service layer, reusable hooks, presentational components
2. **Consistent error handling** — `ApiRequestError` class with status and validation details
3. **UI state coverage** — Dedicated components for loading, empty, error, and success states
4. **Validation at boundary** — Zod schemas on server; client displays server validation errors
5. **Accessibility basics** — Skip link, ARIA roles, labeled form fields, focus styles

## Issues Found

### Medium: No input sanitization for XSS in descriptions
- **Location:** Task detail renders `task.description` as text (React escapes by default — safe)
- **Status:** Acceptable — React JSX auto-escapes

### Low: `useAsyncData` dependency array uses eslint-disable
- **Location:** `hooks/useAsyncData.ts`
- **Recommendation:** Consider `useRef` for fetcher or accept re-fetch on dep change
- **Status:** Acceptable for assessment scope

### Low: Server serves SPA fallback only when `dist/client` exists
- **Location:** `server/index.ts`
- **Impact:** Production-only; dev uses Vite separately
- **Status:** By design

### Low: No rate limiting on API
- **Recommendation:** Add for production deployment
- **Status:** Out of scope for assessment

### Info: Activity log not shown on create page
- **Status:** By design — only on detail view

## Security Review

- No hardcoded secrets
- SQL uses parameterized queries (no injection)
- CORS enabled for dev (tighten for production)
- No auth — acceptable per scope

## Performance

- Dashboard summary uses 5 separate COUNT queries — acceptable for small datasets
- Could be combined into one query with conditional aggregation for scale

## Recommendations for Production

1. Add authentication middleware
2. Combine dashboard COUNT queries
3. Add request logging and rate limiting
4. Environment-based CORS configuration
5. E2E tests with Playwright
