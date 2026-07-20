export async function compressImage(
  file,
  { maxSize = 1200, quality = 0.7 } = {}
) {
  const img = await createImageBitmap(file);

  let { width, height } = img;
  const scale = Math.min(1, maxSize / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality)
  );

  return new File([blob], "photo.webp", { type: "image/webp" });
}
