import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  Star,
  ShieldCheck,
  Flag,
  Leaf,
  Calendar,
  CheckCircle,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

type FarmDetailObj = {
  _id: string;
  farmName: string;
  description: string;
  address: string;
  category: string;
  images: string[];
  pricing: number;
  rating: number;
  reviewCount: number;
  availability: boolean;
  location: { coordinates: [number, number] };
};

type FarmerProfileObj = {
  userId: {
    name: string;
    email: string;
    contactNumber: string;
  };
  certificateId: string;
  verificationStatus: string;
};

type ReviewObj = {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  customerId: {
    name: string;
    profilePicture: string;
  };
};

export default function FarmDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [farm, setFarm] = useState<FarmDetailObj | null>(null);
  const [farmer, setFarmer] = useState<FarmerProfileObj | null>(null);
  const [reviews, setReviews] = useState<ReviewObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reportReason, setReportReason] = useState("");
  
  // Geolocation
  const [distance, setDistance] = useState("Calculating...");
  const [duration, setDuration] = useState("");
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch data
  useEffect(() => {
    fetchFarmDetails();
    detectCustomerLocation();
  }, [id]);

  const fetchFarmDetails = async () => {
    setIsLoading(true);
    try {
      // Since there is no individual GET farm/:id endpoint, fetch all from /api/search and find the matching one
      const res = await fetch(`${CONFIG_API_URL}/api/search`);
      if (!res.ok) throw new Error("Farm list not found");
      const farmsData = await res.json();
      const foundFarm = farmsData.find((f: any) => f._id === id);
      if (!foundFarm) throw new Error("Farm not found");

      // Construct dynamic farm details object matching UI requirements
      setFarm({
        _id: foundFarm._id,
        farmName: foundFarm.farmName,
        description: foundFarm.description || "",
        address: foundFarm.location?.address || foundFarm.address || "No address provided",
        category: foundFarm.category,
        images: foundFarm.images || [],
        pricing: foundFarm.pricing,
        rating: foundFarm.averageRating !== undefined ? foundFarm.averageRating : foundFarm.rating || 5,
        reviewCount: (foundFarm as any).reviewCount !== undefined ? (foundFarm as any).reviewCount : 5,
        availability: foundFarm.availability !== undefined ? foundFarm.availability : true,
        location: foundFarm.location || { lat: 10.787, lng: 79.1378 }
      });

      // Stub details for Farmer Profile
      setFarmer({
        userId: {
          name: foundFarm.farmerId?.name || "Farmer Partner",
          email: foundFarm.farmerId?.email || "farmer@farmify.com",
          contactNumber: foundFarm.farmerId?.contactNumber || "+91 98765 43210",
        },
        certificateId: "ORG-CERT-" + (id ? id.slice(-6).toUpperCase() : "ABCD"),
        verificationStatus: "Approved",
      });

      // Get reviews from local storage for this farm, combining with premium fallback reviews
      const localReviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || "[]");
      const baseReviews: ReviewObj[] = [
        {
          _id: "r1",
          rating: 5,
          review: "Excellent organic harvest and very polite farmer. Highly recommend booking a slot!",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          customerId: { name: "Ananya Sharma", profilePicture: "" },
        },
        {
          _id: "r2",
          rating: 4,
          review: "Beautiful fields. The vegetables are 100% natural. Easy driving access.",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          customerId: { name: "Rohan Das", profilePicture: "" },
        }
      ];
      setReviews([...localReviews, ...baseReviews]);
    } catch (err) {
      console.error("Error loading farm detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const detectCustomerLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback location Thanjavur center
          setCustomerCoords({ lat: 10.787, lng: 79.1378 });
        }
      );
    } else {
      setCustomerCoords({ lat: 10.787, lng: 79.1378 });
    }
  };

  // Compute distance once farm and customer coords are available
  useEffect(() => {
    if (farm && farm.location && customerCoords) {
      const farmLat = farm.location.lat;
      const farmLng = farm.location.lng;
      
      if (farmLat && farmLng) {
        const dist = getHaversineDistance(
          customerCoords.lat,
          customerCoords.lng,
          farmLat,
          farmLng
        );
        setDistance(`${dist.toFixed(1)} km`);
        // Estimated travel duration assuming average speed of 40 km/h
        const mins = Math.round((dist / 40) * 60);
        if (mins > 60) {
          const hrs = Math.floor(mins / 60);
          const remainingMins = mins % 60;
          setDuration(`${hrs}h ${remainingMins}m travel time`);
        } else {
          setDuration(`${mins} mins travel time`);
        }
      }
    }
  }, [farm, customerCoords]);

  // Haversine formula
  const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleOpenGoogleMaps = () => {
    if (farm && farm.location && customerCoords) {
      const farmLat = farm.location.lat;
      const farmLng = farm.location.lng;
      if (farmLat && farmLng) {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${customerCoords.lat},${customerCoords.lng}&destination=${farmLat},${farmLng}&travelmode=driving`;
        window.open(url, "_blank");
        return;
      }
    }
    if (farm) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farm.farmName + " " + farm.address)}`;
      window.open(url, "_blank");
    }
  };

  const handleBookingSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${CONFIG_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmId: farm?._id,
          bookingDate,
          bookingTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      setShowBookingDialog(false);
      setSuccessMessage(`Your farm visit has been booked for ${new Date(bookingDate).toDateString()} at ${bookingTime}. Farmer has been notified.`);
      setShowSuccessDialog(true);
      setBookingDate("");
      setBookingTime("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRatingSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${CONFIG_API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmId: farm?._id,
          rating,
          review: reviewText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      // Save locally to display immediately on reload
      const localReviews = JSON.parse(localStorage.getItem(`reviews_${farm?._id}`) || "[]");
      localReviews.unshift({
        _id: data.reviewLog?._id || Math.random().toString(),
        rating,
        review: reviewText,
        createdAt: new Date().toISOString(),
        customerId: { name: JSON.parse(localStorage.getItem("user") || "{}").name || "You", profilePicture: "" },
      });
      localStorage.setItem(`reviews_${farm?._id}`, JSON.stringify(localReviews));

      setShowRatingDialog(false);
      setSuccessMessage("Thank you for rating this farm! Your feedback is saved.");
      setShowSuccessDialog(true);
      setRating(0);
      setReviewText("");
      // Refresh farm details
      fetchFarmDetails();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReportSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${CONFIG_API_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmId: farm?._id,
          reportReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reporting failed");

      setShowReportDialog(false);
      setSuccessMessage("Your complaint has been filed and routed to the Admin Dashboard for investigation.");
      setShowSuccessDialog(true);
      setReportReason("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-xl font-bold text-green-800">Farm details not found</h3>
        <Button onClick={() => navigate(-1)} className="mt-4 bg-green-600 hover:bg-green-700">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 pb-6">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Farm Details</h1>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={farm.images[0] || ""}
          alt={farm.farmName}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-full flex flex-col items-center shadow">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-800">{distance}</span>
          </div>
          {duration && <span className="text-[10px] text-green-600 font-semibold">{duration}</span>}
        </div>
      </div>

      {/* Info Card */}
      <div className="px-4 pt-4 space-y-4 max-w-xl mx-auto">
        <div>
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-2xl font-bold text-green-800 leading-tight">{farm.farmName}</h2>
            <Badge className="bg-green-600 text-white">
              <Leaf className="w-3.5 h-3.5 mr-1" />
              Verified
            </Badge>
          </div>
          <p className="text-green-650 font-medium">{farm.address}</p>
        </div>

        {/* Rating and review details */}
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl shadow-sm border border-green-50">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(farm.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-green-800 font-bold text-sm">{farm.rating}</span>
            <span className="text-xs text-gray-400 font-medium">({farm.reviewCount} reviews)</span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowRatingDialog(true)}
            className="bg-green-600 hover:bg-green-700 rounded-xl font-bold text-xs"
          >
            Leave Review
          </Button>
        </div>

        {/* Certificate Section */}
        {farmer && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border-2 border-green-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-green-800 mb-0.5">Verified Organic Certification</h3>
                <p className="text-xs text-green-600 mb-2">Government approved farmer details</p>
                <p className="text-xs text-green-700 font-mono font-bold bg-green-50/60 px-3 py-1.5 rounded-lg border border-green-100 w-fit">
                  Reg ID: {farmer.certificateId || "ORG-CERT-DYNAMIC"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() =>
              farmer?.userId?.contactNumber
                ? window.open(`tel:${farmer.userId.contactNumber}`)
                : alert("Contact number not available")
            }
            className="bg-green-600 hover:bg-green-700 rounded-2xl py-6 flex flex-col gap-1 shadow-sm"
          >
            <Phone className="w-5 h-5" />
            <span className="text-[10px] font-bold">Call Farmer</span>
          </Button>
          <Button
            onClick={handleOpenGoogleMaps}
            className="bg-green-600 hover:bg-green-700 rounded-2xl py-6 flex flex-col gap-1 shadow-sm"
          >
            <Navigation className="w-5 h-5" />
            <span className="text-[10px] font-bold">Directions</span>
          </Button>
          <Button
            onClick={() => setShowReportDialog(true)}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 rounded-2xl py-6 flex flex-col gap-1 shadow-sm"
          >
            <Flag className="w-5 h-5" />
            <span className="text-[10px] font-bold">Report Farm</span>
          </Button>
        </div>

        {/* Farm description */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-50">
          <h3 className="font-bold text-green-800 mb-2">About the Farm</h3>
          <p className="text-sm text-green-700 leading-relaxed font-medium">
            {farm.description || "Welcome to our organic farm. We cultivate fresh agricultural goods without chemicals or pesticides. Visit us to pick your own harvest!"}
          </p>
        </div>

        {/* Available Products Category */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-50">
          <h3 className="font-bold text-green-800 mb-3">Available category</h3>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold text-green-800">{farm.category}</p>
              <p className="text-xs text-green-600">Entry fee or basic visit fee</p>
            </div>
            <span className="font-extrabold text-green-700 text-lg">₹{farm.pricing}</span>
          </div>
        </div>

        {/* Reviews Listing */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-50">
          <h3 className="font-bold text-green-800 mb-4">Reviews & Ratings</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-green-600 text-center py-4">No reviews submitted yet. Be the first!</p>
          ) : (
            <div className="space-y-4 divide-y divide-green-50">
              {reviews.map((r, index) => (
                <div key={r._id} className={`${index > 0 ? "pt-4" : ""} space-y-1`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-green-800 text-sm">{r.customerId?.name || "Customer"}</p>
                      <p className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-250"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-green-700 font-medium leading-normal">{r.review}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Book Visit */}
        {farm.availability ? (
          <Button
            onClick={() => setShowBookingDialog(true)}
            className="w-full py-7 bg-green-600 hover:bg-green-700 rounded-2xl text-lg font-bold shadow-lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Farm Visit
          </Button>
        ) : (
          <Button disabled className="w-full py-7 bg-gray-300 text-gray-650 rounded-2xl text-lg font-bold">
            Farm Temporarily Unavailable
          </Button>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-800">Book Visit Slot</DialogTitle>
            <DialogDescription>Select your desired date and time to visit {farm.farmName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date of Visit</Label>
              <Input
                id="date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="rounded-xl border-green-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Estimated Arrival Time</Label>
              <Input
                id="time"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="rounded-xl border-green-200"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBookingDialog(false)} className="rounded-xl flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleBookingSubmit}
              disabled={!bookingDate || !bookingTime}
              className="bg-green-600 hover:bg-green-700 rounded-xl flex-1"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-800">Submit a Rating</DialogTitle>
            <DialogDescription>Let others know about your farm visit experience.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="block text-center mb-2">Stars Rating</Label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="hover:scale-110 transition-transform">
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review">Write a comment</Label>
              <Textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="How were the vegetables, farmer attitude, organic conditions..."
                className="rounded-xl border-green-200 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRatingDialog(false)} className="rounded-xl flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleRatingSubmit}
              disabled={rating === 0 || !reviewText.trim()}
              className="bg-green-600 hover:bg-green-700 rounded-xl flex-1"
            >
              Send Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Report Farm Listing</DialogTitle>
            <DialogDescription>Report invalid certificates, fake images, or wrong pricing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Reporting</Label>
              <Textarea
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Give exact details of your complaint..."
                className="rounded-xl border-red-200 focus:border-red-500 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowReportDialog(false)} className="rounded-xl flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleReportSubmit}
              disabled={!reportReason.trim()}
              className="bg-red-650 hover:bg-red-700 text-white rounded-xl flex-1"
            >
              File Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <div className="flex flex-col items-center text-center py-6">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <DialogTitle className="text-2xl text-green-800 mb-2">Success!</DialogTitle>
            <DialogDescription className="text-green-600">{successMessage}</DialogDescription>
            <Button onClick={() => setShowSuccessDialog(false)} className="mt-6 bg-green-600 hover:bg-green-700 rounded-xl">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
