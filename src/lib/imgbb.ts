const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type UploadResponse = {
  success?: boolean;
  message?: string;
  data?: { url?: string };
};

/**
 * Send a device-selected image through the Next.js API route so the ImgBB key
 * stays server-side and the browser never has to call ImgBB directly.
 */
export async function uploadImageToImgBb(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Choose a JPEG, PNG, WEBP, or GIF image.");
  }

  if (file.size === 0) {
    throw new Error("Choose a valid image file.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Images must be 10MB or smaller.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/upload/imgbb", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as UploadResponse | null;

  if (!response.ok || !payload?.success || !payload.data?.url) {
    throw new Error(
      payload?.message ?? "Photo upload failed. Please try again.",
    );
  }

  return payload.data.url;
}
