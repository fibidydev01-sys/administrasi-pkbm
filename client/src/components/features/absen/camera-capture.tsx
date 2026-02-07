"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, RefreshCw, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/utils";

interface CameraCaptureProps {
  onCapture: (blob: Blob, previewUrl: string) => void;
  onClear: () => void;
  previewUrl: string | null;
  disabled?: boolean;
  className?: string;
}

type CameraState = "idle" | "starting" | "streaming" | "error";

export function CameraCapture({
  onCapture,
  onClear,
  previewUrl,
  disabled = false,
  className,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [error, setError] = useState<string | null>(null);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (cameraState === "starting") {
      return;
    }

    setCameraState("starting");
    setError(null);
    cleanupStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser tidak mendukung akses kamera");
      }

      // ✅ ONLY FRONT CAMERA
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "user", // ✅ Front camera only
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;

          const timeoutId = setTimeout(() => {
            resolve();
          }, 5000);

          const onCanPlay = () => {
            clearTimeout(timeoutId);
            video.removeEventListener("canplay", onCanPlay);
            video.removeEventListener("error", onError);
            resolve();
          };

          const onError = (e: Event) => {
            clearTimeout(timeoutId);
            video.removeEventListener("canplay", onCanPlay);
            video.removeEventListener("error", onError);
            reject(new Error("Video playback error"));
          };

          video.addEventListener("canplay", onCanPlay);
          video.addEventListener("error", onError);

          video.play().catch(() => { });
        });

        setCameraState("streaming");
      } else {
        throw new Error("Video element tidak ditemukan");
      }
    } catch (err) {
      cleanupStream();

      let errorMessage = "Tidak dapat mengakses kamera.";

      if (err instanceof Error) {
        const errorName = err.name || "";
        const errorMsg = err.message || "";

        if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
          errorMessage = "Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser.";
        } else if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
          errorMessage = "Kamera tidak ditemukan.";
        } else if (errorName === "NotReadableError" || errorName === "TrackStartError") {
          errorMessage = "Kamera sedang digunakan aplikasi lain.";
        } else if (errorName === "OverconstrainedError") {
          try {
            const simpleStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
            streamRef.current = simpleStream;
            if (videoRef.current) {
              videoRef.current.srcObject = simpleStream;
              await videoRef.current.play();
              setCameraState("streaming");
              return;
            }
          } catch (fallbackErr) {
            errorMessage = "Kamera tidak kompatibel dengan pengaturan yang diminta.";
          }
        } else if (errorMsg.includes("Permission")) {
          errorMessage = "Izin kamera ditolak.";
        } else {
          errorMessage = `Error: ${errorMsg}`;
        }
      }

      setError(errorMessage);
      setCameraState("error");
    }
  }, [cameraState, cleanupStream]);

  const stopCamera = useCallback(() => {
    cleanupStream();
    setCameraState("idle");
    setError(null);
  }, [cleanupStream]);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // ✅ Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // ✅ Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ✅ Save context state
    ctx.save();

    // ✅ Mirror for front camera (flip back to normal)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // ✅ Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // ✅ Restore context state
    ctx.restore();

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          return;
        }

        try {
          // ✅ Better compression settings
          const compressed = await compressImage(blob, 1200, 0.85);
          const url = URL.createObjectURL(compressed);
          stopCamera();
          onCapture(compressed, url);
        } catch (compressErr) {
          const url = URL.createObjectURL(blob);
          stopCamera();
          onCapture(blob, url);
        }
      },
      "image/jpeg",
      0.92
    );
  }, [stopCamera, onCapture]);

  const retake = useCallback(() => {
    onClear();
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [onClear, startCamera]);

  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [cleanupStream]);

  // ============================================
  // PREVIEW MODE
  // ============================================
  if (previewUrl) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="relative aspect-[4/3]">
          <img
            src={previewUrl}
            alt="Preview foto"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={retake}
              disabled={disabled}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Ulangi
            </Button>
            <Button
              type="button"
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              disabled={disabled}
            >
              <Check className="mr-2 h-4 w-4" />
              OK
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // ============================================
  // IDLE STATE
  // ============================================
  if (cameraState === "idle") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="flex aspect-[4/3] flex-col items-center justify-center bg-muted p-4">
          <Camera className="mb-2 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-sm text-muted-foreground text-center">
            Ambil foto selfie untuk absensi
          </p>
          <Button onClick={startCamera} disabled={disabled}>
            <Camera className="mr-2 h-4 w-4" />
            Buka Kamera
          </Button>
        </div>
      </Card>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (cameraState === "error") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="flex aspect-[4/3] flex-col items-center justify-center bg-muted p-4">
          <X className="mb-2 h-12 w-12 text-destructive" />
          <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          <Button onClick={startCamera} disabled={disabled}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </Card>
    );
  }

  // ============================================
  // STARTING STATE
  // ============================================
  if (cameraState === "starting") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="relative aspect-[4/3] bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover opacity-0"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
            <p className="text-sm text-white">Membuka kamera...</p>
          </div>
        </div>
      </Card>
    );
  }

  // ============================================
  // STREAMING STATE (CAMERA ACTIVE)
  // ============================================
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="relative aspect-[4/3] bg-black">
        {/* ✅ Video Preview - Mirror for front camera */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover scale-x-[-1]"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* ✅ Camera Badge */}
        <div className="absolute top-3 left-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          📷 Kamera Depan
        </div>

        {/* ✅ CONTROL BUTTONS - SIMPLIFIED */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-4 items-center">
          {/* ✅ Capture Button - SMALLER SIZE */}
          <button
            type="button"
            onClick={capturePhoto}
            className="relative h-16 w-16 rounded-full bg-white/30 backdrop-blur-sm border-4 border-white shadow-2xl transition-transform active:scale-95 hover:bg-white/40"
            title="Ambil Foto"
          >
            <div className="absolute inset-2 rounded-full bg-white" />
          </button>

          {/* ✅ Close Button - TEXT */}
          <button
            type="button"
            onClick={stopCamera}
            className="px-4 py-2 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white text-sm font-medium transition-all active:scale-95"
            title="Tutup"
          >
            Tutup
          </button>
        </div>
      </div>
    </Card>
  );
}