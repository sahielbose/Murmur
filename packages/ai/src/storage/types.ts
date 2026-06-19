export type SignedUrl = {
  url: string;
  method: "GET" | "PUT";
  headers?: Record<string, string>;
  expiresInSec: number;
};

/**
 * Object storage seam (MURMUR_CONTEXT.md §5). The local-filesystem adapter backs
 * the secret-free build; Cloudflare R2 (presigned up/download) is wired in
 * Phase 18 with a mock fallback.
 */
export interface Storage {
  readonly name: string;
  put(key: string, data: Uint8Array, contentType?: string): Promise<void>;
  get(key: string): Promise<Uint8Array>;
  exists(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
  /** A URL the browser uploads the audio to (presigned PUT / local route). */
  getUploadUrl(key: string, contentType?: string): Promise<SignedUrl>;
  /** A short-lived URL to download/stream the audio. */
  getDownloadUrl(key: string): Promise<SignedUrl>;
}
