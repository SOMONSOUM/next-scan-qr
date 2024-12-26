"use client";

import { useQRScannerStore } from "@/stores/qr-scanner";
import { CameraScan } from "./ui/camera-scan";

export const ScanScreen = () => {
  const { cancel, error, success } = useQRScannerStore();
  return (
    <CameraScan
      onBack={cancel}
      onError={(err) => error(err)}
      setResult={(result) => success(result)}
    />
  );
};
