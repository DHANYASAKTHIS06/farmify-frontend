import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Upload,
  Calendar,
  Loader2,
  CheckCircle,
  Edit,
  Trash2,
  X,
  Clock,
  Sprout,
  MapPin,
  Leaf,
  CalendarCheck,
  User,
  Power,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

type BookingObj = {
  _id: string;
  bookingDate: string;
  bookingTime: string;
  bookingStatus: "Pending" | "Accepted" | "Rejected";
  customerId: { name: string; contactNumber: string; email: string };
  farmId: { farmName: string };
};

export default function FarmerProductUpload() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [user, setUser] = useState<any>(null);
  const [farm, setFarm] = useState<any>(null);
  const [bookings, setBookings] = useState<BookingObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Farm Form State
  const [farmName, setFarmName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Organic Vegetables");
  const [pricing, setPricing] = useState("");
  const [availability, setAvailability] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/login");
      return;
    }
    setToken(storedToken);
    loadFarmerData(storedToken);
  }, [navigate]);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const loadFarmerData = async (authToken: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile to get user details
      const profileRes = await fetch(`${CONFIG_API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.message);
      
      const baseUser = profileData.baseUser;
      setUser(baseUser);

      // 2. Fetch Farm list from public search and find this farmer's farm
      const farmRes = await fetch(`${CONFIG_API_URL}/api/search`);
      const farmData = await farmRes.json();
      if (farmRes.ok) {
        const myFarm = farmData.find((f: any) => f.farmerId?._id === baseUser._id || f.farmerId === baseUser._id);
        if (myFarm) {
          setFarm(myFarm);
          setFarmName(myFarm.farmName || "");
          setDescription(myFarm.description || "");
          setAddress(myFarm.location?.address || myFarm.address || "");
          setCategory(myFarm.category || "Organic Vegetables");
          setPricing(myFarm.pricing?.toString() || "");
          setAvailability(myFarm.availability !== undefined ? myFarm.availability : true);
          setExistingImages(myFarm.images || []);
          setImages(myFarm.images || []);
        }
      }

      // 3. Fetch Bookings for this farmer
      const bookRes = await fetch(`${CONFIG_API_URL}/api/bookings/farmer`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setBookings(bookData);
      }
    } catch (err) {
      console.error("Error loading farmer data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const previewToRemove = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));

    if (previewToRemove.startsWith("data:")) {
      // Newly uploaded image
      // Find the index among newly uploaded files
      const newUploadIndex = images.slice(0, index).filter(img => img.startsWith("data:")).length;
      setImageFiles((prev) => prev.filter((_, i) => i !== newUploadIndex));
    } else {
      // Existing Cloudinary image
      setExistingImages((prev) => prev.filter(url => url !== previewToRemove));
    }
  };

  const handleFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || !address || !pricing) {
      alert("Please fill in name, address, and pricing");
      return;
    }

    setIsSubmitLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append("farmName", farmName);
      dataPayload.append("description", description);
      dataPayload.append("category", category);
      dataPayload.append("pricing", pricing);
      dataPayload.append("availability", availability.toString());
      dataPayload.append("address", address);
      dataPayload.append("lat", "10.787"); // Default location coordinates
      dataPayload.append("lng", "79.1378");

      // Append new files
      imageFiles.forEach((file) => {
        dataPayload.append("images", file);
      });

      // If updating, use PUT /api/farms/:id; if creating, use POST /api/farms
      const isEdit = !!farm;
      const url = isEdit ? `${CONFIG_API_URL}/api/farms/${farm._id}` : `${CONFIG_API_URL}/api/farms`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataPayload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update farm details");

      triggerToast(isEdit ? "Farm details updated successfully!" : "Farm registered successfully!");
      setImageFiles([]); // Clear new uploads state
      loadFarmerData(token);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, status: "Accepted" | "Rejected") => {
    try {
      const res = await fetch(`${CONFIG_API_URL}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingStatus: status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update booking");

      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, bookingStatus: status } : b))
      );
      triggerToast(`Booking visit request ${status.toLowerCase()}!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const activeBookings = bookings.filter((b) => b.bookingStatus === "Accepted");
  const pendingBookings = bookings.filter((b) => b.bookingStatus === "Pending");
  const historyBookings = bookings.filter((b) => b.bookingStatus === "Rejected");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 pb-12">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-2">
          <Sprout className="w-7 h-7 text-white" />
          <h1 className="text-xl font-bold">Farmer Dashboard</h1>
        </div>
        <Button
          onClick={() => navigate("/profile")}
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl"
        >
          My Profile
        </Button>
      </div>

      {/* Toast Alert */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="px-4 pt-6 max-w-2xl mx-auto">
        <Tabs defaultValue="farm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-2xl p-1 shadow-sm">
            <TabsTrigger value="farm" className="rounded-xl font-bold py-3">
              My Farm Profile
            </TabsTrigger>
            <TabsTrigger value="visits" className="rounded-xl font-bold py-3 flex gap-2 items-center justify-center">
              Visits Calendar
              {pendingBookings.length > 0 && (
                <Badge className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full p-0 flex items-center justify-center font-bold">
                  {pendingBookings.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* FARM MANAGEMENT TAB */}
          <TabsContent value="farm">
            <form onSubmit={handleFarmSubmit} className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm p-6 space-y-6 border border-green-50">
                <h3 className="text-lg font-bold text-green-800 border-b border-green-50 pb-2">
                  {farm ? "Update Farm Details" : "Register Your Farm"}
                </h3>

                {/* Farm Name */}
                <div className="space-y-2">
                  <Label htmlFor="farmName" className="text-green-800 font-bold">Farm Name *</Label>
                  <Input
                    id="farmName"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Green Valley Farm"
                    className="rounded-xl border-green-200"
                    required
                  />
                </div>

                {/* Farm Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-green-800 font-bold">Category *</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-white border border-green-250 rounded-xl text-green-800 font-medium"
                  >
                    <option value="Organic Vegetables">Organic Vegetables</option>
                    <option value="Dairy Farm">Dairy Farm</option>
                    <option value="Fruit Orchard">Fruit Orchard</option>
                    <option value="Rice Fields">Rice Fields</option>
                    <option value="Poultry">Poultry</option>
                  </select>
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                  <Label htmlFor="pricing" className="text-green-800 font-bold">Visit Price (₹ per visit) *</Label>
                  <Input
                    id="pricing"
                    type="number"
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value)}
                    placeholder="e.g. 50"
                    className="rounded-xl border-green-200"
                    required
                  />
                </div>

                {/* Availability Switch */}
                <div className="flex items-center justify-between bg-green-50/50 p-4 rounded-2xl border border-green-100">
                  <div className="space-y-0.5">
                    <Label htmlFor="availability" className="text-green-800 font-bold">Accepting Visitors</Label>
                    <p className="text-xs text-green-600">Toggle whether customer visits are open.</p>
                  </div>
                  <Switch
                    id="availability"
                    checked={availability}
                    onCheckedChange={setAvailability}
                  />
                </div>

                {/* Farm Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-green-800 font-bold">Farm Address *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Complete address for directions routing"
                    className="rounded-xl border-green-200"
                    required
                  />
                </div>

                {/* Farm Description */}
                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-green-800 font-bold">Farm Description</Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your organic methods or visitor rules..."
                    className="rounded-xl border-green-200 min-h-[100px]"
                  />
                </div>

                {/* Farm Images Upload (Multiple) */}
                <div className="space-y-2">
                  <Label className="text-green-800 font-bold">Farm Gallery Images</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden border border-green-150 h-28">
                        <img src={img} alt="Farm" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-650 shadow"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    <label className="border-2 border-dashed border-green-300 rounded-xl flex flex-col items-center justify-center hover:border-green-500 transition-colors cursor-pointer bg-green-50/20 h-28">
                      <Upload className="w-7 h-7 text-green-600 mb-1" />
                      <span className="text-xs text-green-700 font-bold">Upload Image</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-bold shadow-md"
                >
                  {isSubmitLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Updating...
                    </span>
                  ) : (
                    "Save Farm Profile"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* VISITS CALENDAR TAB */}
          <TabsContent value="visits">
            <div className="space-y-6 animate-fade-in">
              {/* PENDING VISITS REQUESTS */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-50 space-y-4">
                <h3 className="text-base font-extrabold text-green-850 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending Visit Requests ({pendingBookings.length})
                </h3>

                {pendingBookings.length === 0 ? (
                  <p className="text-xs text-green-600 text-center py-4">No pending visit requests from customers.</p>
                ) : (
                  <div className="space-y-4 divide-y divide-green-50">
                    {pendingBookings.map((b, index) => (
                      <div key={b._id} className={`${index > 0 ? "pt-4" : ""} space-y-2`}>
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-green-800 text-sm">
                              Visitor: {b.customerId?.name || "Customer"}
                            </span>
                            <span className="text-xs text-green-750 font-bold bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                              ₹{pricing} visit fee
                            </span>
                          </div>
                          <p className="text-xs text-green-650 mt-1">
                            📅 {new Date(b.bookingDate).toDateString()} at {b.bookingTime}
                          </p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-1">
                            Contact: {b.customerId?.contactNumber} | {b.customerId?.email}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleBookingAction(b._id, "Accepted")}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl flex-1 text-xs py-3"
                          >
                            Accept Booking
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBookingAction(b._id, "Rejected")}
                            className="border-red-200 text-red-650 hover:bg-red-50 rounded-xl flex-1 text-xs py-3"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* UPCOMING ACCEPTED VISITS */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-50 space-y-4">
                <h3 className="text-base font-extrabold text-green-850 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-green-600" />
                  Upcoming Visits / Schedule ({activeBookings.length})
                </h3>

                {activeBookings.length === 0 ? (
                  <p className="text-xs text-green-600 text-center py-4">No upcoming scheduled visits.</p>
                ) : (
                  <div className="space-y-3 divide-y divide-green-50">
                    {activeBookings.map((b, index) => (
                      <div key={b._id} className={`${index > 0 ? "pt-3.5" : ""} text-sm flex justify-between items-center`}>
                        <div>
                          <p className="font-bold text-green-800 text-sm">
                            {b.customerId?.name || "Customer"}
                          </p>
                          <p className="text-xs text-green-650 mt-0.5">
                            📅 {new Date(b.bookingDate).toLocaleDateString()} at {b.bookingTime}
                          </p>
                          <p className="text-[10px] text-gray-450 mt-0.5 font-medium">
                            Phone: {b.customerId?.contactNumber || "N/A"}
                          </p>
                        </div>
                        <Badge className="bg-green-600 text-white">Accepted</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}