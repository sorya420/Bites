import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function FoodPartnerStore() {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const [partner, setPartner] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStore() {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/food-partner/${partnerId}`,
          { withCredentials: true },
        );
        if (!cancelled) {
          setPartner(data.foodPartner);
          setFoodItems(Array.isArray(data.foodItems) ? data.foodItems : []);
          setIsFollowing(Boolean(data.isFollowing));
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load this food partner",
          );
        }
      }
    }

    loadStore();
    return () => {
      cancelled = true;
    };
  }, [partnerId]);

  const toggleFollow = async () => {
    try {
      const { data } = await axios.patch(
        `http://localhost:3000/api/auth/user/follow/${partnerId}`,
        {},
        { withCredentials: true },
      );
      setIsFollowing(data.following);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Please log in to follow this food partner",
      );
    }
  };

  const updateCart = (foodId, quantity) => {
    setCart((current) => {
      const next = { ...current };
      if (quantity > 0) next[foodId] = quantity;
      else delete next[foodId];
      return next;
    });
    setError("");
  };

  const placeOrder = async () => {
    const items = Object.entries(cart).map(([food, quantity]) => ({
      food,
      quantity,
    }));
    if (!items.length) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        "http://localhost:3000/api/orders",
        { items },
        { withCredentials: true },
      );
      setCart({});
      setError("");
      window.alert("Your order has been placed.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnerName = partner?.name || "Loading store...";
  const initials = partner?.name?.slice(0, 1).toUpperCase() || "...";
  const cartItems = Object.entries(cart).map(([foodId, quantity]) => ({
    food: foodItems.find((item) => item._id === foodId),
    quantity,
  })).filter((item) => item.food);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className="auth-page flex w-full items-center justify-center bg-black">
      <div className="relative flex h-dvh w-full max-w-105 min-w-0 flex-col overflow-hidden bg-[#0A0C10] text-white sm:max-h-228 sm:rounded-[36px] sm:ring-10 sm:ring-black">
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pb-3 pt-[calc(14px+env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center text-2xl"
            aria-label="Go back"
          >
            &#8592;
          </button>
          <h1 className="max-w-[65%] truncate font-semibold">{partnerName}</h1>
          <span className="h-10 w-10" aria-hidden="true" />
        </header>

        <div className="flex-1 overflow-y-auto">
          {error ? (
            <p className="px-6 py-16 text-center text-rose-300">{error}</p>
          ) : (
            <>
              <section className="px-4 pb-5 pt-6">
                <div className="flex items-center gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-400 via-rose-500 to-teal-400 text-3xl font-bold ring-2 ring-white/80 ring-offset-4 ring-offset-[#0A0C10]">
                    {initials}
                  </div>
                  <div className="grid min-w-0 flex-1 grid-cols-2 text-center">
                    <div>
                      <p className="text-lg font-bold">{foodItems.length}</p>
                      <p className="text-xs text-white/55">Meals</p>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          partner?.status === "Open"
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }`}
                      >
                        {partner?.status || "..."}
                      </p>
                      <p className="mt-1 text-xs text-white/55">status</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="font-bold">{partnerName}</h2>
                  <p className="mt-1 text-sm text-white/65">
                    Fresh food videos and dishes from this partner.
                  </p>
                  {partner?.address && (
                    <p className="mt-2 text-xs text-white/55">{partner.address}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={toggleFollow}
                  className={`mt-4 min-h-10 w-full rounded-xl py-2 font-bold ${
                    isFollowing
                      ? "border border-white/20 bg-white/10 text-white"
                      : "bg-orange-400 text-black"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow partner"}
                </button>
              </section>

              {foodItems.length === 0 ? (
                <p className="px-6 py-16 text-center text-sm text-white/55">
                  No food videos yet.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-0.5 bg-[#0A0C10]">
                  {foodItems.map((food) => (
                    <article key={food._id} className="relative aspect-square bg-white/10">
                      <video
                        className="h-full w-full object-cover"
                        src={food.video}
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-black/80 to-transparent px-2 pb-2 pt-6 text-xs font-semibold">
                        {food.name}
                      </div>
                      <div className="absolute inset-x-1 bottom-1 flex items-center justify-between rounded-lg bg-black/75 px-1 py-1 text-xs">
                        <button
                          type="button"
                          onClick={() => updateCart(food._id, (cart[food._id] || 0) - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-lg"
                          aria-label={`Remove one ${food.name}`}
                        >
                          -
                        </button>
                        <span>{cart[food._id] || 0}</span>
                        <button
                          type="button"
                          onClick={() => updateCart(food._id, (cart[food._id] || 0) + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-400 text-lg text-black"
                          aria-label={`Add one ${food.name}`}
                        >
                          +
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {cartCount > 0 && (
          <div className="shrink-0 border-t border-white/10 bg-[#14171D] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{cartCount} item{cartCount === 1 ? "" : "s"}</p>
                <p className="text-xs text-white/55">Ready to send to {partnerName}</p>
              </div>
              <button
                type="button"
                onClick={placeOrder}
                disabled={isSubmitting}
                className="rounded-xl bg-orange-400 px-4 py-3 text-sm font-bold text-black disabled:opacity-50"
              >
                {isSubmitting ? "Placing..." : "Place order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
