import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Sprout, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${CONFIG_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to request code");
      }

      setMessage("Password reset code sent to your email!");
      localStorage.setItem("resetEmail", email);

      setTimeout(() => {
        navigate("/reset-password");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex items-center mb-6">
        <button
          onClick={() => navigate("/login")}
          className="bg-white p-2 rounded-full shadow-md text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="bg-green-600 p-4 rounded-full mb-3 shadow-lg">
          <Sprout className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-green-800">Forgot Password</h1>
        <p className="text-sm text-green-650 font-medium">Reset your farm connection</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <p className="text-sm text-green-700 font-medium text-center mb-6">
          Enter your registered email address and we'll send you a 6-digit OTP code to verify and reset your password.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-750 text-sm rounded-xl p-3 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-green-800 font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 rounded-xl border-green-200"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-semibold shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Requesting OTP...
              </span>
            ) : (
              "Send Reset Code"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
