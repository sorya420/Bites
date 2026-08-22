import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const FoodPartnerLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(
        "https://bites-rho.vercel.app/api/auth/food-partner/login",
        formData,
        { withCredentials: true }
      );
      navigate("/food-partner/home");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page w-full flex items-center justify-center bg-linear-to-br from-orange-50 via-amber-50 to-teal-50">
      <div className="auth-card bg-white/90 backdrop-blur text-gray-600 text-left text-sm rounded-2xl shadow-xl shadow-orange-900/10 border border-orange-100">
        <h2 className="auth-title font-bold mb-1 text-center text-orange-900">
          🍽️ Partner Login
        </h2>
        <p className="text-center text-orange-600/70 mb-6">
          Log in to manage your orders
        </p>

        {error && (
          <p className="text-rose-500 text-center mb-3 bg-rose-50 rounded-full py-1.5 px-3">
            {error}
          </p>
        )}

        <form className="w-full" onSubmit={handleSubmit}>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-orange-50/50 border my-3 border-orange-500/20 outline-none rounded-full py-2.5 px-4 min-w-0 focus:border-orange-500 focus:bg-white transition-colors"
            type="email"
            placeholder="Email"
            required
          />
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-orange-50/50 border mt-1 border-orange-500/20 outline-none rounded-full py-2.5 px-4 min-w-0 focus:border-orange-500 focus:bg-white transition-colors"
            type="password"
            placeholder="Password"
            required
          />
          <div className="text-right py-4">
            <a className="text-orange-600 underline decoration-orange-300" href="#">
              Forgot Password
            </a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="auth-submit w-full mb-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-2.5 rounded-full text-white font-medium shadow-md shadow-orange-500/30 transition-all disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center mt-4 wrap-break-word text-gray-500">
          New partner?{" "}
          <Link to="/food-partner/register" className="text-orange-600 font-medium underline decoration-orange-300">
            Register your business
          </Link>
          <button
          onClick={() => navigate("/user/register")}
          type="button"
          className="w-full flex items-center gap-2 justify-center mt-4 bg-teal-50 border border-teal-500/20 hover:bg-teal-100 py-2.5 px-4 rounded-full text-teal-700 font-medium transition-colors"
        >
          <span className="truncate">Continue as normal user</span>
        </button>
        </p>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;