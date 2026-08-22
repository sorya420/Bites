import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ---- small inline icon set (no external icon lib needed) ----
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
  muteOn: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ),
  muteOff: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 6a9 9 0 0 1 0 12" />
    </svg>
  ),
};

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
  const [burst, setBurst] = useState(null); // {x, y, key}
  const [paused, setPaused] = useState(false);
  const lastTap = useRef(0);
  const tapTimer = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isActive || paused) {
      video.pause();
      return;
    }

    video.play().catch(() => undefined);
  }, [isActive, muted, paused]);

  
  useEffect(() => () => clearTimeout(tapTimer.current), []);

  const handleClick = (e) => {
    if (e.target.closest("[data-no-tap]")) return;
    const now = Date.now();
    if (now - lastTap.current < 320) {
      clearTimeout(tapTimer.current);
      const rect = e.currentTarget.getBoundingClientRect();
      setBurst({
        x: e.clientX - rect.left - 45,
        y: e.clientY - rect.top - 45,
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
      className="relative h-full w-full snap-start snap-always overflow-hidden flex items-end"
      onClick={handleClick}
    >
      {/* video layer with a subtle zoom while the reel is active */}
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
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-3xl text-white">
            ▶
          </span>
        </div>
      )}
      {/* scrim */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.05) 55%, rgba(10,12,16,0.55) 78%, rgba(10,12,16,0.92) 100%)",
        }}
      />

      {/* double-tap heart burst */}
      {burst && (
        <div
          key={burst.key}
          className="absolute z-20 w-22.5 h-22.5 pointer-events-none reel-burst"
          style={{ left: burst.x, top: burst.y }}
          onAnimationEnd={() => setBurst(null)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="#FFFFFF"
            className="w-full h-full drop-shadow-lg"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </div>
      )}

      {/* top: sizzle progress bar + brand row */}
      <div className="reel-topbar absolute top-0 left-0 right-0 z-10">
        <div className="flex gap-1 mb-3.5">
          {Array.from({ length: total }).map((_, j) => (
            <div
              key={j}
              className="flex-1 h-0.75 rounded-full bg-white/30 overflow-hidden"
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
            <span aria-hidden="true">✦</span> Bites
          </div>
        </div>
      </div>

      {/* right action rail */}
      <div
        className="reel-action-rail absolute z-10 flex flex-col items-center"
        data-no-tap
      >
        <div
          className="w-11 h-11 rounded-2xl bg-cover bg-center border-2 border-white relative"
          style={{ backgroundImage: `url('${reel.avatar}')` }}
        >
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4.25 h-4.25 rounded-full bg-white border-2 border-[#0A0C10] text-black text-[13px] leading-4 text-center font-extrabold">
            +
          </span>
        </div>

        <button
          className="flex flex-col items-center gap-1 text-[11.5px] font-bold text-white active:scale-90 transition-transform"
          onClick={() => onToggleLike(index)}
        >
          <span className="w-7 h-7 drop-shadow-md">
            <Icon.heart filled={liked} />
          </span>
          {reel.likes}
        </button>

        <button
          className="flex flex-col items-center gap-1 text-[11.5px] font-bold text-white active:scale-90 transition-transform"
          onClick={() => onComment(index)}
        >
          <span className="w-7 h-7 drop-shadow-md">
            <Icon.comment />
          </span>
          {reel.comments}
        </button>

        <button className="flex flex-col items-center gap-1 text-[11.5px] font-bold text-white active:scale-90 transition-transform">
          <span className="w-7 h-7 drop-shadow-md">
            <Icon.share />
          </span>
          {reel.shares}
        </button>

        <button
          className="flex flex-col items-center gap-1 text-[11.5px] font-bold text-white active:scale-90 transition-transform"
          onClick={() => onToggleSave(index)}
        >
          <span className="w-7 h-7 drop-shadow-md">
            <Icon.bookmark filled={saved} />
          </span>
          Save
        </button>

        <div
          className="w-9 h-9 rounded-full bg-cover bg-center border-2 border-[#14171D]"
          style={{
            backgroundImage: `url('${reel.avatar}')`,
            animation: isActive ? "reel-spin 5s linear infinite" : "none",
          }}
        />
      </div>

      {/* bottom caption block */}
      <div className="reel-caption relative z-10 w-full">
        <div className="flex gap-1.5 mb-2">
          {reel.tags.map((t, i) => (
            <span
              key={i}
              className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-sm ${
                t.c === "veg"
                  ? "text-white border-white/70"
                  : "text-white border-white/70"
              } bg-white/15`}
            >
              {t.t}
            </span>
          ))}
        </div>
        <p className="reel-place font-display mb-1.5 drop-shadow-md">
          {reel.place}
        </p>
        <p className="reel-description leading-snug font-medium text-white mb-3">
          {reel.caption}
        </p>
        <div className="flex items-center gap-2.5" data-no-tap>
          <button
            type="button"
            onClick={() => onOrder(index)}
            className="font-extrabold text-[13px] text-white bg-white/20 border border-white/60 px-4.5 py-2.5 rounded-full flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <span aria-hidden="true">✦</span> Order now
          </button>
          <button
            
            type="button"
            onClick={() => onVisitStore(reel.foodPartnerId)}
            className="font-extrabold text-[13px] text-white bg-black/35 border border-white/60 px-4.5 py-2.5 rounded-full whitespace-nowrap shadow-lg cursor-pointer"
          >
            Visit store
          </button>
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-white">
            <span className="w-3 h-3">
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
  const feedRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchFoodItems() {
      try {
        const { data } = await axios.get("https://bites-rho.vercel.app/api/food", {
          withCredentials: true,
        });
        const foodItems = Array.isArray(data.foodItems) ? data.foodItems : [];
        const videoItems = foodItems.filter((food) => food.video);

        if (!cancelled) {
          setReels(
            videoItems
              .map((food) => ({
                id: food._id,
                video: food.video,
                foodPartnerId: food.foodPartner?._id || food.foodPartner,
                avatar: "",
                place: food.foodPartner?.name || food.name,
                tags: [{ t: "Food", c: "food" }],
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
        if (!cancelled) setLoading(false);
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
      { root: feedEl, threshold: [0.6] },
    );

    cardRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [reels.length]);

  const toggleLike = async (i) => {
    const reel = reels[i];
    if (!reel) return;

    try {
      const { data } = await axios.patch(
        `https://bites-rho.vercel.app/api/food/${reel.id}/like`,
        {},
        { withCredentials: true },
      );
      setLiked((prev) => ({ ...prev, [i]: data.liked }));
      setReels((prev) =>
        prev.map((item, index) =>
          index === i ? { ...item, likes: data.likes } : item,
        ),
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update like");
    }
  };
  const toggleSave = (i) => setSaved((prev) => ({ ...prev, [i]: !prev[i] }));

  const placeOrder = async (i) => {
    const reel = reels[i];
    if (!reel) return;

    try {
      const { data } = await axios.post(
        `https://bites-rho.vercel.app/api/food/${reel.id}/order`,
        {},
        { withCredentials: true },
      );
      setReels((prev) =>
        prev.map((item, index) =>
          index === i ? { ...item, orders: data.orderCount } : item,
        ),
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to place order");
    }
  };

  const addComment = async (i) => {
    const reel = reels[i];
    const text = window.prompt("Write a comment");
    if (!reel || !text?.trim()) return;

    try {
      const { data } = await axios.post(
        `https://bites-rho.vercel.app/api/food/${reel.id}/comments`,
        { text },
        { withCredentials: true },
      );
      setReels((prev) =>
        prev.map((item, index) =>
          index === i ? { ...item, comments: data.comments } : item,
        ),
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add comment");
    }
  };
  const doubleTapLike = (i) => {
    if (!liked[i]) toggleLike(i);
  };
  const visitStore = (partnerId) => {
    if (partnerId) navigate(`/food-partner/${partnerId}`);
  };

  const openProfile = async () => {
    try {
      await axios.get("https://bites-rho.vercel.app/api/auth/user/me", {
        withCredentials: true,
      });
      navigate("/profile");
      return;
    } catch {
      // Try the partner session when no user session exists.
    }

    try {
      const { data } = await axios.get(
        "https://bites-rho.vercel.app/api/auth/food-partner/me",
        { withCredentials: true },
      );
      const partnerId = data.foodPartner?.id;
      if (partnerId) {
        navigate("/food-partner/home");
        return;
      }
    } catch {
      // Continue to registration when no session exists.
    }

    navigate("/user/register");
  };

  return (
    <div className="h-dvh w-full flex items-center justify-center bg-black">
      <style>{`
        @keyframes reel-fillbar { from { width: 0%; } to { width: 100%; } }
        @keyframes reel-spin { to { transform: rotate(360deg); } }
        @keyframes reel-burst {
          0% { opacity: 0; transform: scale(0.4) rotate(-8deg); }
          35% { opacity: 1; transform: scale(1.15) rotate(3deg); }
          55% { transform: scale(0.95) rotate(0deg); }
          100% { opacity: 0; transform: scale(1) rotate(0deg); }
        }
        .reel-burst { animation: reel-burst 0.85s cubic-bezier(.2,1.4,.4,1) forwards; }
        .reel-topbar {
          padding: calc(14px + env(safe-area-inset-top)) clamp(14px, 4vw, 20px) 10px;
        }
        .reel-action-rail {
          right: clamp(8px, 3.5vw, 16px);
          bottom: clamp(104px, 16vh, 132px);
          gap: clamp(12px, 2.5vh, 20px);
        }
        .reel-caption {
          padding: 16px clamp(14px, 4vw, 20px) calc(84px + env(safe-area-inset-bottom));
          padding-right: clamp(76px, 21vw, 94px);
        }
        .reel-place { font-size: clamp(18px, 5vw, 21px); }
        .reel-description {
          max-width: min(88%, 340px);
          font-size: clamp(13px, 3.5vw, 15px);
        }
        .reel-caption [class~="gap-2.5"] { flex-wrap: wrap; }
        .reel-caption .text-white { overflow-wrap: anywhere; }
        .reel-bottom-nav {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          align-items: end;
          gap: clamp(2px, 1vw, 8px);
          padding-left: clamp(12px, 4vw, 20px);
          padding-right: clamp(12px, 4vw, 20px);
          padding-top: 8px;
          padding-bottom: calc(12px + env(safe-area-inset-bottom));
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
          font-size: clamp(8px, 1.9vw, 10px);
          line-height: 1.1;
        }
        .reel-create-button {
          width: clamp(30px, 8vw, 36px) !important;
          height: clamp(30px, 8vw, 36px) !important;
          min-height: 30px !important;
          margin: 0 auto 8px;
          padding: 0;
        }
        .reel-create-button span {
          width: 17px;
          height: 17px;
        }
        @media (max-height: 700px) {
          .reel-action-rail { gap: 9px; bottom: 92px; }
          .reel-caption { padding-bottom: 70px; }
          .reel-caption .w-7 { width: 24px; height: 24px; }
        }
        @media (max-width: 360px) {
          .reel-action-rail { gap: 7px; bottom: 88px; }
          .reel-caption { padding-right: 68px; }
          .reel-caption [class~="gap-2.5"] { gap: 6px; }
          .reel-caption [class~="gap-2.5"] button { padding-inline: 10px; }
        }
      `}</style>

      <div className="relative h-dvh w-full max-w-105 overflow-hidden bg-[#0A0C10] text-white font-sans sm:max-h-228 sm:rounded-[36px] sm:shadow-2xl sm:ring-10 sm:ring-black">
        <div
          ref={feedRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
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
                  onComment={addComment}
                onDoubleTap={doubleTapLike}
                onVisitStore={visitStore}
              />
            </div>
          ))}
        </div>

        {/* bottom nav — fixed outside the scroll area */}
        <div className="reel-bottom-nav absolute left-0 right-0 bottom-0 z-30 bg-linear-to-t from-[#0A0C10] via-[#0A0C10]/90 to-transparent">
          <button className="flex flex-col items-center justify-center gap-0.5 text-[9.5px] font-bold text-white">
            <span className="w-5.5 h-5.5">
              <Icon.home />
            </span>
            Home
          </button>
          <button className="flex flex-col items-center justify-center gap-0.5 text-[9.5px] font-bold text-white">
            <span className="w-5.5 h-5.5">
              <Icon.search />
            </span>
            Discover
          </button>
          <button
            type="button"
            onClick={() => navigate("/create-food")}
            className="reel-create-button rounded-xl bg-white/20 border border-white/70 flex items-center justify-center shadow-lg text-white"
          >
            <span className="w-5 h-5">
              <Icon.plus />
            </span>
          </button>
          <button className="flex flex-col items-center justify-center gap-0.5 text-[9.5px] font-bold text-white">
            <span className="w-5.5 h-5.5">
              <Icon.bag />
            </span>
            Orders
          </button>
          <button
            type="button"
            onClick={openProfile}
            className="flex flex-col items-center justify-center gap-0.5 text-[9.5px] font-bold text-white"
          >
            <span className="w-5.5 h-5.5">
              <Icon.user />
            </span>
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}
