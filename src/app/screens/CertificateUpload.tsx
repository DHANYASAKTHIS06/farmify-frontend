import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

type VerificationStatus = "idle" | "uploading" | "Pending" | "Approved" | "Rejected";

export default function CertificateUpload() {
  const navigate = useNavigate();
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [certificateId, setCertificateId] = useState("");
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      // If they just signed up, they might not have logged in yet.
      // But we can check if they logged in or we can try to retrieve from login flow.
      // If no token, redirect to login
      navigate("/login");
      return;
    }
    setToken(storedToken);
    checkCurrentStatus(storedToken);
  }, [navigate]);

  const checkCurrentStatus = async (authToken: string) => {
    try {
      const res = await fetch(`${CONFIG_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok && data.farmerProfile) {
        setStatus(data.farmerProfile.verificationStatus || "idle");
        setRejectionRemarks(data.farmerProfile.remarks || "");
        setCertificateId(data.farmerProfile.certificateId || "");
        setCertificateImage(data.farmerProfile.certificate || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCertificateImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateImage || !certificateId.trim()) return;

    setStatus("uploading");

    try {
      const response = await fetch(`${CONFIG_API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          certificate: certificateImage,
          certificateId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit certificate");

      setStatus("Pending");
      setRejectionRemarks("");
    } catch (err: any) {
      alert(err.message);
      setStatus("idle");
    }
  };

  const handleSkip = () => {
    navigate("/farmer-product-upload");
  };

  return (
    <div className="min-h-screen bg-green-50 pb-6">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Certificate Verification</h1>
        </div>
      </div>

      <div className="px-6 pt-6 max-w-md mx-auto">
        {/* Progress Step */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 bg-green-600 rounded-full flex-1"></div>
            <div className="h-2 bg-green-600 rounded-full flex-1"></div>
            <div className="h-2 bg-green-200 rounded-full flex-1"></div>
          </div>
          <p className="text-sm text-green-600 text-center font-bold">
            Step 2 of 3: Certificate Verification
          </p>
        </div>

        {/* Status Indicators */}
        {status === "Pending" && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <Loader2 className="w-6 h-6 text-yellow-600 animate-spin flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-yellow-800 mb-1">Verification Pending</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Your certificate has been uploaded and is under review by our admin team. Reviews typically take 24 hours.
                </p>
                <Badge className="bg-yellow-600 text-white">Pending Approval</Badge>
              </div>
            </div>
          </div>
        )}

        {status === "Approved" && (
          <div className="bg-green-50 border-2 border-green-300 rounded-3xl p-6 mb-6 animate-fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-green-800 mb-1">Certificate Approved!</h3>
                <p className="text-sm text-green-700 mb-3">
                  Congratulations! Your certificate is verified. Your farm is now active and visible to organic buyers.
                </p>
                <Badge className="bg-green-600 text-white">
                  <Shield className="w-3.5 h-3.5 mr-1" /> Approved Organic
                </Badge>
              </div>
            </div>
          </div>
        )}

        {status === "Rejected" && (
          <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-650 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-800 mb-1">Verification Rejected</h3>
                <p className="text-sm text-red-700 mb-3">
                  {rejectionRemarks || "The submitted certificate ID does not match official records. Please verify and resubmit."}
                </p>
                <Badge className="bg-red-500 text-white">Rejected</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Form to submit/re-submit */}
        {(status === "idle" || status === "Rejected" || status === "uploading") && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 font-medium">
                ℹ️ Please upload a scanned copy or photo of your organic farming certificate. This will show a "Verified Organic" badge on your farm details.
              </div>

              {/* Certificate upload field */}
              <div className="space-y-2">
                <Label className="text-green-800 font-bold">Certificate Document Photo *</Label>
                {certificateImage ? (
                  <div className="relative border rounded-xl overflow-hidden">
                    <img src={certificateImage} alt="Certificate" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => setCertificateImage(null)}
                      className="absolute top-2.5 right-2.5 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-green-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-green-500 transition-colors cursor-pointer bg-green-50/20">
                    <Upload className="w-10 h-10 text-green-600 mb-2" />
                    <p className="text-green-750 text-sm font-bold">Select Certificate Photo</p>
                    <p className="text-xs text-green-550 mt-1">PNG, JPG, JPEG up to 5MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Certificate Registration ID */}
              <div className="space-y-2">
                <Label htmlFor="certificateId" className="text-green-800 font-bold">
                  Certificate Registry ID *
                </Label>
                <Input
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="e.g. GOV-ORG-2024-XXXX"
                  className="rounded-xl border-green-200"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={!certificateImage || !certificateId.trim() || status === "uploading"}
                className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-bold shadow-lg"
              >
                {status === "uploading" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                  </span>
                ) : (
                  "Submit for Admin Review"
                )}
              </Button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-green-600 text-sm hover:underline font-semibold"
              >
                Skip for now
              </button>
            </div>
          </form>
        )}

        {(status === "Pending" || status === "Approved") && (
          <Button
            onClick={() => navigate("/farmer-product-upload")}
            className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-bold shadow-md mt-6"
          >
            Continue to Farm Management
          </Button>
        )}
      </div>
    </div>
  );
}
