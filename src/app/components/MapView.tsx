import { MapPin, Navigation, Phone, Star, Leaf } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useState } from "react";
import { useNavigate } from "react-router";

interface Farm {
  id: string;
  name: string;
  distance: string;
  rating: number;
  verified: boolean;
  products: string[];
  lat?: number;
  lng?: number;
}

interface MapViewProps {
  farms: Farm[];
  onFarmClick: (farmId: string) => void;
}

export function MapView({ farms, onFarmClick }: MapViewProps) {
  const navigate = useNavigate();
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    "idle" | "granted" | "denied"
  >("idle");
  const [isLoading, setIsLoading] = useState(false);

  const requestLocationPermission = () => {
    setIsLoading(true);
    // Simulate permission request
    setTimeout(() => {
      setLocationPermission("granted");
      setIsLoading(false);
    }, 1000);
  };

  if (locationPermission === "idle") {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Location Permission Required
        </h3>
        <p className="text-green-600 mb-4 text-sm">
          Allow AGRI to access your location to show nearby farms on the map
        </p>
        <Button
          onClick={requestLocationPermission}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 rounded-xl"
        >
          {isLoading ? "Requesting..." : "Grant Permission"}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-12 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-green-600">Loading GPS...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="relative h-96 bg-gradient-to-br from-green-100 to-green-200">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="green"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Farm Pins */}
        {farms.map((farm, index) => (
          <button
            key={farm.id}
            onClick={() => setSelectedFarm(farm)}
            className="absolute transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
            style={{
              left: `${20 + index * 25}%`,
              top: `${30 + index * 15}%`,
            }}
          >
            <div className="relative">
              <MapPin className="w-10 h-10 text-green-600 fill-green-600 drop-shadow-lg animate-bounce" />
              {farm.verified && (
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                  <Leaf className="w-3 h-3 text-green-600" />
                </div>
              )}
            </div>
          </button>
        ))}

        {/* User Location Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-blue-600 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>

        {/* Distance Indicator */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
          <p className="text-sm text-green-800 font-medium">
            {farms.length} farms nearby
          </p>
        </div>
      </div>

      {/* Farm Preview Bottom Sheet */}
      <Dialog open={!!selectedFarm} onOpenChange={() => setSelectedFarm(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedFarm && (
            <>
              <DialogHeader>
                <DialogTitle className="text-green-800 flex items-center gap-2">
                  {selectedFarm.name}
                  {selectedFarm.verified && (
                    <Badge className="bg-green-600 text-white">
                      <Leaf className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedFarm.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {selectedFarm.rating}
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm text-green-700 mb-2">Products:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFarm.products.map((product) => (
                      <span
                        key={product}
                        className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/farm/${selectedFarm.id}`)}
                    className="bg-green-600 hover:bg-green-700 rounded-xl col-span-3"
                  >
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-green-300"
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-green-300 col-span-2"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
