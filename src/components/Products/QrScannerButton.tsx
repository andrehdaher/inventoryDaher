import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { toast } from "sonner";

type BarcodeDetectorResult = { rawValue?: string };
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

interface QrScannerButtonProps {
  onScan: (code: string) => boolean | void | Promise<boolean | void>;
  label?: string;
  className?: string;
}

export default function QrScannerButton({
  onScan,
  label = "مسح QR",
  className,
}: QrScannerButtonProps) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const scanTimeoutRef = useRef<number>();
  const onScanRef = useRef(onScan);
  const scannerActiveRef = useRef(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScanner = () => {
    scannerActiveRef.current = false;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (scanTimeoutRef.current) {
      window.clearTimeout(scanTimeoutRef.current);
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  const handleScannedCode = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return true;

    const shouldContinue = await onScanRef.current(code);
    if (shouldContinue === false) {
      setScannerOpen(false);
      stopScanner();
      return false;
    }

    return true;
  };

  const startScanner = async () => {
    setScannerError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("الكاميرا غير مدعومة في هذا المتصفح");
      return;
    }

    if (!window.BarcodeDetector) {
      toast.error("مسح QR غير مدعوم في هذا المتصفح");
      return;
    }

    try {
      setScannerOpen(true);
      setIsScanning(true);
      scannerActiveRef.current = true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
        },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      await video.play();

      const detector = new window.BarcodeDetector({
        formats: [
          "qr_code",
          "ean_13",
          "ean_8",
          "upc_a",
          "upc_e",
          "code_128",
          "code_39",
          "code_93",
          "itf",
          "codabar",
          "data_matrix",
          "pdf417",
        ],
      });

      const scan = async () => {
        if (!scannerActiveRef.current) return;

        try {
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            const results = await detector.detect(video);
            const rawValue = results[0]?.rawValue?.trim();

            if (rawValue) {
              const shouldContinue = await handleScannedCode(rawValue);
              if (!shouldContinue) return;

              scanTimeoutRef.current = window.setTimeout(() => {
                if (scannerActiveRef.current) {
                  animationRef.current = requestAnimationFrame(scan);
                }
              }, 1200);
              return;
            }
          }
        } catch (error) {
          console.error("QR scan failed:", error);
        }

        animationRef.current = requestAnimationFrame(scan);
      };

      animationRef.current = requestAnimationFrame(scan);
    } catch (error) {
      console.error("Camera access failed:", error);
      setScannerError("تعذر تشغيل الكاميرا. تأكد من السماح للمتصفح باستخدامها.");
      toast.error("تعذر تشغيل الكاميرا");
      stopScanner();
    }
  };

  useEffect(() => stopScanner, []);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={startScanner}
        className={className}
      >
        <Camera className="h-4 w-4" />
        <span>{label}</span>
      </Button>

      <Dialog
        open={scannerOpen}
        onOpenChange={(open) => {
          setScannerOpen(open);
          if (!open) stopScanner();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>مسح رمز QR</DialogTitle>
            <DialogDescription>
              وجه كاميرا الهاتف نحو رمز المنتج لإضافته إلى الفاتورة.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-md border bg-black">
            <video
              ref={videoRef}
              className="aspect-square w-full object-cover"
              muted
              playsInline
            />
          </div>
          {isScanning && (
            <p className="text-center text-sm text-muted-foreground">
              جاري البحث عن الرمز...
            </p>
          )}
          {scannerError && (
            <p className="text-center text-sm text-destructive">{scannerError}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
