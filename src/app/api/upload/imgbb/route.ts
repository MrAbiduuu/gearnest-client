const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type ImgBbResponse = {
  success?: boolean;
  data?: {
    display_url?: string;
    url?: string;
    delete_url?: string;
  };
  error?: string | { message?: string };
};

const errorMessage = (error: ImgBbResponse["error"]) =>
  typeof error === "string" ? error : error?.message;

/** POST /api/upload/imgbb - proxy device image uploads to ImgBB. */
export async function POST(request: Request) {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        success: false,
        message:
          "ImgBB upload is not configured. Add IMGBB_API_KEY to the client .env file.",
      },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { success: false, message: "Invalid upload request." },
      { status: 400 },
    );
  }

  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return Response.json(
      { success: false, message: "Choose an image to upload." },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    return Response.json(
      {
        success: false,
        message: "Only JPEG, PNG, WEBP, and GIF images are supported.",
      },
      { status: 400 },
    );
  }

  if (image.size > MAX_FILE_SIZE) {
    return Response.json(
      { success: false, message: "Images must be 10MB or smaller." },
      { status: 400 },
    );
  }

  const upload = new FormData();
  upload.append("image", image, image.name || "profile-image");

  let response: Response;
  try {
    response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: upload,
        cache: "no-store",
      },
    );
  } catch {
    return Response.json(
      { success: false, message: "Could not reach ImgBB. Please try again." },
      { status: 502 },
    );
  }

  const result = (await response.json().catch(() => null)) as ImgBbResponse | null;
  const imageUrl = result?.data?.display_url ?? result?.data?.url;

  if (!response.ok || !result?.success || !imageUrl) {
    return Response.json(
      {
        success: false,
        message:
          errorMessage(result?.error) ??
          "Photo upload failed. Try another image or use a direct link.",
      },
      { status: 502 },
    );
  }

  return Response.json({
    success: true,
    data: { url: imageUrl, deleteUrl: result.data?.delete_url },
  });
}
