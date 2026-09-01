// 1x1 red pixel JPEG
const MINIMAL_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Cf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Cf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Cf//Z";

function tintJpeg(seed: string): Uint8Array {
  const bytes = Uint8Array.from(atob(MINIMAL_JPEG_BASE64), (char) =>
    char.charCodeAt(0),
  );
  const hash = [...seed].reduce(
    (accumulator, char) => (accumulator * 31 + char.charCodeAt(0)) >>> 0,
    0,
  );
  const tintIndex = Math.min(bytes.length - 2, 80 + (hash % 40));
  bytes[tintIndex] = (bytes[tintIndex] + (hash % 64)) % 256;
  return bytes;
}

export async function fetchSeedImage(
  imageSeed: string,
  imagesDir?: string,
): Promise<{ bytes: Uint8Array; contentType: string; filename: string }> {
  if (imagesDir) {
    for (const extension of ["jpg", "jpeg", "png", "webp"] as const) {
      const file = Bun.file(`${imagesDir}/${imageSeed}.${extension}`);
      if (await file.exists()) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const contentType =
          extension === "png"
            ? "image/png"
            : extension === "webp"
              ? "image/webp"
              : "image/jpeg";
        return {
          bytes,
          contentType,
          filename: `${imageSeed}.${extension === "jpeg" ? "jpg" : extension}`,
        };
      }
    }
  }

  const response = await fetch(
    `https://picsum.photos/seed/${encodeURIComponent(imageSeed)}/512/512`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image for ${imageSeed}: ${response.status} ${response.statusText}`,
    );
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const extension = contentType.includes("png") ? "png" : "jpg";

  return {
    bytes,
    contentType,
    filename: `${imageSeed}.${extension}`,
  };
}

export function createOfflinePlaceholderJpeg(seed: string): Uint8Array {
  return tintJpeg(seed);
}

export async function loadSeedImage(
  imageSeed: string,
  options: { imagesDir?: string; offline?: boolean },
): Promise<{ bytes: Uint8Array; contentType: string; filename: string }> {
  if (options.offline) {
    return {
      bytes: createOfflinePlaceholderJpeg(imageSeed),
      contentType: "image/jpeg",
      filename: `${imageSeed}.jpg`,
    };
  }

  return fetchSeedImage(imageSeed, options.imagesDir);
}
