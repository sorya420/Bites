import axios from "axios";
import { upload } from "@imagekit/javascript";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../configs/config";

const Icon = {
  back: () => <span aria-hidden="true">&#8592;</span>,

  upload: () => <span aria-hidden="true">&#8593;</span>,
};

export default function CreatedFood() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [video, setVideo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clean preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setStatus({
      type: "",
      message: "",
    });
  };

  const handleVideoChange = (event) => {
    const selectedVideo = event.target.files?.[0];

    if (!selectedVideo) {
      return;
    }

    setStatus({
      type: "",
      message: "",
    });

    // Check file type
    if (!selectedVideo.type.startsWith("video/")) {
      setStatus({
        type: "error",
        message: "Please select a valid video file.",
      });

      event.target.value = "";
      return;
    }

    // Optional 200 MB limit
    const maxSize = 200 * 1024 * 1024;

    if (selectedVideo.size > maxSize) {
      setStatus({
        type: "error",
        message: "Video must be smaller than 200 MB.",
      });

      event.target.value = "";
      return;
    }

    const temporaryUrl = URL.createObjectURL(selectedVideo);
    const temporaryVideo = document.createElement("video");

    temporaryVideo.preload = "metadata";

    temporaryVideo.onloadedmetadata = () => {
      const duration = temporaryVideo.duration;

      URL.revokeObjectURL(temporaryUrl);

      if (!Number.isFinite(duration)) {
        setStatus({
          type: "error",
          message: "Unable to read video duration.",
        });

        event.target.value = "";
        return;
      }

      if (duration > 60) {
        setStatus({
          type: "error",
          message: "Please choose a video that is 60 seconds or shorter.",
        });

        setVideo(null);
        setPreviewUrl("");

        event.target.value = "";
        return;
      }

      // Remove old preview URL
      setPreviewUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return URL.createObjectURL(selectedVideo);
      });

      setVideo(selectedVideo);

      setUploadProgress(0);

      setStatus({
        type: "success",
        message: "Video selected successfully.",
      });
    };

    temporaryVideo.onerror = () => {
      URL.revokeObjectURL(temporaryUrl);

      setStatus({
        type: "error",
        message: "This video cannot be read by your browser. Try an MP4 video.",
      });

      setVideo(null);
      setPreviewUrl("");

      event.target.value = "";
    };

    temporaryVideo.src = temporaryUrl;
  };

  const uploadVideoToImageKit = async () => {
    if (!video) {
      throw new Error("Please select a video.");
    }

    // Get secure ImageKit authentication from backend
    const authResponse = await axios.get(
      `${API_URL}/api/upload/imagekit-auth`,
      {
        withCredentials: true,
      },
    );

    const { token, expire, signature, publicKey } = authResponse.data;

    if (!token || !expire || !signature || !publicKey) {
      throw new Error("Invalid ImageKit authentication response.");
    }

    // Upload directly from phone/browser to ImageKit
    const result = await upload({
      file: video,

      fileName: `food-${Date.now()}-${video.name}`,

      token,
      expire,
      signature,

      publicKey,

      onProgress: (event) => {
        if (event.total) {
          const progress = Math.round((event.loaded / event.total) * 100);

          setUploadProgress(progress);
        }
      },
    });

    if (!result?.url) {
      throw new Error("ImageKit did not return a video URL.");
    }

    console.log("ImageKit video URL:", result.url);

    return result.url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!video) {
      setStatus({
        type: "error",
        message: "Choose a video before publishing.",
      });

      return;
    }

    if (!formData.name.trim()) {
      setStatus({
        type: "error",
        message: "Food name is required.",
      });

      return;
    }

    if (!formData.description.trim()) {
      setStatus({
        type: "error",
        message: "Description is required.",
      });

      return;
    }

    setIsSubmitting(true);

    setStatus({
      type: "",
      message: "",
    });

    setUploadProgress(0);

    try {
      // Upload video directly to ImageKit
      const videoUrl = await uploadVideoToImageKit();

      // Save only the URL in your backend/database
      await axios.post(
        `${API_URL}/api/food`,
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          video: videoUrl,
        },
        {
          withCredentials: true,
        },
      );

      setStatus({
        type: "success",
        message: "Food video published successfully.",
      });

      setFormData({
        name: "",
        description: "",
      });

      setVideo(null);

      setPreviewUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return "";
      });

      setUploadProgress(0);
    } catch (requestError) {
      console.error("Video upload error:", requestError);

      setStatus({
        type: "error",
        message:
          requestError.response?.data?.message ||
          requestError.message ||
          "Unable to publish this food video.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page flex w-full items-center justify-center bg-black">
      <div className="relative flex min-h-dvh w-full max-w-105 min-w-0 flex-col bg-[#0A0C10] text-white sm:min-h-0 sm:max-h-228 sm:rounded-[36px] sm:ring-10 sm:ring-black">
        {/* HEADER */}

        <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 pb-3 pt-[calc(14px+env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center text-2xl"
            aria-label="Go back"
          >
            {Icon.back()}
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
              Partner studio
            </p>

            <h1 className="text-xl font-bold">Create food</h1>
          </div>
        </header>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="min-w-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6"
        >
          <div>
            <h2 className="text-2xl font-bold">Share a fresh find.</h2>

            <p className="mt-1 text-sm leading-6 text-white/55">
              Add a short video and tell customers what is on the menu.
            </p>
          </div>

          {/* VIDEO */}

          <label className="block cursor-pointer">
            <span className="mb-2 block text-sm font-semibold text-white/80">
              Food video
            </span>

            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-orange-300/50 bg-orange-400/5 transition-colors hover:bg-orange-400/10">
              {previewUrl ? (
                <video
                  className="h-full w-full object-cover"
                  src={previewUrl}
                  controls
                  muted={false}
                  playsInline
                  preload="metadata"
                />
              ) : (
                <div className="px-5 text-center">
                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-400 text-2xl text-black">
                    {Icon.upload()}
                  </span>

                  <p className="font-semibold">Tap to choose a video</p>

                  <p className="mt-1 text-xs text-white/50">
                    Choose from your phone gallery
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    MP4 / MOV · Maximum 60 seconds
                  </p>
                </div>
              )}
            </div>

            {/* IMPORTANT:
                No capture attribute here.
                This allows mobile gallery/file picker. */}
            <input
              className="sr-only"
              type="file"
              name="video"
              accept="video/*"
              onChange={handleVideoChange}
            />
          </label>

          {/* UPLOAD PROGRESS */}

          {isSubmitting && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-white/60">
                <span>Uploading video...</span>

                <span>{uploadProgress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-orange-400 transition-all"
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* NAME */}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/80">
              Food name
            </span>

            <input
              className="min-h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-base outline-none transition placeholder:text-white/30 focus:border-orange-300"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Smoky paneer wrap"
              required
            />
          </label>

          {/* DESCRIPTION */}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/80">
              Description
            </span>

            <textarea
              className="min-h-28 w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base leading-6 outline-none transition placeholder:text-white/30 focus:border-orange-300"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What makes this dish worth trying?"
              required
            />
          </label>

          {/* STATUS */}

          {status.message && (
            <p
              className={`text-sm ${
                status.type === "success" ? "text-emerald-300" : "text-rose-300"
              }`}
              role="status"
            >
              {status.message}
            </p>
          )}

          {/* SUBMIT */}

          <button
            className="min-h-12 w-full rounded-xl bg-orange-400 px-5 py-3 font-bold text-black transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? `Uploading ${uploadProgress}%` : "Publish food"}
          </button>
        </form>
      </div>
    </main>
  );
}
