import { useState } from "react";
import { useNavigate } from "react-router";
import { Sprout, User, Mail, Lock, Phone, MapPin, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"Customer" | "Farmer">("Customer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    locationName: "",
    // Farmer fields
    farmName: "",
    farmDescription: "",
    farmAddress: "",
    farmCategory: "Vegetables",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.contactNumber) {
      setError("Please fill in all basic fields");
      return;
    }

    if (role === "Farmer" && (!formData.farmName || !formData.farmAddress)) {
      setError("Please fill in all Farm details");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        contactNumber: formData.contactNumber,
        locationName: role === "Farmer" ? formData.farmAddress : formData.locationName,
        farmName: role === "Farmer" ? formData.farmName : undefined,
        farmDescription: role === "Farmer" ? formData.farmDescription : undefined,
        farmAddress: role === "Farmer" ? formData.farmAddress : undefined,
        farmCategory: role === "Farmer" ? formData.farmCategory : undefined,
      };

      const response = await fetch(`${CONFIG_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Save email for OTP page
      localStorage.setItem("otpEmail", formData.email);
      localStorage.setItem("otpRole", role);
      navigate("/otp-verification");
    } catch (err: any) {
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/login")}
          className="bg-white p-2 rounded-full shadow-md text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-green-800 font-semibold">Step 1 of 2</span>
      </div>

      {/* Brand */}
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-extrabold text-green-800">Create Account</h1>
        <p className="text-sm text-green-600 font-medium">Join the organic farm community</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        {/* Role Selection Tabs */}
        <div className="flex bg-green-50 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setRole("Customer");
              setError("");
            }}
            className={`flex-1 py-3 text-center rounded-xl font-bold transition-all ${
              role === "Customer" ? "bg-green-600 text-white shadow" : "text-green-700"
            }`}
          >
            I'm a Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("Farmer");
              setError("");
            }}
            className={`flex-1 py-3 text-center rounded-xl font-bold transition-all ${
              role === "Farmer" ? "bg-green-600 text-white shadow" : "text-green-700"
            }`}
          >
            I'm a Farmer
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="name" className="text-green-850 font-bold">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-11 rounded-xl border-green-200"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-green-850 font-bold">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-11 rounded-xl border-green-200"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="contactNumber" className="text-green-850 font-bold">
              Contact Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              <Input
                id="contactNumber"
                placeholder="+91 XXXXX XXXXX"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="pl-11 rounded-xl border-green-200"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password" className="text-green-850 font-bold">
              Password *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-11 rounded-xl border-green-200"
                required
              />
            </div>
          </div>

          {role === "Customer" ? (
            /* Customer Location (Optional) */
            <div className="space-y-1">
              <Label htmlFor="locationName" className="text-green-850 font-bold">
                City / Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                <Input
                  id="locationName"
                  placeholder="Thanjavur, Tamil Nadu"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  className="pl-11 rounded-xl border-green-200"
                />
              </div>
            </div>
          ) : (
            /* Farmer Fields */
            <div className="space-y-4 pt-4 border-t border-green-100">
              <h3 className="font-bold text-green-800 text-lg">Farm Information</h3>

              <div className="space-y-1">
                <Label htmlFor="farmName" className="text-green-850 font-bold">
                  Farm Name *
                </Label>
                <div className="relative">
                  <Sprout className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                  <Input
                    id="farmName"
                    placeholder="Green Valley Farms"
                    value={formData.farmName}
                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    className="pl-11 rounded-xl border-green-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="farmCategory" className="text-green-850 font-bold">
                    Farm Category *
                  </Label>
                  <select
                    id="farmCategory"
                    value={formData.farmCategory}
                    onChange={(e) => setFormData({ ...formData, farmCategory: e.target.value })}
                    className="w-full p-3 bg-white border border-green-200 rounded-xl focus:outline-none focus:border-green-500 font-medium text-green-800"
                  >
                    <option value="Organic Vegetables">Vegetables</option>
                    <option value="Dairy Farm">Dairy Farm</option>
                    <option value="Fruit Orchard">Fruit Orchard</option>
                    <option value="Rice Fields">Rice Fields</option>
                    <option value="Poultry">Poultry</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="farmAddress" className="text-green-850 font-bold">
                  Farm Address *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                  <Input
                    id="farmAddress"
                    placeholder="Complete farm street name and district"
                    value={formData.farmAddress}
                    onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
                    className="pl-11 rounded-xl border-green-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="farmDescription" className="text-green-850 font-bold">
                  Farm Description
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-5 h-5 text-green-600" />
                  <Textarea
                    id="farmDescription"
                    placeholder="Brief description about organic farming methods..."
                    value={formData.farmDescription}
                    onChange={(e) => setFormData({ ...formData, farmDescription: e.target.value })}
                    className="pl-11 rounded-xl border-green-200 min-h-[90px]"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-semibold shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </span>
            ) : (
              "Sign Up & Verify"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-green-750 font-medium">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-green-600 hover:underline font-bold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
