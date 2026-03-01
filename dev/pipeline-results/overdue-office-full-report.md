# Pipeline Audit Report
**Agent:** overdue-office
**Target:** /Users/cairr/.openclaw/agents/overdue-office/workspace
**Timestamp:** Sun Mar  1 18:53:28 AEDT 2026
---

# Stage 1: Location

## [S1] location-check
```
✅ LOCATION-CHECK: PASS
```

# Stage 2: Format

## [S2] format-check
```
/Users/cairr/.openclaw/workspace/scripts/pipeline/format-check.sh: line 17: continue: do: numeric argument required
```

# Stage 3: Security (BLOCKING)

## [S3] security-scan
```
✅ SECURITY: PASS — No secrets detected
```

## [S3] data-exposure
```
✅ DATA-EXPOSURE: PASS
```

## [S3] isolation-check
```
/Users/cairr/.openclaw/workspace/scripts/pipeline/isolation-check.sh: line 11: declare: -A: invalid option
declare: usage: declare [-afFirtx] [-p] [name[=value] ...]
```

# Stage 4: Compliance

## [S4] banned-words
```
✅ BANNED-WORDS: PASS
```

## [S4] metrics-ban
```
✅ METRICS-BAN: PASS
```

## [S4] seo-compliance
```
❌ SEO-COMPLIANCE: FAIL
⚠️ POSSIBLE KEYWORD STUFFING in /Users/cairr/.openclaw/agents/overdue-office/workspace/dev/START_HERE.md:
35 x claude

⚠️ POSSIBLE KEYWORD STUFFING in /Users/cairr/.openclaw/agents/overdue-office/workspace/dev/docs/LOCKED_STYLES.md:
15 x locked

⚠️ POSSIBLE KEYWORD STUFFING in /Users/cairr/.openclaw/agents/overdue-office/workspace/dev/README.md:
20 x claude
15 x project

⚠️ POSSIBLE KEYWORD STUFFING in /Users/cairr/.openclaw/agents/overdue-office/workspace/dev/homepage.tsx:
47 x style
```

## [S4] gdpr-check
```
✅ GDPR-CHECK: PASS
```

## [S4] license-check
```
✅ LICENSE-CHECK: PASS (no package.json)
```

# Stage 5: Quality

## [S5] dead-code
```
✅ DEAD-CODE: PASS
```

## [S5] docs-check
```
✅ DOCS-CHECK: PASS
```

## [S5] build-check
```
✅ BUILD-CHECK: PASS
```

# Stage 6: Verification

## [S6] url-verify
```
✅ URL-VERIFY: PASS (no URLs found)
```

---
## Summary
- **Total checks:** 14
- **Passed:** 13
- **Failed:** 1
- **Blocked:** 0
- **Result: ⚠️ 1 WARNINGS (non-blocking)**
