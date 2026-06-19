import { mkdir, readFile, writeFile, stat, unlink } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { SignedUrl, Storage } from "./types";

function baseDir(): string {
  return resolve(process.env.STORAGE_LOCAL_DIR ?? "./.data/storage");
}

/** Resolve a storage key to a path inside the base dir (no traversal). */
function pathFor(key: string): string {
  const safe = key.replace(/\.\.+/g, "").replace(/^\/+/, "");
  return join(baseDir(), safe);
}

/**
 * Local-filesystem Storage adapter. Upload/download URLs point at a local API
 * route (`/api/storage/local/[...key]`, added in Phase 7) that proxies to these
 * methods, mirroring how R2 presigned URLs work.
 */
export const localFileStorage: Storage = {
  name: "local",

  async put(key, data) {
    const p = pathFor(key);
    await mkdir(dirname(p), { recursive: true });
    await writeFile(p, data);
  },

  async get(key) {
    return new Uint8Array(await readFile(pathFor(key)));
  },

  async exists(key) {
    try {
      await stat(pathFor(key));
      return true;
    } catch {
      return false;
    }
  },

  async remove(key) {
    try {
      await unlink(pathFor(key));
    } catch {
      // already gone — treat as success
    }
  },

  async getUploadUrl(key): Promise<SignedUrl> {
    return {
      url: `/api/storage/local/${encodeURIComponent(key)}`,
      method: "PUT",
      expiresInSec: 3600,
    };
  },

  async getDownloadUrl(key): Promise<SignedUrl> {
    return {
      url: `/api/storage/local/${encodeURIComponent(key)}`,
      method: "GET",
      expiresInSec: 3600,
    };
  },
};
