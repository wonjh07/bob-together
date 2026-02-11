const DEFAULT_MAX_BYTES = 200 * 1024; // 200KB
const DEFAULT_MAX_WIDTH = 1600;
const DEFAULT_MAX_HEIGHT = 1600;
const MIN_QUALITY = 0.45;
const QUALITY_STEP = 0.07;
const MAX_RESIZE_ATTEMPTS = 4;
const RESIZE_FACTOR = 0.85;

interface ConvertToJpegOptions {
  maxBytes?: number;
  maxWidth?: number;
  maxHeight?: number;
}

function getResizedDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) {
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(1, widthRatio, heightRatio);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
      img.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((output) => resolve(output), 'image/jpeg', quality);
  });

  if (!blob) {
    throw new Error('JPEG 변환에 실패했습니다.');
  }

  return blob;
}

export async function convertToJpegUnderLimit(
  file: File,
  options: ConvertToJpegOptions = {},
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다.');
  }

  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT;
  const sourceImage = await loadImageFromFile(file);

  const { width: initialWidth, height: initialHeight } = getResizedDimensions(
    sourceImage.width,
    sourceImage.height,
    maxWidth,
    maxHeight,
  );

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('이미지 변환을 위한 캔버스를 생성할 수 없습니다.');
  }

  let width = initialWidth;
  let height = initialHeight;
  let smallestBlob: Blob | null = null;

  for (let attempt = 0; attempt <= MAX_RESIZE_ATTEMPTS; attempt += 1) {
    canvas.width = width;
    canvas.height = height;

    context.clearRect(0, 0, width, height);
    context.drawImage(sourceImage, 0, 0, width, height);

    for (let quality = 0.92; quality >= MIN_QUALITY; quality -= QUALITY_STEP) {
      const jpegBlob = await canvasToJpegBlob(canvas, quality);

      if (!smallestBlob || jpegBlob.size < smallestBlob.size) {
        smallestBlob = jpegBlob;
      }

      if (jpegBlob.size <= maxBytes) {
        return new File([jpegBlob], 'profile.jpg', { type: 'image/jpeg' });
      }
    }

    width = Math.max(1, Math.round(width * RESIZE_FACTOR));
    height = Math.max(1, Math.round(height * RESIZE_FACTOR));
  }

  if (!smallestBlob) {
    throw new Error('이미지 변환에 실패했습니다.');
  }

  return new File([smallestBlob], 'profile.jpg', { type: 'image/jpeg' });
}
