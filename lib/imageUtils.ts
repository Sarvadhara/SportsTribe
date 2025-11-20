/**
 * Utility functions for handling image uploads
 */

/**
 * Convert a file to base64 data URL
 * @param file - The image file to convert
 * @returns Promise that resolves to base64 data URL string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress a base64 data URL by resizing it within a max width/height and reducing quality.
 * Falls back to the original base64 string if compression is not possible.
 */
export function compressBase64Image(
  base64: string,
  mimeType: string,
  {
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.72,
  }: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(base64);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

      if (ratio < 1) {
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(base64);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const outputMime =
        mimeType === "image/png" || mimeType === "image/webp"
          ? mimeType
          : "image/jpeg";

      try {
        const compressed = canvas.toDataURL(
          outputMime,
          outputMime === "image/jpeg" ? quality : undefined
        );
        resolve(compressed);
      } catch (error) {
        console.warn("Failed to compress image, using original data URL:", error);
        resolve(base64);
      }
    };

    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

/**
 * Validate image file
 * @param file - The file to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image size must be less than 5MB'
    };
  }

  return { isValid: true };
}

/**
 * Handle image file change and convert to base64
 * @param event - File input change event
 * @param onSuccess - Callback with base64 string
 * @param onError - Optional error callback
 */
export function handleImageUpload(
  event: React.ChangeEvent<HTMLInputElement>,
  onSuccess: (base64: string) => void,
  onError?: (error: string) => void
): void {
  const file = event.target.files?.[0];
  if (!file) {
    if (onError) onError('No file selected');
    return;
  }

  const validation = validateImageFile(file);
  if (!validation.isValid) {
    if (onError) onError(validation.error || 'Invalid file');
    return;
  }

  fileToBase64(file)
    .then(async (base64) => {
      try {
        const compressed = await compressBase64Image(base64, file.type);
        onSuccess(compressed);
      } catch (error: any) {
        console.warn("Image compression failed, using original image.", error);
        onSuccess(base64);
      }
    })
    .catch((error) => {
      if (onError) onError(error.message || 'Failed to process image');
    });
}
