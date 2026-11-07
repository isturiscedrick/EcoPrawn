import { mkdir, readdir, readFile, stat, unlink, writeFile, rmdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { randomUUID } from "node:crypto";

const root = () => resolve(process.env.GROWTH_STORAGE_DIR || ".growth-storage");
const keyPath = (key: string, preview = false) => {
  if (!/^[a-f0-9-]{36}$/.test(key)) throw new Error("Invalid image key");
  return join(root(), key + (preview ? ".png" : ".image"));
};
export async function storeImages(raw: Buffer, preview: Buffer) {
  await mkdir(root(), { recursive: true });
  const lock = join(root(), ".write-lock");
  // Filesystem lock also bounds concurrent writers from separate backend processes.
  await mkdir(lock).catch(() => { throw new Error("Image storage busy; retry shortly"); });
  const key = randomUUID();
  try {
    const cap = Number(process.env.GROWTH_STORAGE_MAX_BYTES || 1073741824);
    if (!Number.isSafeInteger(cap) || cap <= 0) throw new Error("Invalid storage cap");
    let used = 0;
    for (const entry of await readdir(root(), { withFileTypes: true })) {
      if (entry.isFile()) used += (await stat(join(root(), entry.name))).size;
    }
    if (used + raw.length + preview.length > cap) throw new Error("Image storage is full; delete images or increase the cap");
    await writeFile(keyPath(key), raw, { flag: "wx", mode: 0o600 });
    await writeFile(keyPath(key, true), preview, { flag: "wx", mode: 0o600 });
    return key;
  } catch (error) {
    await deleteImages(key);
    throw error;
  } finally { await rmdir(lock); }
}
export async function deleteImages(key: string) {
  for (const preview of [false, true]) {
    await unlink(keyPath(key, preview)).catch(error => { if (error.code !== "ENOENT") throw error; });
  }
}
export const loadImage = (key: string, preview = true) => readFile(keyPath(key, preview));

export async function limitedJson(request: Request | Response, limit = 12 * 1024 * 1024): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing request body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error("Upload exceeds size limit"); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally { reader.releaseLock(); }
}
