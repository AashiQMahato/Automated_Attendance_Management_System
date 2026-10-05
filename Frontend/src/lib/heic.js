// HEIC/HEIF (default iPhone photo format) helpers. Most browsers other than
// Safari can't display HEIC, so photos are converted to JPEG in the browser
// before preview/upload. The converter (~1 MB) is loaded only when needed.

const HEIC_TYPES = ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"];

export const isHeic = (file) => !!file && (HEIC_TYPES.includes(file.type) || /\.(heic|heif)$/i.test(file.name || ""));

// Browsers often report HEIC with an empty MIME type, so accept it by name.
export const isImageFile = (file) => !!file && (file.type.startsWith("image/") || isHeic(file));

export const heicToJpeg = async (file, quality = 0.9) => {
  const { default: heic2any } = await import("heic2any");
  const output = await heic2any({ blob: file, toType: "image/jpeg", quality });
  const blob = Array.isArray(output) ? output[0] : output; // multi-image HEIC → first frame
  const name = (file.name || "photo").replace(/\.(heic|heif)$/i, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
};
