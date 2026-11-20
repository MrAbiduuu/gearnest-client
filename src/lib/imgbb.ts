type ImgBbResponse = {
  success?: boolean;
  data?: {
    display_url?: string;
    url?: string;
  };
  error?: {
    message?: string;
  };
};

export async function uploadImageToImgBb(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ImgBB upload is not configured. Paste a direct image link instead.",
    );
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Photo upload failed. Try another image or use a direct link.");
  }

  const result: ImgBbResponse = await response.json();
  const imageUrl = result.data?.display_url ?? result.data?.url;

  if (!result.success || !imageUrl) {
    throw new Error(
      result.error?.message ?? "Photo upload failed. Please try again.",
    );
  }

  return imageUrl;
}
