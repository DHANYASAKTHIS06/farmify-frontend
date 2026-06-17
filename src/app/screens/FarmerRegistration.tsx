import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function FarmerRegistration() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/register");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <p className="text-green-800 font-bold">Redirecting to Registration...</p>
    </div>
  );
}
