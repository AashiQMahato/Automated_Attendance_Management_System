import React, { useState, useRef } from "react";
import { X, Camera, Upload, RotateCw, CloudUpload } from 'lucide-react';
import axios from "axios";
import { message } from "antd";
import { motion, AnimatePresence } from 'framer-motion';
import useAttendanceStore from "../../../zustand/attendanceStore.js";
import { ReactTyped } from 'react-typed';
import { FACE_RECOGNITION_URL } from "../../../config/env";

const CameraCapture = ({ onCapture, onClose }) => {
    const fileInputRef = useRef(null);
  
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith("image/")) {
        onCapture(file);
      } else {
        message.error("Please capture an image file.");
      }
    };
  
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-full h-[80vh] max-w-2xl flex items-center justify-center">
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed bg-gray-800/50 rounded-xl border-white/20 hover:border-white/40"
          >
            <Camera className="w-12 h-12 mb-4 text-white" />
            <span className="text-lg text-white">Tap to capture image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={onClose}
            className="absolute p-2 rounded-full top-4 right-4 bg-white/20 hover:bg-white/40"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    );
};

const ImageUploadForAttendance = ({ subjects, addAttendanceRecord }) => {
    const [image, setImage] = useState(null);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCameraCapture = (capturedFile) => {
        handleFile(capturedFile);
        setShowCamera(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleFile = (file) => {
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                message.error('Image size should not exceed 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                message.error('Please upload an image file');
                return;
            }

            setImage(file);
            setResults(null);
            setError(null);

            const previewUrl = URL.createObjectURL(file);
            setImagePreviewUrl(previewUrl);
            message.success('Image selected successfully');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    // Modified: We removed the revoking of the URL to ensure the preview remains persistent.
    const handleImageLoad = () => {
        // No longer revoking the object URL so the preview stays visible.
    };

    const handleUpload = async () => {
        if (!image) {
            message.warning('Please select an image first!');
            return;
        }

        setLoading(true);
        setError(null);

        const messageKey = 'uploadMessage';
        message.loading({ content: 'Processing image...', key: messageKey });

        try {
            const formData = new FormData();
            formData.append('file', image);

            const response = await axios.post(
                `${FACE_RECOGNITION_URL}/upload_and_recognize/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json',
                    },
                    timeout: 30000
                }
            );

            if (response.data) {
                setResults({
                    faces_detected: response.data.faces_detected || 0,
                    results: response.data.results || []
                });

                if (response.data.cloudinary_url) {
                    setCloudinaryUrl(response.data.cloudinary_url);
                    addAttendanceRecord(
                        response.data.results,
                        subjects,
                        response.data.cloudinary_url
                    );
                }

                message.success({
                    content: `Successfully processed! Found ${response.data.faces_detected || 0} faces.`,
                    key: messageKey,
                    duration: 3
                });
            }

        } catch (err) {
            let errorMessage = "Error processing image";
            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please try again.';
            } else if (err.response) {
                switch (err.response.status) {
                    case 400:
                        errorMessage = err.response.data?.detail || 'Invalid image format';
                        break;
                    case 413:
                        errorMessage = 'Image file is too large';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later';
                        break;
                    default:
                        errorMessage = err.response.data?.detail || 'Error uploading image';
                }
            }

            setError(errorMessage);
            message.error({
                content: errorMessage,
                key: messageKey,
                duration: 4
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative overflow-hidden border shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl border-white/10"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
            <div className="relative p-8">
                <AnimatePresence>
                    {showCamera && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <CameraCapture
                                onCapture={handleCameraCapture}
                                onClose={() => setShowCamera(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text">
                        <ReactTyped
                            strings={["Intelligent Attendance Capture"]}
                            typeSpeed={40}
                            showCursor={false}
                        />
                    </h2>
                    <p className="mt-2 text-blue-200">AI-powered face recognition system</p>
                </div>

                {/* Image Preview Section */}
                {imagePreviewUrl && !loading && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 overflow-hidden border border-white/10 rounded-xl"
                    >
                        <div className="relative aspect-video">
                            <img 
                                src={imagePreviewUrl} 
                                alt="Preview" 
                                className="absolute inset-0 object-contain w-full h-full"
                                onLoad={handleImageLoad}
                            />
                            <button
                                onClick={() => {
                                    setImagePreviewUrl(null);
                                    setImage(null);
                                    setResults(null);
                                }}
                                className="absolute p-2 transition-all rounded-full bg-black/50 top-2 right-2 hover:bg-black/70"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Upload Area */}
                {!imagePreviewUrl && (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`relative group rounded-2xl border-2 border-dashed ${isDragging ? 'border-emerald-400' : 'border-white/20'} transition-all duration-300 min-h-[200px]`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={loading}
                            className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
                            <CloudUpload className="w-8 h-8 text-purple-400 transition-colors group-hover:text-emerald-400" />
                            <ReactTyped
                                strings={[
                                    "Drag & Drop Attendance Photo",
                                    "Supported Formats: JPG/PNG/HEIC",
                                    "Max File Size: 5MB"
                                ]}
                                typeSpeed={50}
                                backSpeed={30}
                                loop
                                className="text-lg text-center text-blue-200"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <div className="grid gap-4 mt-8 sm:grid-cols-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-3 p-4 transition-all bg-white/5 rounded-xl hover:bg-white/10"
                        onClick={() => setShowCamera(true)}
                    >
                        <Camera className="w-6 h-6 text-purple-400" />
                        <span className="text-transparent bg-gradient-to-r from-blue-300 to-purple-200 bg-clip-text">
                            Live Capture
                        </span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-3 p-4 transition-all bg-gradient-to-r from-blue-600 to-purple-500 rounded-xl hover:shadow-blue-glow disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleUpload}
                        disabled={loading || !image}
                    >
                        {loading ? (
                            <RotateCw className="w-6 h-6 text-white animate-spin" />
                        ) : (
                            <>
                                <Upload className="w-6 h-6 text-white" />
                                <span className="font-medium text-white">
                                    Process Attendance
                                </span>
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Results Section */}
                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 space-y-6"
                    >
                        <div className="p-6 bg-white/5 rounded-xl backdrop-blur-lg">
                            <h3 className="mb-4 text-xl font-semibold text-blue-200">
                                Recognition Analytics
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-black/20">
                                    <span className="text-blue-100">Total Detections</span>
                                    <span className="text-2xl font-bold text-emerald-400">
                                        {results.faces_detected}
                                    </span>
                                </div>
                                {results.results.map((face, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 transition-colors rounded-lg bg-black/20 group hover:bg-white/5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-white">{face.name}</h4>
                                                <p className="text-sm text-blue-100/80">
                                                    Confidence: {(face.confidence * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="w-24 h-2 overflow-hidden rounded-full bg-white/10">
                                                <div
                                                    className="h-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-purple-400"
                                                    style={{ width: `${face.confidence * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default ImageUploadForAttendance;