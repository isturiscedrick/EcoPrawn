# Prisma & Bun Development on Windows

## Process Management Guardrails
1. **Stop Dev Server Before Prisma CLI Operations**:
   - Always stop active backend dev or production server (`bun run dev` / `bun run start`) processes before executing `bun run db:generate`, `bun run db:push`, or `bunx --bun prisma migrate`.
   - On Windows, running Bun processes lock `query_engine-windows.dll.node`, resulting in `EPERM` rename failures if the generator runs concurrently.

2. **Restart Dev Server After .env Modifications**:
   - When `.env` or `DATABASE_URL` credentials are created or updated, always terminate and restart the backend server so the runtime loads the fresh environment variables.

3. **Version Pinning**:
   - Always pin `prisma` and `@prisma/client` to matching stable releases (currently `6.4.1` with its native query engine) to prevent dependency bloat and excessive disk I/O on Windows Defender.

4. **Multi-Package Dependency Verification**:
   - Before running Prisma commands, seeds, or connection scripts in `backend/` or `frontend/`, always check if `node_modules/@prisma/client` exists in that specific directory.
   - If not, execute `bun install` within `backend/` first. The frontend does not install Prisma.
