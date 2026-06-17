const API_BASE_URL = "http://localhost:5000"; // Fallback URL or config
import { useState } from "react";
import { useNavigate } from "react-router";
import { Sprout, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${CONFIG_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.notVerified) {
          // Redirect to OTP verification
          localStorage.setItem("otpEmail", data.email);
          navigate("/otp-verification");
          return;
        }
        throw new Error(data.message || "Invalid credentials");
      }

      // Save token & user to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Role based routing
      if (data.user.role === "Admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "Farmer") {
        // Go to farmer product/farm management
        navigate("/farmer-product-upload");
      } else {
        // Customer goes to home
        navigate("/home");
      }
    } catch (err: any) {
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center px-6 py-12">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-green-600 p-4 rounded-full mb-3 shadow-lg">
          <Sprout className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-green-800">FARMIFY</h1>
        <p className="text-sm text-green-700 font-medium">Your Organic Farm Connect</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Welcome Back</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-green-800 font-semibold">
              Email Address / Username
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              <Input
                id="email"
                type="text"
                placeholder="Enter email or 'admin'"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 rounded-xl border-green-200 focus:border-green-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-green-800 font-semibold">
                Password
              </Label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-green-600 hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 rounded-xl border-green-200 focus:border-green-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-semibold shadow-lg transition-all"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-green-50 text-center">
          <p className="text-sm text-green-700 font-medium">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-green-600 hover:underline font-bold"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
