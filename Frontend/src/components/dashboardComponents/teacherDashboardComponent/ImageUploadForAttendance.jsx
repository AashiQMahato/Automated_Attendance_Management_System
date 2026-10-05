import React, { useRef, useState } from "react";
import { colors as palette } from "../../ui/colors";
import { message } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImagePlus, ScanFace, Sparkles, X } from "lucide-react";
import api from "../../../lib/api";
import Button from "../../ui/Button";
import { Card, CardHeader } from "../../ui/Card";
import { ProgressBar } from "../../ui/Progress";
import StatusBadge from "../../ui/StatusBadge";

// Opens the device camera through the native file picker (works on phones).
const CameraCapture = ({ onCapture, onClose }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) onCapture(file);
    else message.error("Please capture an image file.");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Capture class photo"
    >
      <motion.div
        className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-pop"
        initial={{ scale: 0.97, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98, y: 4 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-ring absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-2"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Camera className="h-5 w-5" />
        </div>
        <h2 className="text-[17px] font-semibold text-ink">Capture the class</h2>
        <p className="mt-1 text-sm text-ink-2">Make sure faces are well lit and facing the camera.</p>
        <Button variant="primary" size="lg" icon={Camera} className="mt-6 w-full" onClick={() => fileInputRef.current.click()}>
          Open camera
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </motion.div>
    </motion.div>
  );
};

const ImageUploadForAttendance = ({ subjects, addAttendanceRecord }) => {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      message.error("Image size should not exceed 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      message.error("Please upload an image file");
      return;
    }
    setImage(file);
    setResults(null);
    setError(null);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImagePreviewUrl(null);
    setImage(null);
    setResults(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!image) {
      message.warning("Please select an image first");
      return;
    }
    setLoading(true);
    setError(null);
    const messageKey = "uploadMessage";
    message.loading({ content: "Recognizing faces…", key: messageKey });

    try {
      const formData = new FormData();
      formData.append("file", image);
      // The backend forwards the photo to its face service (teachers only).
      const response = await api.post("/attendance/recognize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 90000,
      });

      if (response.data) {
        setResults({ faces_detected: response.data.faces_detected || 0, results: response.data.results || [] });
        // Apply matches to the roster even when the photo couldn't be archived.
        if (response.data.results?.length) {
          addAttendanceRecord(response.data.results, subjects, response.data.cloudinary_url || null);
        }
        message.success({ content: `Found ${response.data.faces_detected || 0} faces`, key: messageKey, duration: 3 });
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

  return (
    <Card aria-labelledby="recognition">
      <CardHeader
        id="recognition"
        icon={ScanFace}
        iconTile={palette.violet.tile}
        title="Photo recognition"
        description="Detect students from a class photo, then review below."
      />
      <div className="space-y-4 p-5">
        <AnimatePresence>
          {showCamera && (
            <CameraCapture
              onCapture={(file) => {
                handleFile(file);
                setShowCamera(false);
              }}
              onClose={() => setShowCamera(false)}
            />
          )}
        </AnimatePresence>

        {imagePreviewUrl ? (
          <div className="relative overflow-hidden rounded-lg border border-line bg-surface-2">
            <img src={imagePreviewUrl} alt="Selected class photo" className="aspect-video w-full object-contain" />
            {!loading && (
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove photo"
                className="focus-ring absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur hover:bg-slate-950/75"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface/60 backdrop-blur-[2px]">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[13px] font-medium text-ink shadow-pop">
                  <Sparkles className="h-4 w-4 animate-pulse text-brand" /> Recognizing…
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
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
            className={`flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center transition-colors ${
              isDragging
                ? "border-brand bg-brand/5"
                : "border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-transparent hover:border-brand/50 dark:border-indigo-500/30 dark:from-indigo-500/10"
            }`}
          >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand shadow-card dark:bg-surface-2">
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-ink">Drop a class photo here</p>
            <p className="mt-0.5 text-xs text-ink-3">JPG, PNG or HEIC · up to 5MB</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {imagePreviewUrl ? (
            <Button icon={ImagePlus} onClick={() => inputRef.current?.click()} disabled={loading}>
              Replace
            </Button>
          ) : (
            <Button icon={ImagePlus} onClick={() => inputRef.current?.click()}>
              Choose photo
            </Button>
          )}
          {imagePreviewUrl ? (
            <Button variant="primary" icon={ScanFace} onClick={handleUpload} loading={loading} disabled={!image}>
              Recognize
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
          accept="image/*"
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
          <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}

        {results && (
          <div className="rounded-lg border border-line">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <p className="text-[13px] font-medium text-ink">Recognized</p>
              <StatusBadge tone="info">{results.faces_detected} faces</StatusBadge>
            </div>
            {results.results.length === 0 ? (
              <p className="px-4 py-4 text-[13px] text-ink-3">No known students were recognized in this photo.</p>
            ) : (
              <ul className="max-h-56 divide-y divide-line overflow-y-auto scrollbar-thin">
                {results.results.map((face, index) => (
                  <li key={index} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{face.name}</span>
                    <div className="w-20">
                      <ProgressBar
                        value={face.confidence * 100}
                        tone={face.confidence >= 0.7 ? "success" : "warning"}
                        label={`${face.name} confidence`}
                      />
                    </div>
                    <span className="w-10 text-right text-xs tabular-nums text-ink-3">{(face.confidence * 100).toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageUploadForAttendance;
