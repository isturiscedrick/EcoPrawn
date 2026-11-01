# Nuclei scan, 2026-11-01

## Result

No Nuclei matches were found in the completed unauthenticated localhost scans. This does not establish that the application has no vulnerabilities.

| Target | Checks | Result |
| --- | --- | --- |
| Frontend, `http://127.0.0.1:3000` | 12 Next.js HTTP templates | Completed, 0 matches |
| Frontend, `http://127.0.0.1:3000` | 1,478 exposure and misconfiguration HTTP templates, low through critical severity | Completed after resuming a time-limited pass, 0 matches |
| API, `http://127.0.0.1:4000` | 12 Next.js HTTP templates | Completed, 0 matches |
| Isolated production API, `http://127.0.0.1:4002` | 1,488 Next.js, exposure, and misconfiguration HTTP templates, low through critical severity | Completed, 0 matches |

Scanner: Nuclei v3.11.1 with official signed nuclei-templates v10.5.1. The isolated API used dummy database, Supabase Auth, and SMS settings. The completed API pass made 3,855 HTTP connections. No credentials or session cookies were supplied.

The first broad API passes against development port 4001 and existing port 4000 were skipped by Nuclei after 30 unresponsive requests. The completed isolated production API pass on port 4002 superseded those partial passes. Nuclei generated no finding records; its JSONL output files were empty.

## Coverage limits

- Nuclei only tests behavior represented by its selected templates. Zero matches cannot rule out application-specific access control, business logic, or client-side issues.
- This was an unauthenticated scan. Operator and administrator routes were not exercised after sign-in.
- Localhost does not represent deployed TLS, headers from a hosting proxy, or external service configuration.
- The isolated API had no live database or auth provider, so authenticated data flows were outside this scan.

For deeper coverage, run an authenticated scan in a disposable staging environment with separate operator and administrator test accounts, then manually test ownership boundaries and state-changing routes. Avoid using production records or SMS credits for that pass.
