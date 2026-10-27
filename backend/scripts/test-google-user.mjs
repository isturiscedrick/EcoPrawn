import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(new URL("../src/lib/google-user.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { findOrCreateGoogleUser } = await import("data:text/javascript;base64," + Buffer.from(outputText).toString("base64"));
const records = [{ id: "legacy", email: "legacy@gmail.com", role: "admin", authId: null }];
const database = { user: {
  async findUnique({ where }) { return records.find(user => user.authId === where.authId) ?? null; },
  async findFirst({ where }) { return records.find(user => user.email.toLowerCase() === where.email.equals) ?? null; },
  async updateMany({ where, data }) {
    const user = records.find(user => user.id === where.id && user.authId === where.authId);
    if (user) Object.assign(user, data);
    assert.deepEqual(Object.keys(data), ["authId"], "Migration must preserve role and profile");
    return { count: user ? 1 : 0 };
  },
  async upsert({ where, update, create }) {
    assert.deepEqual(update, {}, "Login must not change roles");
    const existing = records.find(user => user.authId === where.authId);
    if (existing) return existing;
    const user = { id: String(records.length + 1), ...create };
    records.push(user); return user;
  },
} };
const profile = (authId, email) => ({ authId, email, name: "Test", canLinkExisting: true });
const first = await findOrCreateGoogleUser(database, profile("auth-1", "FIRST@gmail.com"));
const second = await findOrCreateGoogleUser(database, profile("auth-2", "second@gmail.com"));
assert.equal(first.role, "operator"); assert.equal(second.role, "operator");
assert.notEqual(first.id, second.id);
assert.equal(first.email, "first@gmail.com");
assert.equal((await findOrCreateGoogleUser(database, profile("auth-1", "changed@gmail.com"))).id, first.id);
assert.equal(records.length, 3);
const migrated = await findOrCreateGoogleUser(database, profile("auth-legacy", "LEGACY@gmail.com"));
assert.equal(migrated.id, "legacy"); assert.equal(migrated.role, "admin");
assert.equal(migrated.authId, "auth-legacy");
await assert.rejects(findOrCreateGoogleUser(database, profile("attacker", "legacy@gmail.com")));
records.push({ id: "unlinked", email: "existing@example.com", role: "admin", authId: null });
await assert.rejects(findOrCreateGoogleUser(database, { ...profile("untrusted", "existing@example.com"), canLinkExisting: false }));
assert.equal(records.at(-1).authId, null);
console.log("Account tests passed: operator defaults, stable identity, existing-role preservation, and conflicting identity rejection.");
