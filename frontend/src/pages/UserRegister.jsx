import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const UserRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
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
      const res = await axios.post(
        "http://localhost:3000/api/auth/user/register",
        formData,
        { withCredentials: true }
      );
      console.log("Registered:", res.data);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page w-full flex items-center justify-center bg-linear-to-br from-teal-50 via-emerald-50 to-cyan-50">
      <div className="auth-card bg-white/90 backdrop-blur text-gray-600 text-left text-sm rounded-2xl shadow-xl shadow-teal-900/10 border border-teal-100">
        <h2 className="auth-title font-bold mb-1 text-center text-emerald-900">
          Create your account
        </h2>
        <p className="text-center text-teal-600/70 mb-6">
          Join us and get started in seconds
        </p>

        {error && (
          <p className="text-rose-500 text-center mb-3 bg-rose-50 rounded-full py-1.5 px-3">
            {error}
          </p>
        )}

        <form className="w-full" onSubmit={handleSubmit}>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full bg-teal-50/50 border my-3 border-teal-500/20 outline-none rounded-full py-2.5 px-4 min-w-0 focus:border-teal-500 focus:bg-white transition-colors"
            type="text"
            placeholder="Enter your Full name"
            required
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-teal-50/50 border my-3 border-teal-500/20 outline-none rounded-full py-2.5 px-4 min-w-0 focus:border-teal-500 focus:bg-white transition-colors"
            type="email"
            placeholder="Enter your email"
            required
          />
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-teal-50/50 border mt-1 border-teal-500/20 outline-none rounded-full py-2.5 px-4 min-w-0 focus:border-teal-500 focus:bg-white transition-colors"
            type="password"
            placeholder="Enter your password"
            required
          />
          <div className="text-right py-4">
            <button
              type="submit"
              disabled={loading}
              className="auth-submit w-full mb-3 bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 py-2.5 rounded-full text-white font-medium shadow-md shadow-teal-500/30 transition-all disabled:opacity-60"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>

        <p className="text-center mt-4 wrap-break-word text-gray-500">
          Already have an Account?{" "}
          <Link to="/user/login" className="text-teal-600 font-medium underline decoration-teal-300">
            Login
          </Link>
        </p>

        <button
          type="button"
          className="w-full flex items-center gap-2 justify-center mt-5 bg-gray-900 hover:bg-black py-2.5 px-4 rounded-full text-white transition-colors"
        >
          <img
            className="h-4 w-4 shrink-0"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/appleLogo.png"
            alt="appleLogo"
          />
          <span className="truncate">Log in with Apple</span>
        </button>

        <button
          type="button"
          className="w-full flex items-center gap-2 justify-center my-3 bg-white border border-teal-500/20 hover:bg-teal-50 py-2.5 px-4 rounded-full text-gray-700 transition-colors"
        >
          <img
            className="h-4 w-4 shrink-0"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleFavicon.png"
            alt="googleFavicon"
          />
          <span className="truncate">Log in with Google</span>
        </button>

        <button
          onClick={() => navigate("/food-partner/register")}
          type="button"
          className="w-full flex items-center gap-2 justify-center my-3 bg-linear-to-r from-orange-50 to-amber-50 border border-orange-200 hover:from-orange-100 hover:to-amber-100 py-2.5 px-4 rounded-full text-orange-700 font-medium transition-all"
        >
          <span className="truncate">🍽️ Register your business</span>
        </button>
      </div>
    </div>
  );
};

export default UserRegister;