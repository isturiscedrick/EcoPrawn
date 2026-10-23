# Prisma & Next.js Development on Windows

## Process Management Guardrails
1. **Stop Dev Server Before Prisma CLI Operations**:
   - Always stop active Next.js dev server (`next dev`) processes before executing `npx prisma generate`, `npx prisma db push`, or `npx prisma migrate`.
   - On Windows, running Node processes lock `query_engine-windows.dll.node`, resulting in `EPERM` rename failures if the generator runs concurrently.

2. **Restart Dev Server After .env Modifications**:
   - When `.env` or `DATABASE_URL` credentials are created or updated, always terminate and restart the Next.js dev server so the runtime loads the fresh environment variables.

3. **Version Pinning**:
   - Always pin `prisma` and `@prisma/client` to matching stable releases to prevent dependency bloat and excessive disk I/O on Windows Defender.

4. **Multi-Package Dependency Verification**:
   - Before running Prisma commands, seeds, or connection scripts in `backend/` or `frontend/`, always check if `node_modules/@prisma/client` exists in that specific directory.
   - If not, execute `npm install` within that subfolder first.
