import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../configs/config";

const Icon = {
  heart: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill={p.filled ? "#FFFFFF" : "none"}
      stroke={p.filled ? "#FFFFFF" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ),

  comment: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5H3l2.4-4A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  ),

  share: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),

  bookmark: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill={p.filled ? "#FFFFFF" : "none"}
      stroke={p.filled ? "#FFFFFF" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),

  home: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),

  search: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),

  plus: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),

  bag: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),

  user: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),

  music: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),

  close: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  ),

  send: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
};

function CommentSheet({
  open,
  reel,
  comments,
  loading,
  submitting,
  commentText,
  setCommentText,
  onClose,
  onSubmit,
}) {
  if (!open || !reel) return null;

  const getUserName = (comment) => {
    const user = comment?.user;

    if (!user) return "User";

    if (typeof user === "string") {
      return "User";
    }

    return (
      user.fullName ||
      user.name ||
      [user.firstname, user.lastname].filter(Boolean).join(" ") ||
      "User"
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-[2px]">
      <div className="absolute inset-0" onClick={onClose} />

      <section className="relative flex h-[75dvh] w-full max-w-105 flex-col overflow-hidden rounded-t-[28px] bg-[#111318] text-white shadow-2xl">
        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold">Comments</h2>

            <p className="text-xs text-white/45">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
            aria-label="Close comments"
          >
            <span className="h-5 w-5">
              <Icon.close />
            </span>
          </button>
        </div>

        {/* COMMENTS */}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-white/50">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl">
                💬
              </div>

              <p className="font-semibold">No comments yet</p>

              <p className="mt-1 text-sm text-white/45">
                Be the first to comment on this reel.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {comments.map((comment, index) => {
                const userName = getUserName(comment);

                return (
                  <article
                    key={comment._id || `${comment.createdAt}-${index}`}
                    className="flex gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-rose-500 text-sm font-bold text-white">
                      {userName.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl bg-white/7 px-4 py-3">
                        <p className="text-sm font-bold">{userName}</p>

                        <p className="mt-1 break-words text-sm leading-5 text-white/80">
                          {comment.text}
                        </p>
                      </div>

                      <p className="mt-1 px-2 text-[10px] text-white/35">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* INPUT */}

        <form
          onSubmit={onSubmit}
          className="shrink-0 border-t border-white/10 bg-[#111318] p-3 pb-[calc(12px+env(safe-area-inset-bottom))]"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment..."
              maxLength={500}
              rows={1}
              disabled={submitting}
              className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/35"
            />

            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-400 text-black transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send comment"
            >
              <span className="h-5 w-5">
                <Icon.send />
              </span>
            </button>
          </div>

          <div className="mt-1 px-2 text-right text-[10px] text-white/30">
            {commentText.length}/500
          </div>
        </form>
      </section>
    </div>
  );
}

function ReelCard({
  reel,
  index,
  total,
  isActive,
  muted,
  liked,
  saved,
  onToggleLike,
  onToggleSave,
  onOrder,
  onComment,
  onDoubleTap,
  onVisitStore,
}) {
  const [burst, setBurst] = useState(null);
  const [paused, setPaused] = useState(false);

  const lastTap = useRef(0);
  const tapTimer = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = muted;

    if (!isActive || paused) {
      video.pause();
      return;
    }

    video.play().catch(() => undefined);
  }, [isActive, muted, paused]);

  useEffect(() => {
    return () => {
      clearTimeout(tapTimer.current);
    };
  }, []);

  const handleClick = (event) => {
    if (event.target.closest("[data-no-tap]")) {
      return;
    }

    const now = Date.now();

    if (now - lastTap.current < 320) {
      clearTimeout(tapTimer.current);

      const rect = event.currentTarget.getBoundingClientRect();

      setBurst({
        x: event.clientX - rect.left - 45,
        y: event.clientY - rect.top - 45,
        key: now,
      });

      onDoubleTap(index);
    } else {
      tapTimer.current = setTimeout(() => {
        setPaused((value) => !value);
      }, 320);
    }

    lastTap.current = now;
  };

  return (
    <div
      className="relative flex h-full w-full snap-start snap-always items-end overflow-hidden"
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover brightness-90 transition-transform ease-out"
        src={reel.video}
        poster={reel.poster}
        autoPlay={isActive}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={(event) => event.preventDefault()}
        style={{
          transform: isActive ? "scale(1)" : "scale(1.12)",
          transitionDuration: "6500ms",
        }}
      />

      {paused && isActive && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-3xl text-white">
            ▶
          </span>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.05) 55%, rgba(10,12,16,0.55) 78%, rgba(10,12,16,0.92) 100%)",
        }}
      />

      {burst && (
        <div
          key={burst.key}
          className="reel-burst pointer-events-none absolute z-20 h-22.5 w-22.5"
          style={{
            left: burst.x,
            top: burst.y,
          }}
          onAnimationEnd={() => setBurst(null)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="#FFFFFF"
            className="h-full w-full drop-shadow-lg"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </div>
      )}

      {/* TOP */}

      <div className="reel-topbar absolute left-0 right-0 top-0 z-10">
        <div className="mb-3.5 flex gap-1">
          {Array.from({
            length: total,
          }).map((_, j) => (
            <div
              key={j}
              className="h-0.75 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-mango to-chili"
                style={{
                  width: j < index ? "100%" : "0%",
                  animation:
                    isActive && j === index
                      ? "reel-fillbar 5s linear infinite"
                      : "none",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-display text-[19px] drop-shadow-md">
            <span>✦</span>
            Bites
          </div>
        </div>
      </div>

      {/* ACTIONS */}

      <div
        className="reel-action-rail absolute z-10 flex flex-col items-center"
        data-no-tap
      >
        <div
          className="relative h-11 w-11 rounded-2xl border-2 border-white bg-cover bg-center"
          style={{
            backgroundImage: `url('${reel.avatar}')`,
          }}
        >
          <span className="absolute -bottom-1.5 left-1/2 flex h-4.25 w-4.25 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#0A0C10] bg-white text-[13px] font-extrabold leading-4 text-black">
            +
          </span>
        </div>

        <button
          className="flex flex-col items-center gap-1 text-[11.5px] font-bold text-white transition-transform active:scale-90"
          onClick={() => onToggleLike(index)}
        >
          <span className="h-7 w-7 drop-shadow-md">
            <Icon.heart filled={liked} />
          </span>

          {reel.likes}
        </button>

        <button
          className="flex flex-col items-center gap-1 text-[11.5px] font-bold text-white transition-transform active:scale-90"
          onClick={() => onComment(index)}
        >
          <span className="h-7 w-7 drop-shadow-md">
            <Icon.comment />
          </span>

          {reel.comments}
        </button>

        <button className="flex flex-col items-center gap-1 text-[11.5px] font-bold text-white transition-transform active:scale-90">
          <span className="h-7 w-7 drop-shadow-md">
            <Icon.share />
          </span>

          {reel.shares}
        </button>

        <button
          className="flex flex-col items-center gap-1 text-[11.5px] font-bold text-white transition-transform active:scale-90"
          onClick={() => onToggleSave(index)}
        >
          <span className="h-7 w-7 drop-shadow-md">
            <Icon.bookmark filled={saved} />
          </span>
          Save
        </button>

        <div
          className="h-9 w-9 rounded-full border-2 border-[#14171D] bg-cover bg-center"
          style={{
            backgroundImage: `url('${reel.avatar}')`,
            animation: isActive ? "reel-spin 5s linear infinite" : "none",
          }}
        />
      </div>

      {/* CAPTION */}

      <div className="reel-caption relative z-10 w-full">
        <div className="mb-2 flex gap-1.5">
          {reel.tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full border border-white/70 bg-white/15 px-2.5 py-1 text-[11px] font-extrabold text-white backdrop-blur-sm"
            >
              {tag.t}
            </span>
          ))}
        </div>

        <p className="reel-place mb-1.5 font-display drop-shadow-md">
          {reel.place}
        </p>

        <p className="reel-description mb-3 leading-snug font-medium text-white">
          {reel.caption}
        </p>

        <div className="flex items-center gap-2.5" data-no-tap>
          <button
            type="button"
            onClick={() => onOrder(index)}
            className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/20 px-4.5 py-2.5 text-[13px] font-extrabold text-white shadow-lg"
          >
            <span>✦</span>
            Order now
          </button>

          <button
            type="button"
            onClick={() => onVisitStore(reel.foodPartnerId)}
            className="whitespace-nowrap rounded-full border border-white/60 bg-black/35 px-4.5 py-2.5 text-[13px] font-extrabold text-white shadow-lg"
          >
            Visit store
          </button>

          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-white">
            <span className="h-3 w-3">
              <Icon.music />
            </span>

            {reel.audio}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [reels, setReels] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeIndex, setActiveIndex] = useState(0);

  const muted = true;

  const [liked, setLiked] = useState({});

  const [saved, setSaved] = useState({});

  const [commentOpen, setCommentOpen] = useState(false);

  const [selectedReel, setSelectedReel] = useState(null);

  const [comments, setComments] = useState([]);

  const [commentsLoading, setCommentsLoading] = useState(false);

  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [commentText, setCommentText] = useState("");

  const feedRef = useRef(null);

  const cardRefs = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchFoodItems() {
      try {
        const { data } = await axios.get(`${API_URL}/api/food`, {
          withCredentials: true,
        });

        const foodItems = Array.isArray(data.foodItems) ? data.foodItems : [];

        const videoItems = foodItems.filter((food) => food.video);

        if (!cancelled) {
          setReels(
            videoItems.map((food) => ({
              id: food._id,

              video: food.video,

              foodPartnerId: food.foodPartner?._id || food.foodPartner,

              avatar: "",

              place: food.foodPartner?.name || food.name,

              tags: [
                {
                  t: "Food",
                  c: "food",
                },
              ],

              caption: food.description || "Fresh from our food partners.",

              likes: food.likes || 0,

              comments: food.comments || 0,

              orders: food.orderCount || 0,

              shares: "0",

              audio: "Original audio",

              isLiked: food.isLiked,
            })),
          );

          setLiked(
            Object.fromEntries(
              videoItems.map((food, index) => [index, Boolean(food.isLiked)]),
            ),
          );

          setActiveIndex(0);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load food videos. Please log in and try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchFoodItems();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const feedEl = feedRef.current;

    if (!feedEl) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number(entry.target.dataset.index);

            setActiveIndex(idx);
          }
        });
      },
      {
        root: feedEl,
        threshold: [0.6],
      },
    );

    cardRefs.current.forEach((el) => el && io.observe(el));

    return () => io.disconnect();
  }, [reels.length]);

  const toggleLike = async (i) => {
    const reel = reels[i];

    if (!reel) return;

    try {
      const { data } = await axios.patch(
        `${API_URL}/api/food/${reel.id}/like`,
        {},
        {
          withCredentials: true,
        },
      );

      setLiked((prev) => ({
        ...prev,
        [i]: data.liked,
      }));

      setReels((prev) =>
        prev.map((item, index) =>
          index === i
            ? {
                ...item,
                likes: data.likes,
              }
            : item,
        ),
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update like");
    }
  };

  const toggleSave = (i) => {
    setSaved((prev) => ({
      ...prev,
      [i]: !prev[i],
    }));
  };

  const placeOrder = async (i) => {
    const reel = reels[i];

    if (!reel) return;

    try {
      const { data } = await axios.post(
        `${API_URL}/api/food/${reel.id}/order`,
        {},
        {
          withCredentials: true,
        },
      );

      setReels((prev) =>
        prev.map((item, index) =>
          index === i
            ? {
                ...item,
                orders: data.orderCount,
              }
            : item,
        ),
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to place order");
    }
  };

  const openComments = async (i) => {
    const reel = reels[i];

    if (!reel) return;

    setSelectedReel(reel);

    setCommentOpen(true);

    setComments([]);

    setCommentText("");

    setCommentsLoading(true);

    try {
      const { data } = await axios.get(
        `${API_URL}/api/food/${reel.id}/comments`,
        {
          withCredentials: true,
        },
      );

      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load comments",
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  const closeComments = () => {
    setCommentOpen(false);

    setSelectedReel(null);

    setComments([]);

    setCommentText("");
  };

  const addComment = async (event) => {
    event.preventDefault();

    const text = commentText.trim();

    if (!selectedReel || !text) {
      return;
    }

    if (text.length > 500) {
      setError("Comment cannot exceed 500 characters");

      return;
    }

    setCommentSubmitting(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/food/${selectedReel.id}/comments`,
        {
          text,
        },
        {
          withCredentials: true,
        },
      );

      if (data.comment) {
        setComments((prev) => [...prev, data.comment]);
      } else {
        const commentsResponse = await axios.get(
          `${API_URL}/api/food/${selectedReel.id}/comments`,
          {
            withCredentials: true,
          },
        );

        setComments(commentsResponse.data.comments || []);
      }

      setReels((prev) =>
        prev.map((item) =>
          item.id === selectedReel.id
            ? {
                ...item,
                comments: data.comments ?? item.comments + 1,
              }
            : item,
        ),
      );

      // Also update selected reel.

      setSelectedReel((current) =>
        current
          ? {
              ...current,
              comments: data.comments ?? current.comments + 1,
            }
          : current,
      );

      setCommentText("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const doubleTapLike = (i) => {
    if (!liked[i]) {
      toggleLike(i);
    }
  };

  const visitStore = (partnerId) => {
    if (partnerId) {
      navigate(`/food-partner/${partnerId}`);
    }
  };

  const openProfile = async () => {
    try {
      await axios.get(`${API_URL}/api/auth/user/me`, {
        withCredentials: true,
      });

      navigate("/profile");

      return;
    } catch {
      // Try partner session.
    }

    try {
      const { data } = await axios.get(`${API_URL}/api/auth/food-partner/me`, {
        withCredentials: true,
      });

      const partnerId = data.foodPartner?.id;

      if (partnerId) {
        navigate("/food-partner/home");

        return;
      }
    } catch {
      // Continue.
    }

    navigate("/user/register");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-black">
      <style>{`
        @keyframes reel-fillbar {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes reel-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes reel-burst {
          0% {
            opacity: 0;
            transform: scale(0.4) rotate(-8deg);
          }

          35% {
            opacity: 1;
            transform: scale(1.15) rotate(3deg);
          }

          55% {
            transform: scale(0.95) rotate(0deg);
          }

          100% {
            opacity: 0;
            transform: scale(1) rotate(0deg);
          }
        }

        .reel-burst {
          animation:
            reel-burst
            0.85s
            cubic-bezier(.2,1.4,.4,1)
            forwards;
        }

        .reel-topbar {
          padding:
            calc(14px + env(safe-area-inset-top))
            clamp(14px, 4vw, 20px)
            10px;
        }

        .reel-action-rail {
          right:
            clamp(8px, 3.5vw, 16px);

          bottom:
            clamp(104px, 16vh, 132px);

          gap:
            clamp(12px, 2.5vh, 20px);
        }

        .reel-caption {
          padding:
            16px
            clamp(14px, 4vw, 20px)
            calc(84px + env(safe-area-inset-bottom));

          padding-right:
            clamp(76px, 21vw, 94px);
        }

        .reel-place {
          font-size:
            clamp(18px, 5vw, 21px);
        }

        .reel-description {
          max-width:
            min(88%, 340px);

          font-size:
            clamp(13px, 3.5vw, 15px);
        }

        .reel-caption [class~="gap-2.5"] {
          flex-wrap: wrap;
        }

        .reel-caption .text-white {
          overflow-wrap: anywhere;
        }

        .reel-bottom-nav {
          display: grid;

          grid-template-columns:
            repeat(5, minmax(0, 1fr));

          align-items: end;

          gap:
            clamp(2px, 1vw, 8px);

          padding-left:
            clamp(12px, 4vw, 20px);

          padding-right:
            clamp(12px, 4vw, 20px);

          padding-top: 8px;

          padding-bottom:
            calc(12px + env(safe-area-inset-bottom));
        }

        .reel-bottom-nav > button {
          min-width: 0;
          width: 100%;
          justify-self: center;
          overflow: hidden;
        }

        .reel-bottom-nav > button:not(.reel-create-button) {
          min-height: 44px;
          padding-inline: 2px;
        }

        .reel-bottom-nav > button:not(.reel-create-button) span {
          width: 18px;
          height: 18px;
          margin-inline: auto;
        }

        .reel-bottom-nav > button:not(.reel-create-button) {
          font-size:
            clamp(8px, 1.9vw, 10px);

          line-height: 1.1;
        }

        .reel-create-button {
          width:
            clamp(30px, 8vw, 36px) !important;

          height:
            clamp(30px, 8vw, 36px) !important;

          min-height: 30px !important;

          margin:
            0 auto 8px;

          padding: 0;
        }

        .reel-create-button span {
          width: 17px;
          height: 17px;
        }

        @media (max-height: 700px) {
          .reel-action-rail {
            gap: 9px;
            bottom: 92px;
          }

          .reel-caption {
            padding-bottom: 70px;
          }

          .reel-caption .w-7 {
            width: 24px;
            height: 24px;
          }
        }

        @media (max-width: 360px) {
          .reel-action-rail {
            gap: 7px;
            bottom: 88px;
          }

          .reel-caption {
            padding-right: 68px;
          }

          .reel-caption [class~="gap-2.5"] {
            gap: 6px;
          }

          .reel-caption [class~="gap-2.5"] button {
            padding-inline: 10px;
          }
        }
      `}</style>

      <div className="relative h-dvh w-full max-w-105 overflow-hidden bg-[#0A0C10] font-sans text-white sm:max-h-228 sm:rounded-[36px] sm:shadow-2xl sm:ring-10 sm:ring-black">
        <div
          ref={feedRef}
          className="scrollbar-none h-full w-full snap-y snap-mandatory overflow-y-scroll"
        >
          {loading && (
            <div className="flex h-full items-center justify-center px-6 text-center text-white">
              Loading food videos...
            </div>
          )}

          {!loading && error && (
            <div className="flex h-full items-center justify-center px-6 text-center text-white">
              {error}
            </div>
          )}

          {!loading && !error && reels.length === 0 && (
            <div className="flex h-full items-center justify-center px-6 text-center text-white">
              No food videos available yet.
            </div>
          )}

          {reels.map((reel, i) => (
            <div
              key={reel.id}
              ref={(el) => (cardRefs.current[i] = el)}
              data-index={i}
              className="h-full w-full"
            >
              <ReelCard
                reel={reel}
                index={i}
                total={reels.length}
                isActive={activeIndex === i}
                muted={muted}
                liked={!!liked[i]}
                saved={!!saved[i]}
                onToggleLike={toggleLike}
                onToggleSave={toggleSave}
                onOrder={placeOrder}
                onComment={openComments}
                onDoubleTap={doubleTapLike}
                onVisitStore={visitStore}
              />
            </div>
          ))}
        </div>

        <div className="reel-bottom-nav absolute bottom-0 left-0 right-0 z-30 bg-linear-to-t from-[#0A0C10] via-[#0A0C10]/90 to-transparent">
          <button className="flex flex-col items-center justify-center gap-0.5 text-[9.5px] font-bold text-white">
            <span className="h-5.5 w-5.5">
              <Icon.home />
            </span>
            Home
          </button>

          <button className="flex flex-col items-center justify-center gap-0.5 text-[9.5px] font-bold text-white">
            <span className="h-5.5 w-5.5">
              <Icon.search />
            </span>
            Discover
          </button>

          <button
            type="button"
            onClick={() => navigate("/create-food")}
            className="reel-create-button flex items-center justify-center rounded-xl border border-white/70 bg-white/20 text-white shadow-lg"
          >
            <span className="h-5 w-5">
              <Icon.plus />
            </span>
          </button>

          <button className="flex flex-col items-center justify-center gap-0.5 text-[9.5px] font-bold text-white">
            <span className="h-5.5 w-5.5">
              <Icon.bag />
            </span>
            Orders
          </button>

          <button
            type="button"
            onClick={openProfile}
            className="flex flex-col items-center justify-center gap-0.5 text-[9.5px] font-bold text-white"
          >
            <span className="h-5.5 w-5.5">
              <Icon.user />
            </span>
            Profile
          </button>
        </div>

        <CommentSheet
          open={commentOpen}
          reel={selectedReel}
          comments={comments}
          loading={commentsLoading}
          submitting={commentSubmitting}
          commentText={commentText}
          setCommentText={setCommentText}
          onClose={closeComments}
          onSubmit={addComment}
        />
      </div>
    </div>
  );
}
