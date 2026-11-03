import { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  HelpCircle,
  ImagePlus,
  Loader2,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  SwitchCamera,
  Upload,
  UserX,
  X,
} from "lucide-react";
import api from "../../../lib/api";
import { heicToJpeg, isHeic, isImageFile } from "../../../lib/heic";
import { AUTO_MARK_CONFIDENCE, summarizeRecognition } from "../../../lib/attendance";
import { colors as palette } from "../../ui/colors";
import Button from "../../ui/Button";
import { Card, CardHeader } from "../../ui/Card";
import { ProgressBar } from "../../ui/Progress";

const MAX_BYTES = 10 * 1024 * 1024; // matches the backend limit
const hasLiveCamera = () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

/* ---------------------------------------------------------------------------
   Camera capture. Uses a live viewfinder (getUserMedia) where the browser
   allows it; otherwise, or if permission is refused, falls back to the
   native camera picker (the original behaviour, best on phones).
--------------------------------------------------------------------------- */
const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [facing, setFacing] = useState("environment");
  const [state, setState] = useState(hasLiveCamera() ? "starting" : "fallback"); // starting | live | fallback

  useEffect(() => {
    if (!hasLiveCamera()) return undefined;
    let cancelled = false;
    setState("starting");
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setState("live");
      })
      .catch(() => !cancelled && setState("fallback"));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const snap = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => blob && onCapture(new File([blob], `class-photo-${Date.now()}.jpg`, { type: "image/jpeg", lastModified: Date.now() })),
      "image/jpeg",
      0.92,
    );
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (isImageFile(file)) onCapture(file);
    else if (file) message.error("Please capture an image file.");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgb(10_15_28/0.55)] p-3 backdrop-blur-md sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Capture class photo"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="glass-pop relative w-full max-w-2xl overflow-hidden rounded-[28px]"
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98, y: 6 }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">Capture the class</h2>
            <p className="text-[13px] text-ink-3">Keep faces well lit and turned toward the camera.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close camera"
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink/[0.06] text-ink-2 hover:bg-ink/[0.1] dark:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {state === "fallback" ? (
          <div className="px-5 pb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Camera className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mx-auto mt-3 max-w-sm text-sm text-ink-2">
              {hasLiveCamera()
                ? "Camera access wasn't allowed here. You can still take a photo with your device's camera app."
                : "Open your device camera to take the class photo."}
            </p>
            <Button variant="primary" size="lg" icon={Camera} className="mt-5 w-full sm:w-auto" onClick={() => fileInputRef.current.click()}>
              Open camera
            </Button>
          </div>
        ) : (
          <div className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-black sm:aspect-video">
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" aria-label="Camera preview" />
              {state === "starting" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80" role="status">
                  <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                  <span className="text-sm">Starting camera…</span>
                </div>
              )}
              {/* Framing guide */}
              <div className="pointer-events-none absolute inset-6 rounded-2xl border border-white/30" aria-hidden="true" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <Button variant="ghost" icon={Upload} onClick={() => fileInputRef.current.click()}>
                <span className="hidden sm:inline">Use camera app</span>
                <span className="sm:hidden">Camera app</span>
              </Button>
              <button
                type="button"
                onClick={snap}
                disabled={state !== "live"}
                aria-label="Take photo"
                className="focus-ring group relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_-8px_rgb(0_0_0/0.5)] ring-4 ring-brand/30 transition-transform active:scale-90 disabled:opacity-50"
              >
                <span className="h-12 w-12 rounded-full bg-brand-gradient transition-transform group-hover:scale-95" />
              </button>
              <Button variant="ghost" icon={SwitchCamera} onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}>
                Flip
              </Button>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif" capture="environment" className="hidden" onChange={handleFileChange} />
      </motion.div>
    </motion.div>
  );
};

/* Face thumbnail cropped from the preview with CSS (no canvas, no re-decode). */
const FaceCrop = ({ src, bbox, natural, size = 40, className = "" }) => {
  if (!src || !bbox || !natural?.w) {
    return (
      <span className={`flex shrink-0 items-center justify-center rounded-xl bg-ink/[0.06] text-ink-3 ${className}`} style={{ width: size, height: size }}>
        <ScanFace className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }
  const [x1, y1, x2, y2] = bbox;
  const side = Math.max(x2 - x1, y2 - y1) * 1.3;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const scale = size / side;
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 rounded-xl bg-no-repeat ring-1 ring-black/5 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${src})`,
        backgroundSize: `${natural.w * scale}px ${natural.h * scale}px`,
        backgroundPosition: `${-(cx - side / 2) * scale}px ${-(cy - side / 2) * scale}px`,
      }}
    />
  );
};

const confidenceTone = (c) => (c >= AUTO_MARK_CONFIDENCE ? "present" : "low");

const Metric = ({ icon: Icon, label, value, tone }) => (
  <div className="min-w-0 rounded-2xl px-3 py-2.5">
    <dt className="flex items-center gap-1.5 text-[11px] font-medium text-ink-3">
      <Icon className={`h-3.5 w-3.5 ${tone}`} aria-hidden="true" />
      <span className="truncate">{label}</span>
    </dt>
    <dd className="mt-0.5 text-lg font-semibold tabular-nums tracking-[-0.02em] text-ink">{value}</dd>
  </div>
);

const FaceRow = ({ face, src, natural, note }) => (
  <li className="flex items-center gap-3 px-4 py-2.5">
    <FaceCrop src={src} bbox={face.bbox} natural={natural} size={36} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-[13px] font-medium text-ink">{face.name}</p>
      {note && <p className="truncate text-[11px] text-ink-3">{note}</p>}
    </div>
    <div className="w-16 sm:w-20">
      <ProgressBar value={face.confidence * 100} tone={confidenceTone(face.confidence)} label={`${face.name} match confidence`} />
    </div>
    <span className="w-9 text-right text-xs font-medium tabular-nums text-ink-2">{Math.round(face.confidence * 100)}%</span>
  </li>
);

/* ---------------------------------------------------------------------------
   Photo recognition workspace. Request format and the store hand-off are the
   same as before: POST /attendance/recognize (multipart "file"), then
   addAttendanceRecord(results, subjects, cloudinary_url) so the roster can
   pre-mark confident matches. Nothing is saved here.
--------------------------------------------------------------------------- */
const ImageUploadForAttendance = ({ subjects, addAttendanceRecord, roster = [], onResults }) => {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [natural, setNatural] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [converting, setConverting] = useState(false);
  const inputRef = useRef(null);

  // Free the object URL when it's replaced or the panel unmounts.
  useEffect(
    () => () => {
      if (imagePreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(imagePreviewUrl);
    },
    [imagePreviewUrl],
  );

  useEffect(() => {
    if (!loading) return undefined;
    setElapsed(0);
    const t = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [loading]);

  const handleFile = async (picked) => {
    if (!picked) return;
    if (!isImageFile(picked)) {
      message.error("Please upload a JPG, PNG or HEIC photo");
      return;
    }
    setResults(null);
    setError(null);
    setNatural(null);
    onResults?.(null);

    let file = picked;
    let previewable = true;
    if (isHeic(picked)) {
      // Convert iPhone HEIC photos to JPEG, then continue as usual.
      setConverting(true);
      setImagePreviewUrl(null);
      try {
        file = await heicToJpeg(picked);
        message.success("HEIC photo converted to JPG");
      } catch (err) {
        // The server can still convert it; we just can't preview it here.
        console.warn("HEIC conversion failed, uploading original", err);
        previewable = false;
      } finally {
        setConverting(false);
      }
    }

    if (file.size > MAX_BYTES) {
      message.error("Image size should not exceed 10MB");
      return;
    }
    setImage(file);
    setImagePreviewUrl(previewable ? URL.createObjectURL(file) : "heic-no-preview");
  };

  const clearImage = () => {
    setImagePreviewUrl(null);
    setImage(null);
    setResults(null);
    setError(null);
    setNatural(null);
    onResults?.(null);
  };

  const handleUpload = async () => {
    if (!image) {
      message.warning("Please select an image first");
      return;
    }
    setLoading(true);
    setUploadPct(0);
    setError(null);
    const messageKey = "uploadMessage";

    try {
      const formData = new FormData();
      formData.append("file", image);
      // The backend forwards the photo to its face service (teachers only).
      const response = await api.post("/attendance/recognize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 90000,
        onUploadProgress: (e) => e.total && setUploadPct(Math.round((e.loaded / e.total) * 100)),
      });

      if (response.data) {
        const next = { faces_detected: response.data.faces_detected || 0, results: response.data.results || [] };
        setResults(next);
        onResults?.(next);
        // Apply matches to the roster even when the photo couldn't be archived.
        if (response.data.results?.length) {
          addAttendanceRecord(response.data.results, subjects, response.data.cloudinary_url || null);
        }
        message.success({ content: `Found ${next.faces_detected} ${next.faces_detected === 1 ? "face" : "faces"}`, key: messageKey, duration: 3 });
      }
    } catch (err) {
      let errorMessage = "We couldn't process this photo. Try again or mark attendance manually.";
      if (err.code === "ECONNABORTED") errorMessage = "Recognition took too long. Please try again.";
      else if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || "This image format isn't supported.";
            break;
          case 413:
            errorMessage = "This image is too large.";
            break;
          case 503:
            errorMessage = "Face recognition is starting up or not set up on the server. You can still mark attendance manually.";
            break;
          case 504:
            errorMessage = "Recognition took too long. Please try again.";
            break;
          case 500:
          case 502:
            errorMessage = "The recognition service had a problem. Please try again shortly.";
            break;
          default:
            break;
        }
      } else if (err.request) {
        errorMessage = "The recognition service is unreachable. You can still mark attendance manually.";
      }
      setError(errorMessage);
      message.error({ content: errorMessage, key: messageKey, duration: 4 });
    } finally {
      setLoading(false);
    }
  };

  const summary = results ? summarizeRecognition(results.results, roster) : null;
  const canPreview = imagePreviewUrl && imagePreviewUrl !== "heic-no-preview";
  const stage = uploadPct < 100 ? `Uploading photo · ${uploadPct}%` : "Detecting and matching faces";

  return (
    <Card aria-labelledby="recognition" className="overflow-hidden">
      <CardHeader
        id="recognition"
        icon={ScanFace}
        iconTile={palette.violet.tile}
        title="Photo recognition"
        description="Optional. Detect students from a class photo, then review the roster."
        action={
          imagePreviewUrl &&
          !loading && (
            <Button size="sm" variant="ghost" icon={X} onClick={clearImage}>
              Remove
            </Button>
          )
        }
      />
      <div className="space-y-4 p-4 sm:p-5">
        <AnimatePresence>
          {showCamera && (
            <CameraCapture
              onCapture={(file) => {
                setShowCamera(false);
                handleFile(file);
              }}
              onClose={() => setShowCamera(false)}
            />
          )}
        </AnimatePresence>

        {converting ? (
          <div className="glass-well flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-[20px] sm:aspect-video" role="status">
            <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">Converting HEIC to JPG…</p>
            <p className="text-xs text-ink-3">This takes a moment for large iPhone photos.</p>
          </div>
        ) : imagePreviewUrl ? (
          <div className="relative overflow-hidden rounded-[20px] bg-ink/[0.85] ring-1 ring-black/10 dark:bg-black/60">
            {canPreview ? (
              <div className="relative mx-auto w-fit">
                <img
                  src={imagePreviewUrl}
                  alt="Selected class photo"
                  onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                  className="block max-h-[420px] w-auto max-w-full object-contain"
                />
                {/* Detected faces drawn where the service found them. */}
                {results && natural?.w > 0 && (
                  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    {results.results.map((face, i) => {
                      if (!face.bbox) return null;
                      const [x1, y1, x2, y2] = face.bbox;
                      const known = summary.unknown.indexOf(face) === -1;
                      const strong = known && face.confidence >= AUTO_MARK_CONFIDENCE;
                      return (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 1.2 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * i, type: "spring", bounce: 0.3, duration: 0.5 }}
                          className={`absolute rounded-lg border-2 shadow-[0_0_0_1px_rgb(0_0_0/0.25)] ${
                            strong ? "border-[#20B99A]" : known ? "border-[#E9A33B]" : "border-[#E66B7C] border-dashed"
                          }`}
                          style={{
                            left: `${(x1 / natural.w) * 100}%`,
                            top: `${(y1 / natural.h) * 100}%`,
                            width: `${((x2 - x1) / natural.w) * 100}%`,
                            height: `${((y2 - y1) / natural.h) * 100}%`,
                          }}
                        >
                          {known && (
                            <span
                              className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white ${
                                strong ? "bg-[#0E7F68]" : "bg-[#A35F0A]"
                              }`}
                            >
                              {face.name.split(" ")[0]}
                            </span>
                          )}
                        </motion.span>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-1 px-4 text-center text-white">
                <ImagePlus className="h-6 w-6 text-white/70" aria-hidden="true" />
                <p className="text-sm font-medium">{image?.name}</p>
                <p className="text-xs text-white/70">Preview unavailable — it will be converted on the server.</p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 overflow-hidden" role="status" aria-live="polite">
                <div className="absolute inset-0 bg-[rgb(10_15_28/0.35)]" />
                {/* Scanning light */}
                <div className="absolute inset-x-0 top-0 h-[10%] animate-scan-line bg-gradient-to-b from-transparent via-white/35 to-transparent motion-reduce:hidden" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="glass-pop flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">{stage}…</p>
                      <p className="text-[11px] text-ink-3">
                        {elapsed}s · large photos can take up to a minute
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label="Add a class photo: drop an image or press Enter to choose a file"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            className={`focus-ring group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[20px] border-2 border-dashed px-4 py-10 text-center transition-[border-color,background-color,transform] duration-300 ease-apple sm:py-14 ${
              isDragging
                ? "scale-[1.01] border-brand bg-brand/[0.08]"
                : "border-brand/25 bg-gradient-to-b from-brand/[0.05] to-brand-2/[0.03] hover:border-brand/50 hover:from-brand/[0.08]"
            }`}
          >
            <span
              className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-70"
              style={{ background: "radial-gradient(closest-side, rgb(var(--brand) / 0.16), transparent)" }}
              aria-hidden="true"
            />
            <motion.span
              animate={isDragging ? { y: -4, scale: 1.08 } : { y: 0, scale: 1 }}
              className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-surface text-brand shadow-[inset_0_1px_0_0_rgb(var(--glass-edge)/var(--glass-edge-a)),0_12px_28px_-12px_rgb(82_103_232/0.5)] ring-1 ring-black/[0.04] dark:bg-white/10"
            >
              <ImagePlus className="h-7 w-7" aria-hidden="true" />
            </motion.span>
            <p className="relative text-[15px] font-semibold text-ink">{isDragging ? "Drop to add the photo" : "Drop a class photo here"}</p>
            <p className="relative mt-1 text-[13px] text-ink-3">or click to browse · JPG, PNG or HEIC up to 10MB</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {imagePreviewUrl ? (
            <Button icon={RefreshCw} onClick={() => inputRef.current?.click()} disabled={loading}>
              Replace
            </Button>
          ) : (
            <Button icon={ImagePlus} onClick={() => inputRef.current?.click()}>
              Choose photo
            </Button>
          )}
          {imagePreviewUrl ? (
            <Button variant="primary" icon={ScanFace} onClick={handleUpload} loading={loading} disabled={!image}>
              {results ? "Run again" : "Recognize faces"}
            </Button>
          ) : (
            <Button icon={Camera} onClick={() => setShowCamera(true)}>
              Use camera
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          id="image-upload"
          type="file"
          accept="image/*,.heic,.heif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            handleFile(e.target.files[0]);
            e.target.value = "";
          }}
          disabled={loading}
        />

        {error && (
          <div role="alert" className="flex gap-3 rounded-2xl bg-danger/[0.08] px-4 py-3 ring-1 ring-inset ring-danger/15">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-danger">{error}</p>
              <p className="mt-0.5 text-xs text-ink-3">The roster works without recognition — mark students present with the switches.</p>
            </div>
          </div>
        )}

        {results && summary && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-start gap-2.5 rounded-2xl bg-brand/[0.07] px-3.5 py-2.5 ring-1 ring-inset ring-brand/15">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <p className="text-[12.5px] leading-5 text-ink-2">
                <span className="font-semibold text-ink">Suggestions only.</span> Matches of {Math.round(AUTO_MARK_CONFIDENCE * 100)}% or more are
                pre-marked present. Nothing is saved until you review the roster and press Save.
              </p>
            </div>

            <dl className="glass-well grid grid-cols-2 gap-px overflow-hidden rounded-2xl sm:grid-cols-4">
              <Metric icon={ScanFace} label="Faces" value={results.faces_detected} tone="text-brand" />
              <Metric icon={CheckCircle2} label="Pre-marked" value={summary.confident.length} tone="text-success" />
              <Metric icon={HelpCircle} label="To review" value={summary.review.length} tone="text-warning" />
              <Metric icon={UserX} label="Unknown" value={summary.unknown.length} tone="text-danger" />
            </dl>

            {results.faces_detected === 0 && (
              <p className="rounded-2xl bg-warning/10 px-3.5 py-2.5 text-[13px] text-warning">
                No faces were detected. Try a sharper, closer photo, or mark attendance manually.
              </p>
            )}

            {summary.confident.length + summary.review.length > 0 && (
              <section className="glass-well overflow-hidden rounded-2xl" aria-label="Recognized students">
                <p className="border-b border-line/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">Recognized</p>
                <ul className="max-h-60 divide-y divide-line/60 overflow-y-auto scrollbar-thin">
                  {[...summary.confident, ...summary.review]
                    .sort((a, b) => b.confidence - a.confidence)
                    .map((face, i) => (
                      <FaceRow
                        key={`${face.name}-${i}`}
                        face={face}
                        src={canPreview ? imagePreviewUrl : null}
                        natural={natural}
                        note={face.confidence >= AUTO_MARK_CONFIDENCE ? "Pre-marked present" : "Low confidence · confirm on the roster"}
                      />
                    ))}
                </ul>
              </section>
            )}

            {summary.offRoster.length > 0 && (
              <section className="rounded-2xl bg-warning/[0.08] px-4 py-3 ring-1 ring-inset ring-warning/15" aria-label="Matches not on this roster">
                <p className="text-[13px] font-medium text-ink">Not on this roster</p>
                <p className="mt-0.5 text-xs text-ink-3">{summary.offRoster.map((f) => f.name).join(", ")} — recognized, but not enrolled here.</p>
              </section>
            )}

            {summary.unknown.length > 0 && (
              <section className="rounded-2xl bg-danger/[0.06] px-4 py-3 ring-1 ring-inset ring-danger/15" aria-label="Unrecognized faces">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-medium text-ink">
                    {summary.unknown.length} unrecognized {summary.unknown.length === 1 ? "face" : "faces"}
                  </p>
                  <span className="text-xs text-ink-3">Mark these students manually</span>
                </div>
                {canPreview && natural && summary.unknown.some((f) => f.bbox) && (
                  <ul className="mt-2.5 flex flex-wrap gap-2">
                    {summary.unknown.map((face, i) => (
                      <li key={i}>
                        <FaceCrop src={imagePreviewUrl} bbox={face.bbox} natural={natural} size={44} className="ring-2 ring-danger/30" />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default ImageUploadForAttendance;
