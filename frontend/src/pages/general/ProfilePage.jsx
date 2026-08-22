import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Icon = {
  back: () => <span aria-hidden="true">&#8592;</span>,
  play: () => <span aria-hidden="true">&#9654;</span>,
  logout: () => <span aria-hidden="true">&#8594;</span>,
  bookmark: () => <span aria-hidden="true">&#9733;</span>,
  heart: () => <span aria-hidden="true">&#9829;</span>,
  bag: () => <span aria-hidden="true">&#9632;</span>,
  chevron: () => <span aria-hidden="true">&#8250;</span>,
};

function VideoGrid({ items }) {
  if (!items.length) {
    return (
      <p className="px-5 py-8 text-center text-sm text-white/55">
        No videos here yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 px-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item._id}
          className="relative aspect-9/14 overflow-hidden rounded-xl bg-white/10"
        >
          <video
            className="h-full w-full object-cover"
            src={item.video}
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 pt-8 text-xs font-semibold text-white">
            <span className="mr-1">{Icon.play()}</span>
            {item.name}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptySection({ icon, title, description }) {
  return (
    <section className="flex min-h-24 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl text-white">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs leading-snug text-white/55">{description}</p>
      </span>
      <span className="text-2xl text-white/45">{Icon.chevron()}</span>
    </section>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  const handleProfileImageChange = async (event) => {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;

    setError("");
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("profileImage", image);

    try {
      const response = await axios.patch(
        "http://localhost:3000/api/auth/user/profile-image",
        formData,
        { withCredentials: true },
      );
      setProfile((currentProfile) => ({
        ...currentProfile,
        profileImage: response.data.profileImage,
      }));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update your profile image.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/api/auth/user/logout", {
        withCredentials: true,
      });
      navigate("/user/login");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to log out");
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const [profileResponse, ordersResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/auth/user/me", { withCredentials: true }),
          axios.get("http://localhost:3000/api/orders/mine", { withCredentials: true }),
        ]);

        if (!cancelled) {
          setProfile({
            ...profileResponse.data.user,
            orders: ordersResponse.data.orders || [],
          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load your profile. Please log in again.",
          );
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const name = profile?.fullName || "Loading profile...";
  const initials =
    profile?.fullName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const likedVideos = Array.isArray(profile?.likedVideos)
    ? profile.likedVideos
    : [];
  const followedPartners = Array.isArray(profile?.followingFoodPartners)
    ? profile.followingFoodPartners
    : [];
  const livePartners = Array.isArray(profile?.livePartners)
    ? profile.livePartners
    : [];
  const orders = Array.isArray(profile?.orders) ? profile.orders : [];

  return (
    <main className="auth-page flex w-full items-center justify-center bg-black">
      <div className="relative flex h-dvh w-full max-w-105 flex-col overflow-hidden bg-[#0A0C10] text-white sm:max-h-228 sm:rounded-[36px] sm:ring-10 sm:ring-black">
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pb-3 pt-[calc(14px+env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center text-2xl"
            aria-label="Go back"
          >
            {Icon.back()}
          </button>
          <h1 className="font-semibold">My profile</h1>
          <span className="h-10 w-10" aria-hidden="true" />
        </header>

        <div className="flex-1 overflow-y-auto pb-8">
          <section className="px-4 pb-5 pt-6">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-teal-400 via-emerald-500 to-cyan-400 text-2xl font-bold text-white ring-2 ring-white/80 ring-offset-4 ring-offset-[#0A0C10] disabled:opacity-60"
                aria-label="Change profile image"
              >
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={`${name}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/65 py-1 text-[10px] font-medium">
                  {uploadingImage ? "Uploading" : "Change"}
                </span>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
              <div className="grid flex-1 grid-cols-3 text-center">
                <div>
                  <p className="text-lg font-bold">{likedVideos.length}</p>
                  <p className="text-xs text-white/55">liked</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{followedPartners.length}</p>
                  <p className="text-xs text-white/55">following</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{orders.length}</p>
                  <p className="text-xs text-white/55">orders</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h2 className="font-bold">{name}</h2>
              <p className="mt-1 text-sm text-white/60">
                {profile?.email || "Loading account details..."}
              </p>
              <p className="mt-2 text-sm text-white/65">
                Discovering delicious food, one video at a time.
              </p>
            </div>
            {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

          </section>

          <div className="space-y-3 px-4">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="font-semibold text-white">Account details</h2>
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex justify-between gap-4">
                  <span className="text-white/50">Full name</span>
                  <span className="text-right">{profile?.fullName || "-"}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-white/50">Joined</span>
                  <span className="text-right">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 py-4">
              <div className="flex items-center justify-between px-4">
                <h2 className="font-semibold text-white">Liked videos</h2>
                <span className="text-xs text-white/50">{likedVideos.length} liked</span>
              </div>
              <div className="mt-3">
                <VideoGrid items={likedVideos} />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Followed partners</h2>
                <span className="text-xs text-white/50">{livePartners.length} total</span>
              </div>
              {livePartners.length === 0 ? (
                <p className="mt-3 text-sm text-white/55">No followed food partners yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {livePartners.map((partner) => (
                    <button
                      key={partner._id}
                      type="button"
                      onClick={() => navigate(`/food-partner/${partner._id}`)}
                      className="flex min-h-11 w-full items-center justify-between rounded-xl bg-white/10 px-3 text-left"
                    >
                      <span className="font-semibold">{partner.name}</span>
                      <span
                        className={`text-xs ${
                          partner.status === "Open"
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }`}
                      >
                        {partner.status || "Closed"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Orders</h2>
                <span className="text-xs text-white/50">{orders.length} total</span>
              </div>
              {orders.length === 0 ? (
                <p className="mt-3 text-sm text-white/55">No orders found.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {orders.map((order, index) => (
                    <div key={order._id || index} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm">
                      <span>
                        {order.items?.map((item) => `${item.name} x${item.quantity}`).join(", ") || order.food?.name || "Food order"}
                      </span>
                      <span className="capitalize text-white/60">{order.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="grid gap-3 sm:grid-cols-2">
              <EmptySection
                icon={Icon.bookmark()}
                title="Followers"
                description={`${followedPartners.length} food partners followed.`}
              />
              <EmptySection
                icon={Icon.bag()}
                title="Ordered food"
                description={`${orders.length} orders from your database.`}
              />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 py-3 text-sm font-bold text-rose-300"
            >
              <span>{Icon.logout()}</span>
              Log out
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}