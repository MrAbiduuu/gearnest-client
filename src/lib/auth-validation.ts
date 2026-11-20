export function getEmailError(email: string): string | null {
  const value = email.trim();

  if (!value) {
    return "Email is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter a valid email address.";
  }

  return null;
}

export function getPasswordError(password: string): string | null {
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter.";
  }

  return null;
}

export function getPhotoUrlError(photoUrl: string): string | null {
  const value = photoUrl.trim();

  if (!value) {
    return "Add a direct image link or upload your photo.";
  }

  try {
    const parsedUrl = new URL(value);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return "Photo link must start with http:// or https://.";
    }
  } catch {
    return "Enter a valid direct image link.";
  }

  return null;
}
