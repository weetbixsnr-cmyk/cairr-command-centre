# Pipeline Audit Report
**Agent:** v3dn
**Target:** /Users/cairr/.openclaw/agents/v3dn/workspace
**Timestamp:** Thu Mar  5 02:02:40 AEDT 2026
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
✅ SEO-COMPLIANCE: PASS
```

## [S4] gdpr-check
```
✅ GDPR-CHECK: PASS
```

## [S4] license-check
```
✅ LICENSE-CHECK: PASS (no package.json)
```

## [S4] comms-check
```
✅ COMMS-CHECK: PASS
```

## [S4] report-template
```
✅ REPORT-TEMPLATE: PASS
```

# Stage 5: Quality

## [S5] dead-code
```
✅ DEAD-CODE: PASS
```

## [S5] docs-check
```
❌ DOCS-CHECK: FAIL
❌ No README.md found
```

## [S5] build-check
```
✅ BUILD-CHECK: PASS
```

## [S5] ui-check
```
✅ UI-CHECK: PASS (no UI files)
```

## [S5] seo-content
```
✅ SEO-CONTENT: PASS (no content files)
```

# Stage 6: Verification

## [S6] url-verify
```
✅ URL-VERIFY: PASS (no URLs found)
```

## [S6] line-limit
```
/Users/cairr/.openclaw/workspace/scripts/pipeline/line-limit.sh: line 8: declare: -A: invalid option
declare: usage: declare [-afFirtx] [-p] [name[=value] ...]
```

## [S6] weekly-health
```
WEEKLY HEALTH REPORT:
✅ SSL the-overdue-office.vercel.app expires: May 27 06:28:02 2026 GMT
✅ SSL command-centre-nine.vercel.app expires: May 27 06:28:02 2026 GMT
📦 the-overdue-office: 9
? outdated deps
📦 command-centre: 3
? outdated deps
```

---
## Summary
- **Total checks:** 20
- **Passed:** 19
- **Failed:** 1
- **Blocked:** 0
- **Result: ⚠️ 1 WARNINGS (non-blocking)**
