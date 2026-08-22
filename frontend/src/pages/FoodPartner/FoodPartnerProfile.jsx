import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Icon = {
  back: () => <span aria-hidden="true">&#8592;</span>,
  heart: () => <span aria-hidden="true">&#9829;</span>,
  share: () => <span aria-hidden="true">&#8599;</span>,
};

export default function FoodPartnerProfile() {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const [partner, setPartner] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [status, setStatus] = useState("Open");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStore() {
      try {
        const endpoint = partnerId
          ? `http://localhost:3000/api/food-partner/${partnerId}`
          : "http://localhost:3000/api/food-partner/me";
        const { data } = await axios.get(endpoint, { withCredentials: true });
        if (!cancelled) {
          setPartner(data.foodPartner);
          setStatus(data.foodPartner.status || "Open");
          setFoodItems(Array.isArray(data.foodItems) ? data.foodItems : []);
        }

        if (!partnerId) {
          const ordersResponse = await axios.get(
            "http://localhost:3000/api/orders/received",
            { withCredentials: true },
          );
          if (!cancelled) setOrders(ordersResponse.data.orders || []);
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

  const partnerName = partner?.name || "Loading store...";
  const initials = partner?.name?.slice(0, 1).toUpperCase() || "...";
  const totalOrders = foodItems.reduce(
    (total, food) => total + (food.orderCount || 0),
    0,
  );

  const updateOrderStatus = async (orderId, nextStatus) => {
    try {
      const { data } = await axios.patch(
        `http://localhost:3000/api/orders/${orderId}/status`,
        { status: nextStatus },
        { withCredentials: true },
      );
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? data.order : order)),
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update order");
    }
  };

  const toggleStatus = async () => {
    const nextStatus = status === "Open" ? "Closed" : "Open";
    try {
      await axios.patch(
        "http://localhost:3000/api/auth/food-partner/status",
        { status: nextStatus },
        { withCredentials: true },
      );
      setStatus(nextStatus);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Only the logged-in food partner can change this status",
      );
    }
  };
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
            {Icon.back()}
          </button>
          <h1 className="max-w-[65%] truncate font-semibold">{partnerName}</h1>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-xl"
            aria-label="Share store"
          >
            {Icon.share()}
          </button>
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
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={toggleStatus}
                        className={`rounded-full px-3 py-1 text-sm font-bold ${
                          status === "Open"
                            ? "bg-emerald-400/20 text-emerald-300"
                            : "bg-rose-400/20 text-rose-300"
                        }`}
                      >
                        {partner ? status : "..."}
                      </button>
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

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/creare-food")}
                    className="min-h-10 flex-1 rounded-lg border border-white/20 bg-white/10 py-2 text-sm font-bold"
                  >
                    Add food
                  </button>
                  <p className="flex-1 text-center text-xs font-semibold text-white/65">
                    {partnerId ? totalOrders : orders.length}<br />orders received
                  </p>
                </div>
              </section>

              {!partnerId && (
                <section className="border-t border-white/10 px-4 py-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Received orders</h2>
                    <span className="text-xs text-white/50">{orders.length} total</span>
                  </div>
                  {orders.length === 0 ? (
                    <p className="mt-3 text-sm text-white/55">No orders received yet.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {orders.map((order) => (
                        <article key={order._id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{order.user?.fullName || "Customer"}</p>
                              <p className="mt-1 text-xs text-white/55">
                                {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                              </p>
                            </div>
                            <select
                              value={order.status}
                              onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                              className="rounded-lg border border-white/15 bg-[#14171D] px-2 py-2 text-xs"
                              aria-label="Order status"
                            >
                              {['placed', 'preparing', 'delivered', 'cancelled'].map((orderStatus) => (
                                <option key={orderStatus} value={orderStatus}>{orderStatus}</option>
                              ))}
                            </select>
                          </div>
                          <p className="mt-2 text-[11px] text-white/40">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

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
                      <div className="absolute inset-x-0 top-0 flex flex-wrap justify-between gap-x-1 bg-black/60 px-1 py-1 text-[9px] font-semibold leading-tight sm:px-2 sm:text-[10px]">
                        <span>Orders {food.orderCount || 0}</span>
                        <span>Likes {food.likes || 0}</span>
                        <span>Comments {food.comments || 0}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
