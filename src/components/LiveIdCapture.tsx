import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw } from "lucide-react";

/**
 * Takes a live photo with the device camera (no file picker), so an old or
 * downloaded picture can't be used. The person holds their ID next to their face;
 * an admin compares it with the uploaded ID.
 */
export function LiveIdCapture({ onCapture, disabled }: { onCapture: (photo: Blob) => void; disabled?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<"idle" | "live" | "taken" | "error">("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  useEffect(() => () => {
    stop();
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("live");
    } catch {
      setState("error");
      setError("We couldn't open your camera. Allow camera access in your browser settings, or use a phone with a camera.");
    }
  }

  function take() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      stop();
      setPreview(URL.createObjectURL(blob));
      setState("taken");
      onCapture(blob);
    }, "image/jpeg", 0.9);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Hold your government ID next to your face, in good light, with the ID's photo and name readable.</p>
      <div className="overflow-hidden rounded-2xl bg-muted">
        {state === "taken" && preview ? (
          <img src={preview} alt="Your live photo with ID" className="aspect-video w-full object-cover" />
        ) : (
          <video ref={videoRef} playsInline muted className={`aspect-video w-full object-cover ${state === "live" ? "" : "hidden"}`} />
        )}
        {(state === "idle" || state === "error") && (
          <div className="grid aspect-video place-items-center text-sm text-muted-foreground"><Camera className="h-10 w-10" /></div>
        )}
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {state !== "live" && (
          <button type="button" disabled={disabled} onClick={start} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {state === "taken" ? <RotateCcw className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {state === "taken" ? "Retake" : "Open camera"}
          </button>
        )}
        {state === "live" && (
          <button type="button" onClick={take} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            <Camera className="h-4 w-4" />Take photo
          </button>
        )}
      </div>
    </div>
  );
}
