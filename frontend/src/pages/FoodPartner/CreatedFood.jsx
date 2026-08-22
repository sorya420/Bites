import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Icon = {
	back: () => <span aria-hidden="true">&#8592;</span>,
	upload: () => <span aria-hidden="true">&#8593;</span>,
};

export default function CreatedFood() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ name: "", description: "" });
	const [video, setVideo] = useState(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [status, setStatus] = useState({ type: "", message: "" });
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((current) => ({ ...current, [name]: value }));
		setStatus({ type: "", message: "" });
	};

	const handleVideoChange = (event) => {
		const selectedVideo = event.target.files?.[0] || null;
		setVideo(selectedVideo);
		setPreviewUrl(selectedVideo ? URL.createObjectURL(selectedVideo) : "");
		setStatus({ type: "", message: "" });
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!video) {
			setStatus({ type: "error", message: "Choose a video before publishing." });
			return;
		}

		const payload = new FormData();
		payload.append("video", video);
		payload.append("name", formData.name);
		payload.append("description", formData.description);

		setIsSubmitting(true);
		setStatus({ type: "", message: "" });
		try {
			await axios.post("https://bites-rho.vercel.app/api/food", payload, {
				withCredentials: true,
			});
			setStatus({ type: "success", message: "Food video published." });
			setFormData({ name: "", description: "" });
			setVideo(null);
			setPreviewUrl("");
		} catch (requestError) {
			setStatus({
				type: "error",
				message:
					requestError.response?.data?.message ||
					"Unable to publish this food video.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="auth-page flex w-full items-center justify-center bg-black">
			<div className="relative flex min-h-dvh w-full max-w-105 min-w-0 flex-col bg-[#0A0C10] text-white sm:min-h-0 sm:max-h-228 sm:rounded-[36px] sm:ring-10 sm:ring-black">
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

				<form onSubmit={handleSubmit} className="min-w-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6">
					<div>
						<h2 className="text-2xl font-bold">Share a fresh find.</h2>
						<p className="mt-1 text-sm leading-6 text-white/55">
							Add a short video and tell customers what is on the menu.
						</p>
					</div>

					<label className="block cursor-pointer">
						<span className="mb-2 block text-sm font-semibold text-white/80">Food video</span>
						<div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-orange-300/50 bg-orange-400/5 transition-colors hover:bg-orange-400/10">
							{previewUrl ? (
								<video
									className="h-full w-full object-cover"
									src={previewUrl}
									controls
									muted
									playsInline
								/>
							) : (
								<div className="px-5 text-center">
									<span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-400 text-2xl text-black">
										{Icon.upload()}
									</span>
									<p className="font-semibold">Tap to choose a video</p>
									<p className="mt-1 text-xs text-white/50">MP4 or MOV, up to 60 seconds</p>
								</div>
							)}
						</div>
						<input
							className="sr-only"
							type="file"
							name="video"
							accept="video/mp4,video/quicktime,video/*"
							onChange={handleVideoChange}
						/>
					</label>

					<label className="block">
						<span className="mb-2 block text-sm font-semibold text-white/80">Food name</span>
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

					<label className="block">
						<span className="mb-2 block text-sm font-semibold text-white/80">Description</span>
						<textarea
							className="min-h-28 w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base leading-6 outline-none transition placeholder:text-white/30 focus:border-orange-300"
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="What makes this dish worth trying?"
							required
						/>
					</label>

					{status.message && (
						<p
							className={`text-sm ${status.type === "success" ? "text-emerald-300" : "text-rose-300"}`}
							role="status"
						>
							{status.message}
						</p>
					)}

					<button
						className="min-h-12 w-full rounded-xl bg-orange-400 px-5 py-3 font-bold text-black transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Publishing..." : "Publish food"}
					</button>
				</form>
			</div>
		</main>
	);
}
