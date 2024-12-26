import { useVideoScanner } from "@/hooks/use-video-scanner";
import QrScanner from "qr-scanner";
import { useRef } from "react";
import { motion } from "motion/react";
import { AnimationPresets } from "@/common/configs/motion-props";
import { CrossIcon } from "lucide-react";

export type CameraScanProps = {
  onBack: VoidFunction;
  setResult: (result: string) => void;
  onError: (error: string) => void;
};

export const CameraScan: React.FC<CameraScanProps> = ({
  onBack,
  onError,
  setResult,
}) => {
  const onDecode = (result: string) => {
    console.log("result", result);
    return setResult(result);
  };

  const onDecodeError = (error: string | Error) => {
    const err = error.toString();

    if (err === QrScanner.NO_QR_CODE_FOUND) return;
    if (err === "Scanner error: No QR code found") return;

    onError(error.toString());
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useVideoScanner(videoRef, onDecode, onDecodeError);

  return (
    <div className="container">
      <h1>Searching...</h1>
      <video ref={videoRef} />
      <section role="button-container">
        <motion.button
          role="back"
          onClick={onBack}
          {...AnimationPresets.standard}
        >
          <CrossIcon />
        </motion.button>
      </section>
    </div>
  );
};
