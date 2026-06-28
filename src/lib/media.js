// Utilitários de mídia — tudo roda no navegador, sem dependências externas.

// Comprime uma imagem (redimensiona + JPEG) e devolve um data URL leve.
// Assim os prints ficam pequenos (~100-300KB) e nunca estouram o limite do banco.
export function compressImage(file, maxDim = 1280, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("Arquivo não é uma imagem."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width >= height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (e) {
        reject(new Error("Não foi possível processar a imagem."));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível abrir a imagem."));
    };
    img.src = url;
  });
}

// Converte um Blob (áudio gravado) em data URL para salvar junto da ideia.
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(new Error("Não foi possível processar o áudio."));
    fr.readAsDataURL(blob);
  });
}

// Detecta se o navegador permite gravar áudio.
export function canRecordAudio() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined"
  );
}

// Escolhe um formato de áudio suportado pelo navegador (webm no Chrome, mp4 no Safari).
export function pickAudioMime() {
  if (typeof window === "undefined" || !window.MediaRecorder) return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  for (const c of candidates) {
    try {
      if (window.MediaRecorder.isTypeSupported(c)) return c;
    } catch {}
  }
  return "";
}

export function formatSeconds(s) {
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}
