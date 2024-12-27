import { RefObject, useEffect, useRef, useState, useCallback } from "react";
import QrScanner from "qr-scanner";
import { toast } from "sonner";

interface UseQRScannerProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  onDecode: (result: string) => void;
  onDecodeError?: (error: string | Error) => void;
  overlay?: HTMLDivElement,
  calculateScanRegion?: (video: HTMLVideoElement) => QrScanner.ScanRegion;
  preferredCamera?: string;
}

export const useQRScanner = ({ videoRef, onDecode, onDecodeError, overlay, calculateScanRegion, preferredCamera }: UseQRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    const initializeScanner = async () => {
      if (videoRef.current) {
        const hasCameraResult = await QrScanner.hasCamera();
        setHasCamera(hasCameraResult);

        if (!hasCameraResult) {
          toast.error("មិនមានសម្ភារៈកាមេរ៉ាទេ!", {
            duration: 3000,
            position: "top-right",
            style: {
              fontFamily: "Koh Santepheap",
              fontSize: "11pt"
            }
          });
          return;
        }
        const scanner = new QrScanner(
          videoRef.current,
          (result) => onDecode(result.data),
          {
            onDecodeError,
            returnDetailedScanResult: true,
            highlightScanRegion: false,
            highlightCodeOutline: false,
            overlay,
            calculateScanRegion,
            preferredCamera
          }
        );
        scannerRef.current = scanner;
        await scanner.start();
      }
    };

    initializeScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [videoRef, onDecode, onDecodeError]);

  const toggleFlashlight = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.toggleFlash();
      setFlashlightOn((prev) => !prev);
    } catch (error) {
      console.error("Flashlight error:", error);
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      setIsScanning(false);
      setFlashlightOn(false);
    }
  }, []);

  const startScanner = useCallback(() => {
    if (scannerRef.current && !isScanning) {
      scannerRef.current.start();
      setIsScanning(true);
    }
  }, [isScanning]);

  return {
    isScanning,
    flashlightOn,
    hasCamera,
    toggleFlashlight,
    stopScanner,
    startScanner,
  };
};

