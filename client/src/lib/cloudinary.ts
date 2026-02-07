import type { CloudinaryUploadResult } from "@/types";

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME tidak diset. Tambahkan di file .env.local"
    );
  }

  if (!uploadPreset) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET tidak diset. Tambahkan di file .env.local"
    );
  }

  return { cloudName, uploadPreset };
}

export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  return !!(cloudName && uploadPreset);
}

export async function uploadToCloudinary(
  file: Blob,
  guruId: string,
  tipe: "masuk" | "pulang"
): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  const timestamp = new Date().toISOString().split("T")[0];
  const timeStr = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
  const randomId = Math.random().toString(36).substring(2, 8);
  const publicId = `absensi/${guruId}/${timestamp}_${tipe}_${timeStr}_${randomId}`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("public_id", publicId);
  formData.append("folder", "absensi");

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid response from Cloudinary: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok || result.error) {
      const errorMessage = result.error?.message || `Upload failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Tidak dapat terhubung ke Cloudinary. Periksa koneksi internet.");
    }

    throw error;
  }
}

interface TransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "thumb" | "limit" | "scale";
  quality?: "auto" | "auto:low" | "auto:good" | "auto:best" | number;
  format?: "auto" | "jpg" | "png" | "webp";
  gravity?: "auto" | "face" | "center";
}

export function getCloudinaryUrl(
  publicId: string,
  options?: TransformOptions
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    return "";
  }

  const transforms: string[] = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);
  if (options?.gravity) transforms.push(`g_${options.gravity}`);
  transforms.push(`q_${options?.quality || "auto"}`);
  transforms.push(`f_${options?.format || "auto"}`);

  const transformString = transforms.join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

export function getThumbnailUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 100,
    height: 100,
    crop: "thumb",
    gravity: "face",
  });
}

export function getPreviewUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 400,
    crop: "limit",
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "Ukuran file maksimal 5MB." };
  }

  return { valid: true };
}