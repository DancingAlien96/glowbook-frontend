"use client";

import imageCompression from "browser-image-compression";

export type OptimizeResult = {
  file: File;
  originalBytes: number;
  optimized: boolean;
};

export type OptimizeOptions = {
  /** Target max size in MB after compression. Default 3. */
  maxMB?: number;
  /** Max longest side in pixels. Default 2000. */
  maxDim?: number;
};

/**
 * Compress an image File client-side if it's over the target size.
 * - PDFs and other non-image types pass through unchanged.
 * - Images already under maxMB pass through unchanged.
 * - PNGs are kept as PNG (preserves transparency). Everything else is encoded as JPEG.
 * - On compression failure, returns the original file so UploadThing can surface the error.
 */
export async function optimizeImage(file: File, opts: OptimizeOptions = {}): Promise<OptimizeResult> {
  const originalBytes = file.size;
  const maxMB = opts.maxMB ?? 3;
  const maxDim = opts.maxDim ?? 2000;
  const maxBytes = maxMB * 1024 * 1024;

  const isImage = file.type.startsWith("image/");
  if (!isImage || file.size <= maxBytes) {
    return { file, originalBytes, optimized: false };
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: maxMB,
      maxWidthOrHeight: maxDim,
      useWebWorker: true,
      fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
      // Always re-encode (rather than just resize) so we hit the byte target.
      initialQuality: 0.85,
    });
    return { file: compressed, originalBytes, optimized: true };
  } catch (e) {
    console.warn("[imageOptimize] compression failed, falling back to original", e);
    return { file, originalBytes, optimized: false };
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
