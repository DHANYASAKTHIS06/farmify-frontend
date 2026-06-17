import { useNavigate } from "react-router";
import { Sprout } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-between px-6 py-12">
      {/* Spacer */}
      <div></div>

      {/* Brand Logo & Name */}
      <div className="flex flex-col items-center text-center">
        <div className="bg-green-600 p-8 rounded-full mb-6 shadow-2xl animate-pulse">
          <Sprout className="w-20 h-20 text-white fill-green-100/20" />
        </div>
        <h1 className="text-5xl font-extrabold text-green-800 tracking-wider mb-2">FARMIFY</h1>
        <p className="text-lg text-green-700 font-medium max-w-sm leading-relaxed">
          Connecting Organic Farms & Fresh Harvests Directly to Your Family
        </p>
      </div>

      {/* Actions */}
      <div className="w-full max-w-md flex flex-col gap-4">
        <Button
          onClick={() => navigate("/login")}
          className="w-full py-7 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-green-150 transition-all"
        >
          Sign In
        </Button>
        <Button
          onClick={() => navigate("/register")}
          variant="outline"
          className="w-full py-7 border-green-300 text-green-700 hover:bg-green-50 rounded-2xl text-lg font-bold shadow-sm transition-all"
        >
          Create New Account
        </Button>

        <p className="text-center text-xs text-green-650 mt-4 font-semibold">
          🚜 Pure organic products • Verified certificates • Easy visits
        </p>
      </div>
    </div>
  );
}
