import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShieldAlert, Lock, Sprout, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      navigate("/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !newPassword) {
      setError("Please enter the 6-digit OTP and new password");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${CONFIG_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setMessage("Password updated successfully! Redirecting...");
      localStorage.removeItem("resetEmail");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Reset failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex items-center mb-6">
        <button
          onClick={() => navigate("/forgot-password")}
          className="bg-white p-2 rounded-full shadow-md text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="bg-green-600 p-4 rounded-full mb-3 shadow-lg">
          <ShieldAlert className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-green-800">New Password</h1>
        <p className="text-sm text-green-650 font-medium">Verify code and update credentials</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <p className="text-sm text-green-700">Enter OTP sent to:</p>
          <p className="font-bold text-green-800 break-all">{email}</p>
        </div>

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

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="otp" className="text-green-800 font-bold block text-center">
              Verification Code (OTP)
            </Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              className="text-center text-2xl font-bold tracking-widest rounded-xl border-green-200"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-green-800 font-bold">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              <Input
                id="password"
                type="password"
                placeholder="Choose strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-11 rounded-xl border-green-200"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-bold shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting Password...
              </span>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
