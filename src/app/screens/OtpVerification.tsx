import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

export default function OtpVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const storedEmail = localStorage.getItem("otpEmail");
    const storedRole = localStorage.getItem("otpRole") || "Customer";
    if (!storedEmail) {
      navigate("/login");
      return;
    }
    setEmail(storedEmail);
    setRole(storedRole);
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP code");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${CONFIG_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setMessage("Email verified successfully!");
      localStorage.removeItem("otpEmail");

      setTimeout(() => {
        if (role === "Farmer") {
          // Farmers go to upload certificates
          navigate("/certificate-upload");
        } else {
          // Customers go to login
          navigate("/login");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Invalid OTP code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${CONFIG_API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setMessage("A new OTP has been sent to your email!");
      setTimeLeft(300); // Reset timer
    } catch (err: any) {
      setError(err.message || "Resend failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/register")}
          className="bg-white p-2 rounded-full shadow-md text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-green-800 font-semibold">Step 2 of 2</span>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="bg-green-600 p-4 rounded-full mb-3 shadow-lg animate-bounce">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-green-800">Verify Email</h1>
        <p className="text-sm text-green-650 font-medium">OTP Verification Code</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <p className="text-sm text-green-700 font-medium">
            We have sent a 6-digit OTP verification code to:
          </p>
          <p className="font-bold text-green-800 break-all mt-1">{email}</p>
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

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-green-800 font-bold block text-center">
              Enter 6-Digit OTP Code
            </Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              className="text-center text-3xl font-bold tracking-widest py-6 rounded-2xl border-green-200 focus:border-green-600"
              required
            />
          </div>

          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-green-700 font-medium">
                Code expires in: <span className="font-bold text-green-800">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600 font-medium">Code expired</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-bold shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-green-50 text-center">
          <p className="text-sm text-green-750 font-medium">
            Didn't receive the email?{" "}
            <button
              onClick={handleResend}
              disabled={isLoading || timeLeft > 240} // limit resends within 1 min
              className="text-green-600 hover:underline font-bold disabled:opacity-50"
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
