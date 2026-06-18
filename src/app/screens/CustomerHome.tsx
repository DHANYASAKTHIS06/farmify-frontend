import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  MapPin,
  Leaf,
  Apple,
  Truck,
  Star,
  Home as HomeIcon,
  MessageSquare,
  User,
  Bell,
  List,
  Map as MapIcon,
  Loader2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { MapView } from "../components/MapView";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

type FarmObj = {
  _id: string;
  farmName: string;
  description: string;
  address: string;
  category: string;
  images: string[];
  pricing: number;
  rating: number;
  reviewCount: number;
  location: { coordinates: [number, number] };
};

export default function CustomerHome() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const [activeTab, setActiveTab] = useState("home");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isLoading, setIsLoading] = useState(true);
  const [farms, setFarms] = useState<FarmObj[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("Detecting Location...");
  const [notificationCount, setNotificationCount] = useState(0);

  // Categories list
  const categories = [
    "Organic Vegetables",
    "Dairy Farm",
    "Fruit Orchard",
    "Rice Fields",
    "Poultry",
  ];

  // Geolocation detection on mount
  useEffect(() => {
    detectLocation();
    fetchNotifications();
  }, []);

  // Fetch notifications count
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${CONFIG_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const unread = data.filter((n: any) => !n.readStatus).length;
        setNotificationCount(unread);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const detectLocation = () => {
    setLocationName("Detecting Location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          setLocationName(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
          // Save in database profile if token exists
          updateProfileLocation(latitude, longitude);
        },
        (error) => {
          console.warn("Geolocation permission denied or error:", error);
          setLocationName("Thanjavur, TN (Default)");
          setCoords({ lat: 10.787, lng: 79.1378 }); // default Thanjavur coordinates
        }
      );
    } else {
      setLocationName("Thanjavur, TN (Default)");
      setCoords({ lat: 10.787, lng: 79.1378 });
    }
  };

  const updateProfileLocation = async (lat: number, lng: number) => {
    // Coordinates are used dynamically for search; no database storage needed on user model.
    return;
  };

  // Fetch farms from backend based on search & geolocation coordinates
  useEffect(() => {
    fetchFarms();
  }, [searchQuery, searchLocation, selectedCategory, maxPrice, minRating, coords]);

  const fetchFarms = async () => {
    setIsLoading(true);
    try {
      let url = `${CONFIG_API_URL}/api/search?`;
      if (searchQuery) url += `name=${encodeURIComponent(searchQuery)}&`;
      if (searchLocation) url += `location=${encodeURIComponent(searchLocation)}&`;
      if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (maxPrice) url += `maxPrice=${maxPrice}&`;
      if (minRating) url += `rating=${minRating}&`;
      
      if (coords) {
        url += `userLat=${coords.lat}&userLng=${coords.lng}&`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch farms");
      const data = await res.json();
      setFarms(data);
    } catch (error) {
      console.error("Error loading farms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSearchLocation("");
    setSelectedCategory("");
    setMaxPrice("");
    setMinRating("");
  };

  return (
    <div className="min-h-screen bg-green-50 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-5 sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide">FARMIFY</h1>
            <p className="text-xs text-green-150 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 fill-green-200 text-green-200" />
              <span>{locationName}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/notifications")}
              className="bg-white/20 p-2.5 rounded-full relative hover:bg-white/35 transition-all"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {notificationCount}
                </span>
              )}
            </button>
            <button
              onClick={detectLocation}
              className="bg-white/20 p-2.5 rounded-full hover:bg-white/35 transition-all"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input and Filter button */}
        <div className="flex gap-2 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 z-10" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farm name or product..."
              className="pl-11 pr-10 rounded-2xl bg-white border-0 text-green-900 placeholder-green-600 font-medium focus-visible:ring-2 focus-visible:ring-green-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-green-600 hover:text-green-800" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl transition-all border ${
              showFilters ? "bg-white text-green-700 border-white" : "bg-green-700 text-white border-green-800"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div className="mt-4 bg-green-700 p-4 rounded-2xl space-y-3 border border-green-800 animate-slide-down">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-green-200 font-bold">Location Search</span>
                <Input
                  placeholder="e.g. Thanjavur"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="bg-white/90 text-green-900 border-0 h-9 rounded-lg placeholder-green-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-green-200 font-bold">Max Visit Price</span>
                <Input
                  type="number"
                  placeholder="₹ Maximum"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-white/90 text-green-900 border-0 h-9 rounded-lg placeholder-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-green-200 font-bold">Min Rating</span>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full p-2 h-9 bg-white/90 text-green-900 border-0 rounded-lg text-sm focus:outline-none"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5★ & up</option>
                  <option value="4.0">4.0★ & up</option>
                  <option value="3.5">3.5★ & up</option>
                </select>
              </div>

              <div className="flex items-end justify-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="border-white/50 text-white hover:bg-white/10 rounded-lg h-9 w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              selectedCategory === ""
                ? "bg-green-600 text-white shadow-md"
                : "bg-white text-green-700 hover:bg-green-50"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-green-700 hover:bg-green-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* AI Recommendations Alert Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15">
            <Leaf className="w-32 h-32 rotate-45" />
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3.5 rounded-full">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-lg mb-1">AI Farm Assistant</h3>
              <p className="text-sm text-green-50 mb-4">
                Chat with our AI companion to receive instant farm recommendations or check visit statuses.
              </p>
              <Button
                onClick={() => navigate("/ai-assistant")}
                className="bg-white text-green-600 hover:bg-green-50 rounded-full font-bold px-6 py-4 shadow-sm"
              >
                Chat Now
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/pick-your-own")}
            className="bg-white rounded-3xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-shadow flex flex-col items-center gap-3 text-center"
          >
            <div className="bg-green-100 p-4 rounded-full">
              <Apple className="w-6 h-6 text-green-600" />
            </div>
            <span className="font-bold text-green-800 text-sm">Pick Your Own</span>
          </button>
          <button
            onClick={() => navigate("/home-delivery")}
            className="bg-white rounded-3xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-shadow flex flex-col items-center gap-3 text-center"
          >
            <div className="bg-green-100 p-4 rounded-full">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <span className="font-bold text-green-800 text-sm">Home Delivery</span>
          </button>
        </div>

        {/* Organic Farms Grid / List View */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-green-850">
              {selectedCategory || "Organic Farms Near You"}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-xl transition-colors ${
                  viewMode === "list" ? "bg-green-600 text-white shadow" : "bg-white text-green-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2.5 rounded-xl transition-colors ${
                  viewMode === "map" ? "bg-green-600 text-white shadow" : "bg-white text-green-600"
                }`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-5 animate-pulse border border-green-100">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-green-200/50 rounded-2xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-green-200/50 rounded w-3/4"></div>
                      <div className="h-3 bg-green-200/50 rounded w-1/2"></div>
                      <div className="h-3 bg-green-200/50 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : farms.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-green-100 shadow-sm">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-1">No Farms Found</h3>
              <p className="text-sm text-green-600 mb-4">Try clearing filters or search queries.</p>
              <Button onClick={clearFilters} className="bg-green-600 hover:bg-green-700 rounded-xl">
                Reset Search
              </Button>
            </div>
          ) : viewMode === "map" ? (
            /* Map View */
            <MapView
              farms={farms.map((f) => ({
                id: f._id,
                name: f.farmName,
                distance: f.distanceInKm !== undefined ? `${f.distanceInKm} km away` : "Dynamic route available",
                rating: f.averageRating !== undefined ? f.averageRating : (f as any).rating || 0,
                verified: true,
                image: f.images[0] || "",
                products: [f.category],
              }))}
              onFarmClick={(id) => navigate(`/farm/${id}`)}
            />
          ) : (
            /* List View */
            <div className="space-y-4">
              {farms.map((farm) => (
                <div
                  key={farm._id}
                  onClick={() => navigate(`/farm/${farm._id}`)}
                  className="bg-white rounded-3xl shadow-sm border border-green-100 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:w-36 h-36">
                      <ImageWithFallback
                        src={farm.images[0] || ""}
                        alt={farm.farmName}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-green-600 text-white flex items-center gap-1.5 font-bold">
                        <Leaf className="w-3.5 h-3.5 fill-white/20" />
                        Verified
                      </Badge>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-extrabold text-green-800 text-lg leading-tight">
                            {farm.farmName}
                          </h3>
                          <span className="font-extrabold text-green-700">₹{farm.pricing}/visit</span>
                        </div>
                        <p className="text-sm text-green-650 flex flex-wrap items-center gap-1 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-green-600" />
                          <span>{farm.location?.address || (farm as any).address || "No address provided"}</span>
                          {farm.distanceInKm !== undefined && (
                            <span className="text-xs font-bold text-green-700 ml-2 bg-green-100/50 px-2 py-0.5 rounded">
                              {farm.distanceInKm} km away
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-green-50 pt-3 mt-2">
                        <span className="flex items-center gap-1 text-sm text-green-800 font-bold">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {farm.averageRating !== undefined ? farm.averageRating : (farm as any).rating || 0}
                          <span className="text-xs text-gray-400 font-normal">
                            ({(farm as any).reviewCount !== undefined ? (farm as any).reviewCount : 5} reviews)
                          </span>
                        </span>
                        <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-xl font-bold">
                          {farm.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 shadow-xl z-20">
        <div className="flex items-center justify-around py-3 px-4">
          <button
            onClick={() => setActiveTab("home")}
            className="flex flex-col items-center gap-1 text-green-600 font-bold"
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => navigate("/ai-assistant")}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-green-600 transition-colors"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">AI Assistant</span>
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-green-600 transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}