import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export default function PickYourOwnBooking() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [numVisitors, setNumVisitors] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateError, setDateError] = useState("");

  // Mock farm data
  const farm = {
    name: "Green Valley Organic Farm",
    location: "Thanjavur, Tamil Nadu",
    entryFee: "₹50 per person",
    rules: [
      "Please wear appropriate farming shoes",
      "Children must be accompanied by adults",
      "Respect the crops and follow staff instructions",
    ],
  };

  const timeSlots = [
    { id: "1", time: "9:00 AM - 11:00 AM", available: true },
    { id: "2", time: "11:00 AM - 1:00 PM", available: true },
    { id: "3", time: "2:00 PM - 4:00 PM", available: false },
    { id: "4", time: "4:00 PM - 6:00 PM", available: true },
  ];

  const handleDateChange = (date: string) => {
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      setDateError("Cannot select a past date");
      setSelectedDate("");
    } else {
      setDateError("");
      setSelectedDate(date);
    }
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedSlot || !numVisitors) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
    }, 2000);
  };

  const isFormValid =
    selectedDate && selectedSlot && numVisitors && parseInt(numVisitors) > 0;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Visit Booked Successfully!
          </h2>
          <p className="text-green-600 mb-6">
            Your farm visit has been confirmed
          </p>
          <div className="bg-green-50 rounded-2xl p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-green-800">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-green-800">
                  {timeSlots.find((s) => s.id === selectedSlot)?.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-green-800">{numVisitors} visitors</span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => navigate("/home")}
            className="w-full bg-green-600 hover:bg-green-700 rounded-xl py-6"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Book Farm Visit</h1>
      </div>

      <div className="px-6 py-6 max-w-2xl mx-auto space-y-6">
        {/* Farm Info */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-green-800 mb-2">
            {farm.name}
          </h2>
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{farm.location}</span>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-2">
              Entry Fee: {farm.entryFee}
            </p>
            <div className="text-xs text-green-700">
              <p className="font-semibold mb-1">Farm Rules:</p>
              <ul className="list-disc list-inside space-y-1">
                {farm.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
          {/* Select Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-green-800">
              Select Date *
            </Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={`rounded-xl pr-10 ${
                  dateError ? "border-red-500" : "border-green-200"
                }`}
              />
              <Calendar className="w-5 h-5 text-green-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {dateError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <Info className="w-4 h-4" />
                {dateError}
              </p>
            )}
          </div>

          {/* Select Time Slot */}
          <div className="space-y-2">
            <Label className="text-green-800">Select Time Slot *</Label>
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && setSelectedSlot(slot.id)}
                  disabled={!slot.available}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSlot === slot.id
                      ? "border-green-600 bg-green-50"
                      : slot.available
                      ? "border-green-200 hover:border-green-400"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-sm text-green-800">{slot.time}</p>
                  {!slot.available && (
                    <p className="text-xs text-red-600 mt-1">Fully Booked</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Visitors */}
          <div className="space-y-2">
            <Label htmlFor="visitors" className="text-green-800">
              Number of Visitors *
            </Label>
            <div className="relative">
              <Input
                id="visitors"
                type="number"
                min="1"
                max="20"
                value={numVisitors}
                onChange={(e) => setNumVisitors(e.target.value)}
                placeholder="Enter number of visitors"
                className="rounded-xl border-green-200 pr-10"
              />
              <Users className="w-5 h-5 text-green-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Total Amount */}
          {numVisitors && parseInt(numVisitors) > 0 && (
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-green-800">Total Amount:</span>
                <span className="text-xl font-bold text-green-800">
                  ₹{parseInt(numVisitors) * 50}
                </span>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <Button
            onClick={handleBooking}
            disabled={!isFormValid || isLoading}
            className="w-full py-6 bg-green-600 hover:bg-green-700 rounded-xl text-lg disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Booking...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
