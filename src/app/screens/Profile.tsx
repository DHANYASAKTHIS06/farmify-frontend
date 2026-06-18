import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Settings,
  LogOut,
  History,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Loader2,
  DollarSign,
  Briefcase,
  KeyRound,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

type BookingHistoryObj = {
  _id: string;
  bookingDate: string;
  bookingTime: string;
  bookingStatus: "Pending" | "Accepted" | "Rejected";
  farmId: { farmName: string; address: string; pricing: number };
  farmerId?: { name: string; contactNumber: string };
  customerId?: { name: string; contactNumber: string };
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<BookingHistoryObj[]>([]);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [locationName, setLocationName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  // Farmer form states
  const [farmName, setFarmName] = useState("");
  const [farmDescription, setFarmDescription] = useState("");
  const [farmAddress, setFarmAddress] = useState("");
  const [farmCategory, setFarmCategory] = useState("");
  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/login");
      return;
    }
    setToken(storedToken);
    loadUserProfile(storedToken);
  }, [navigate]);

  const loadUserProfile = async (authToken: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile
      const res = await fetch(`${CONFIG_API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const baseUser = data.baseUser;
      setUser(baseUser);
      setName(baseUser?.name || "");
      setProfilePicture(baseUser?.profilePicture || "");

      const isFarmer = baseUser?.role === "Farmer";
      const detailedFarmer = data.detailedFarmer;
      
      if (isFarmer && detailedFarmer) {
        setFarmerProfile(detailedFarmer);
        setContactNumber(detailedFarmer.contactNumber || "");
        setFarmName(detailedFarmer.farmName || "");
        setFarmDescription(detailedFarmer.description || "");
        setFarmAddress(detailedFarmer.address || "");
        setFarmCategory(detailedFarmer.category || "");
      } else {
        setContactNumber(baseUser?.contactNumber || "");
        setLocationName(baseUser?.locationName || "");
      }

      // 2. Fetch User bookings based on role
      const bookingEndpoint = isFarmer ? "farmer" : "customer";
      const bookRes = await fetch(`${CONFIG_API_URL}/api/bookings/${bookingEndpoint}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const bookData = await bookRes.json();
      if (bookRes.ok) {
        setBookings(bookData);
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataPayload = new FormData();
      dataPayload.append("name", name);
      dataPayload.append("contactNumber", contactNumber);
      
      if (profilePictureFile) {
        dataPayload.append("profilePicture", profilePictureFile);
      }

      if (user?.role === "Farmer") {
        dataPayload.append("farmName", farmName);
        dataPayload.append("description", farmDescription);
        dataPayload.append("address", farmAddress);
        dataPayload.append("contactNumber", contactNumber); // Also update farmer contact
      }

      const res = await fetch(`${CONFIG_API_URL}/api/profile/edit`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataPayload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setShowEditDialog(false);
      triggerToast("Profile updated successfully!");
      // Reload profile
      loadUserProfile(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;

    try {
      const dataPayload = new FormData();
      dataPayload.append("password", newPassword);

      const res = await fetch(`${CONFIG_API_URL}/api/profile/edit`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataPayload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setShowPasswordDialog(false);
      setOldPassword("");
      setNewPassword("");
      triggerToast("Password updated successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">My Profile</h1>
        </div>
        <button
          onClick={() => setShowEditDialog(true)}
          className="text-xs bg-white/20 px-3.5 py-2 rounded-xl font-bold border border-white/10 hover:bg-white/30"
        >
          Edit Profile
        </button>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold">
            <CheckCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="px-4 pt-6 space-y-6 max-w-xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-green-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-1 rounded-full relative w-20 h-20 overflow-hidden border border-green-200">
              {profilePicture ? (
                <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-full h-full text-green-600 p-2" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-green-800">{user?.name}</h2>
                <Badge className={user?.role === "Farmer" ? "bg-blue-600" : "bg-green-600"}>
                  {user?.role}
                </Badge>
              </div>
              <p className="text-xs text-green-600 font-medium break-all">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3.5 border-t border-green-50 pt-4 text-sm font-medium">
            <div className="flex items-center gap-3 text-green-700">
              <Phone className="w-4 h-4" />
              <span>{user?.contactNumber || "No phone added"}</span>
            </div>
            <div className="flex items-center gap-3 text-green-700">
              <MapPin className="w-4 h-4" />
              <span>{user?.locationName || "No location set"}</span>
            </div>
          </div>
        </div>

        {/* FARMER SUMMARY PANEL */}
        {user?.role === "Farmer" && farmerProfile && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-150 flex flex-col justify-between">
              <div className="text-green-600 text-xs font-bold flex items-center gap-1.5 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Earnings Summary
              </div>
              <h3 className="text-2xl font-extrabold text-green-800">₹{farmerProfile.earnings || 0}</h3>
              <span className="text-[10px] text-gray-400 font-medium mt-1">From accepted visits</span>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-150 flex flex-col justify-between">
              <div className="text-green-650 text-xs font-bold flex items-center gap-1.5 mb-2">
                <Briefcase className="w-4 h-4 text-green-600" />
                Certificate Status
              </div>
              <div className="mt-1">
                <Badge
                  className={
                    farmerProfile.verificationStatus === "Approved"
                      ? "bg-green-600 text-white"
                      : farmerProfile.verificationStatus === "Rejected"
                      ? "bg-red-500 text-white"
                      : "bg-yellow-500 text-white"
                  }
                >
                  {farmerProfile.verificationStatus || "Pending"}
                </Badge>
              </div>
              <span className="text-[10px] text-gray-400 font-medium mt-2">
                {farmerProfile.adminRemarks || "Under review by admin"}
              </span>
            </div>
          </div>
        )}

        {/* BOOKINGS HISTORY PANEL */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-50 space-y-4">
          <h3 className="font-bold text-green-800 text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-green-600" />
            {user?.role === "Farmer" ? "Upcoming Visits & Logs" : "My Visit Bookings"}
          </h3>

          {bookings.length === 0 ? (
            <p className="text-sm text-green-600 text-center py-4">No visits scheduled or logged yet.</p>
          ) : (
            <div className="space-y-3 divide-y divide-green-50">
              {bookings.map((booking, index) => (
                <div key={booking._id} className={`${index > 0 ? "pt-3.5" : ""} text-sm`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-green-800">
                      {user?.role === "Farmer"
                        ? `Visitor: ${booking.customerId?.name || "Customer"}`
                        : booking.farmId?.farmName}
                    </span>
                    <Badge
                      className={
                        booking.bookingStatus === "Accepted"
                          ? "bg-green-600 text-white"
                          : booking.bookingStatus === "Rejected"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                      }
                    >
                      {booking.bookingStatus}
                    </Badge>
                  </div>
                  <div className="text-xs text-green-600 flex justify-between font-medium">
                    <span>
                      📅 {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
                    </span>
                    <span className="font-bold text-green-800">₹{booking.farmId?.pricing || 0}</span>
                  </div>
                  {user?.role === "Customer" && booking.farmerId && (
                    <div className="text-[10px] text-gray-400 mt-1 font-semibold">
                      Farmer: {booking.farmerId.name} | {booking.farmerId.contactNumber}
                    </div>
                  )}
                  {user?.role === "Farmer" && booking.customerId && (
                    <div className="text-[10px] text-gray-400 mt-1 font-semibold">
                      Contact: {booking.customerId.contactNumber} | {booking.customerId.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROFILE MANAGEMENT & SECURITY */}
        <div className="bg-white rounded-3xl shadow-sm border border-green-50 overflow-hidden">
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="w-full flex items-center justify-between p-4.5 hover:bg-green-50/30 transition-colors border-b border-green-50"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-800 text-sm">Security & Change Password</span>
            </div>
          </button>
          {user?.role === "Admin" && (
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="w-full flex items-center justify-between p-4.5 hover:bg-green-50/30 transition-colors border-b border-green-50"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-800 text-sm">Open Admin Dashboard</span>
              </div>
            </button>
          )}
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full py-6 border-red-200 text-red-650 hover:bg-red-50 rounded-2xl text-lg font-bold"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-850 font-extrabold text-xl">Edit Profile Details</DialogTitle>
            <DialogDescription>Modify your contact details and farm settings.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProfileSubmit} className="space-y-4 py-3">
            {/* Avatar upload */}
            <div className="space-y-1">
              <Label className="text-green-800 font-bold">Profile Picture</Label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-green-50 rounded-full border border-green-150 overflow-hidden">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Pic" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full text-green-600 p-2" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  className="text-xs text-green-700 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-green-200"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-phone">Contact Number</Label>
              <Input
                id="edit-phone"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="rounded-xl border-green-200"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-loc">Location/City</Label>
              <Input
                id="edit-loc"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="rounded-xl border-green-200"
              />
            </div>

            {/* Farmer Farm Info Editing */}
            {user?.role === "Farmer" && (
              <div className="space-y-3 pt-3 border-t border-green-50">
                <h4 className="font-bold text-green-800 text-sm">Farm details</h4>
                <div className="space-y-1">
                  <Label htmlFor="edit-farm-name">Farm Name</Label>
                  <Input
                    id="edit-farm-name"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="rounded-xl border-green-200"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-farm-cat">Farm Category</Label>
                  <select
                    id="edit-farm-cat"
                    value={farmCategory}
                    onChange={(e) => setFarmCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-green-250 rounded-xl text-green-800 font-medium"
                  >
                    <option value="Organic Vegetables">Vegetables</option>
                    <option value="Dairy Farm">Dairy Farm</option>
                    <option value="Fruit Orchard">Fruit Orchard</option>
                    <option value="Rice Fields">Rice Fields</option>
                    <option value="Poultry">Poultry</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-farm-address">Farm Address</Label>
                  <Input
                    id="edit-farm-address"
                    value={farmAddress}
                    onChange={(e) => setFarmAddress(e.target.value)}
                    className="rounded-xl border-green-200"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-farm-desc">Farm Description</Label>
                  <Textarea
                    id="edit-farm-desc"
                    value={farmDescription}
                    onChange={(e) => setFarmDescription(e.target.value)}
                    className="rounded-xl border-green-200"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-xl flex-1">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 rounded-xl flex-1">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CHANGE PASSWORD DIALOG */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-850 font-bold text-xl">Change Password</DialogTitle>
            <DialogDescription>Input your old credentials to set a new password.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="old-pass">Current Password</Label>
              <Input
                id="old-pass"
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="rounded-xl border-green-200"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-pass">New Password</Label>
              <Input
                id="new-pass"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl border-green-200"
                required
              />
            </div>
            <DialogFooter className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)} className="rounded-xl flex-1">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 rounded-xl flex-1">
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
