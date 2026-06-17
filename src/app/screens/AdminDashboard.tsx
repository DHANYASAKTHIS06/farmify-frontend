import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  DollarSign,
  UserX,
  UserCheck,
  Check,
  X,
  LogOut,
  TrendingUp,
  MessageSquare,
  Sprout,
  Image,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

type FarmerObj = {
  _id: string;
  farmName: string;
  farmDescription: string;
  farmAddress: string;
  farmCategory: string;
  certificate: string;
  certificateId: string;
  verificationStatus: "Pending" | "Approved" | "Rejected";
  remarks: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    contactNumber: string;
    isBlocked: boolean;
  };
};

type UserObj = {
  _id: string;
  name: string;
  email: string;
  role: "Customer" | "Farmer";
  contactNumber: string;
  isBlocked: boolean;
};

type BookingObj = {
  _id: string;
  bookingDate: string;
  bookingTime: string;
  bookingStatus: "Pending" | "Accepted" | "Rejected";
  customerId: { name: string; email: string; contactNumber: string };
  farmerId: { name: string; contactNumber: string };
  farmId: { farmName: string; address: string; pricing: number };
};

type ReportObj = {
  _id: string;
  reportReason: string;
  status: "Pending" | "Resolved" | "Dismissed";
  customerId: { name: string; email: string };
  farmId: { farmName: string; address: string };
};

type AnalyticsObj = {
  totalFarmers: number;
  totalCustomers: number;
  totalFarms: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyReports: { month: string; bookings: number; revenue: number }[];
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"analytics" | "verification" | "users" | "reports" | "bookings">("analytics");
  const [analytics, setAnalytics] = useState<AnalyticsObj | null>(null);
  const [farmers, setFarmers] = useState<FarmerObj[]>([]);
  const [users, setUsers] = useState<UserObj[]>([]);
  const [bookings, setBookings] = useState<BookingObj[]>([]);
  const [reports, setReports] = useState<ReportObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [token, setToken] = useState("");

  useEffect(() => {
    const adminToken = localStorage.getItem("token");
    if (!adminToken) {
      navigate("/login");
      return;
    }
    setToken(adminToken);
    fetchDashboardData(adminToken);
  }, [navigate]);

  const fetchDashboardData = async (authToken: string) => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      // Fetch Analytics
      const analRes = await fetch(`${CONFIG_API_URL}/api/admin/analytics`, { headers });
      const analData = await analRes.json();
      setAnalytics(analData);

      // Fetch Farmers
      const farmRes = await fetch(`${CONFIG_API_URL}/api/admin/farmers`, { headers });
      const farmData = await farmRes.json();
      setFarmers(farmData);

      // Fetch Users
      const userRes = await fetch(`${CONFIG_API_URL}/api/admin/users`, { headers });
      const userData = await userRes.json();
      setUsers(userData);

      // Fetch Bookings
      const bookRes = await fetch(`${CONFIG_API_URL}/api/admin/bookings`, { headers });
      const bookData = await bookRes.json();
      setBookings(bookData);

      // Fetch Reports
      const repRes = await fetch(`${CONFIG_API_URL}/api/admin/reports`, { headers });
      const repData = await repRes.json();
      setReports(repData);
    } catch (error) {
      console.error("Error fetching admin data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarmerVerification = async (farmerId: string, status: "Approved" | "Rejected") => {
    try {
      const response = await fetch(`${CONFIG_API_URL}/api/admin/farmers/${farmerId}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          remarks: remarksMap[farmerId] || `Certificate ${status.toLowerCase()} by Admin`,
        }),
      });

      if (!response.ok) throw new Error("Failed to verify");

      // Update state
      setFarmers((prev) =>
        prev.map((f) => (f._id === farmerId ? { ...f, verificationStatus: status, remarks: remarksMap[farmerId] } : f))
      );
      // Reload analytics
      fetchDashboardData(token);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentBlocked: boolean) => {
    try {
      const response = await fetch(`${CONFIG_API_URL}/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBlocked: !currentBlocked }),
      });

      if (!response.ok) throw new Error("Failed to toggle user status");

      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isBlocked: !currentBlocked } : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (reportId: string, status: "Resolved" | "Dismissed") => {
    try {
      const response = await fetch(`${CONFIG_API_URL}/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update report");

      setReports((prev) => prev.map((r) => (r._id === reportId ? { ...r, status } : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-green-50/50 pb-12">
      {/* Header */}
      <header className="bg-green-700 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-white fill-green-200" />
          <h1 className="text-2xl font-extrabold tracking-wider">FARMIFY ADMIN</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all border border-white/20"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 bg-white rounded-3xl p-6 shadow-md border border-green-100 h-fit space-y-2">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${
              activeTab === "analytics"
                ? "bg-green-600 text-white shadow-lg shadow-green-100"
                : "text-green-800 hover:bg-green-50"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${
              activeTab === "verification"
                ? "bg-green-600 text-white shadow-lg shadow-green-100"
                : "text-green-800 hover:bg-green-50"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            Farmer Verification
            {farmers.filter((f) => f.verificationStatus === "Pending").length > 0 && (
              <Badge className="bg-red-500 text-white ml-auto">
                {farmers.filter((f) => f.verificationStatus === "Pending").length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${
              activeTab === "users"
                ? "bg-green-600 text-white shadow-lg shadow-green-100"
                : "text-green-800 hover:bg-green-50"
            }`}
          >
            <Users className="w-5 h-5" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${
              activeTab === "reports"
                ? "bg-green-600 text-white shadow-lg shadow-green-100"
                : "text-green-800 hover:bg-green-50"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Complaints & Reports
            {reports.filter((r) => r.status === "Pending").length > 0 && (
              <Badge className="bg-red-500 text-white ml-auto">
                {reports.filter((r) => r.status === "Pending").length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${
              activeTab === "bookings"
                ? "bg-green-600 text-white shadow-lg shadow-green-100"
                : "text-green-800 hover:bg-green-50"
            }`}
          >
            <Calendar className="w-5 h-5" />
            Bookings Audit
          </button>
        </div>

        {/* Dynamic Panels */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="bg-white rounded-3xl shadow-md p-12 flex flex-col items-center justify-center border border-green-100">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
              <p className="text-green-700 font-bold">Synchronizing dashboard data...</p>
            </div>
          ) : (
            <>
              {/* ANALYTICS TAB */}
              {activeTab === "analytics" && analytics && (
                <div className="space-y-8 animate-fade-in">
                  {/* Grid Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex items-center gap-4">
                      <div className="bg-green-100 p-4 rounded-full text-green-600">
                        <Users className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm text-green-650 font-bold">Total Customers</p>
                        <h3 className="text-3xl font-extrabold text-green-800">{analytics.totalCustomers}</h3>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex items-center gap-4">
                      <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                        <Sprout className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm text-green-650 font-bold">Total Farmers</p>
                        <h3 className="text-3xl font-extrabold text-green-800">
                          {analytics.totalFarmers} ({analytics.totalFarms} Farms)
                        </h3>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex items-center gap-4">
                      <div className="bg-amber-100 p-4 rounded-full text-amber-600">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm text-green-650 font-bold">Total Bookings</p>
                        <h3 className="text-3xl font-extrabold text-green-800">{analytics.totalBookings}</h3>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex items-center gap-4 sm:col-span-2 lg:col-span-3">
                      <div className="bg-yellow-100 p-4 rounded-full text-yellow-600">
                        <DollarSign className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm text-green-650 font-bold">Total Revenue (Accepted Visits)</p>
                        <h3 className="text-3xl font-extrabold text-green-800">₹{analytics.totalRevenue}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Monthly revenue bar list */}
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-green-100">
                    <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Revenue and Bookings Trends (Current Year)
                    </h3>
                    <div className="space-y-3">
                      {analytics.monthlyReports.map((stat, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="w-20 text-sm font-bold text-green-700">{stat.month}</span>
                          <div className="flex-1 bg-green-50 h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-green-600 h-full rounded-full transition-all"
                              style={{
                                width: `${
                                  analytics.totalRevenue > 0
                                    ? Math.min((stat.revenue / analytics.totalRevenue) * 100, 100)
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="w-24 text-right text-xs font-bold text-green-800">
                            {stat.bookings} Bookings / ₹{stat.revenue}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FARMER VERIFICATION TAB */}
              {activeTab === "verification" && (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-green-100 space-y-6">
                  <h3 className="text-xl font-bold text-green-800">Farmers Certificate Approvals</h3>
                  {farmers.length === 0 ? (
                    <p className="text-center py-6 text-green-600">No farmers registered in the system yet.</p>
                  ) : (
                    <div className="divide-y divide-green-50 space-y-4">
                      {farmers.map((farmer) => (
                        <div key={farmer._id} className="pt-4 flex flex-col md:flex-row gap-4 justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-green-800 text-lg">{farmer.farmName}</h4>
                              <Badge
                                className={
                                  farmer.verificationStatus === "Approved"
                                    ? "bg-green-600 text-white"
                                    : farmer.verificationStatus === "Rejected"
                                    ? "bg-red-500 text-white"
                                    : "bg-yellow-500 text-white"
                                }
                              >
                                {farmer.verificationStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-green-700">
                              <b>Farmer Name:</b> {farmer.userId?.name || "N/A"} <br />
                              <b>Email:</b> {farmer.userId?.email || "N/A"} | <b>Contact:</b>{" "}
                              {farmer.userId?.contactNumber || farmer.certificateId || "N/A"}
                            </p>
                            <p className="text-sm text-green-650">
                              <b>Category:</b> {farmer.farmCategory} | <b>Address:</b> {farmer.farmAddress}
                            </p>
                            {farmer.certificate ? (
                              <div className="mt-2 bg-green-50 p-2 rounded-xl border border-green-200 w-fit">
                                <a
                                  href={farmer.certificate}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-green-700 font-bold hover:underline flex items-center gap-1.5"
                                >
                                  <Image className="w-4 h-4" />
                                  View Submitted Certificate
                                </a>
                              </div>
                            ) : (
                              <p className="text-xs text-red-500">No certificate document uploaded yet.</p>
                            )}

                            {/* Remarks input */}
                            {farmer.verificationStatus === "Pending" && (
                              <input
                                type="text"
                                placeholder="Add verification remarks here..."
                                value={remarksMap[farmer._id] || ""}
                                onChange={(e) => setRemarksMap({ ...remarksMap, [farmer._id]: e.target.value })}
                                className="w-full max-w-md mt-2 p-2.5 border border-green-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                              />
                            )}
                            {farmer.remarks && (
                              <p className="text-xs bg-gray-50 border p-2 rounded-xl text-gray-600 mt-2">
                                💬 <b>Remarks:</b> {farmer.remarks}
                              </p>
                            )}
                          </div>

                          {farmer.verificationStatus === "Pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleFarmerVerification(farmer._id, "Approved")}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                              >
                                <Check className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleFarmerVerification(farmer._id, "Rejected")}
                                className="rounded-xl"
                              >
                                <X className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* USER MANAGEMENT TAB */}
              {activeTab === "users" && (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-green-100 space-y-6">
                  <h3 className="text-xl font-bold text-green-800">User accounts management</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-green-100 text-green-700 font-bold">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-50">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-green-50/20">
                            <td className="py-3 px-4 text-green-800 font-semibold">{u.name}</td>
                            <td className="py-3 px-4 text-green-700">{u.email}</td>
                            <td className="py-3 px-4">
                              <Badge className={u.role === "Farmer" ? "bg-blue-600" : "bg-green-600"}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={u.isBlocked ? "bg-red-500" : "bg-green-600"}>
                                {u.isBlocked ? "Blocked" : "Active"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleToggleUserStatus(u._id, u.isBlocked)}
                                className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                                  u.isBlocked
                                    ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                                    : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                }`}
                              >
                                {u.isBlocked ? (
                                  <span className="flex items-center gap-1">
                                    <UserCheck className="w-4 h-4" /> Activate
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <UserX className="w-4 h-4" /> Block
                                  </span>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* COMPLAINTS & REPORTS TAB */}
              {activeTab === "reports" && (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-green-100 space-y-6">
                  <h3 className="text-xl font-bold text-green-800">Customer Complaints & Reports</h3>
                  {reports.length === 0 ? (
                    <p className="text-center py-6 text-green-600">No farm reports filed by customers.</p>
                  ) : (
                    <div className="divide-y divide-green-50 space-y-4">
                      {reports.map((report) => (
                        <div key={report._id} className="pt-4 flex flex-col md:flex-row gap-4 justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-green-800">
                                Farm: {report.farmId?.farmName || "Deleted Farm"}
                              </h4>
                              <Badge
                                className={
                                  report.status === "Resolved"
                                    ? "bg-green-600"
                                    : report.status === "Dismissed"
                                    ? "bg-gray-400"
                                    : "bg-red-500"
                                }
                              >
                                {report.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-green-700">
                              <b>Reported By:</b> {report.customerId?.name || "Anonymous"} ({report.customerId?.email})
                            </p>
                            <p className="text-sm bg-red-50/50 text-red-800 border border-red-100 p-3 rounded-2xl">
                              ⚠️ <b>Complaint:</b> {report.reportReason}
                            </p>
                          </div>

                          {report.status === "Pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleResolveReport(report._id, "Resolved")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveReport(report._id, "Dismissed")}
                              >
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BOOKINGS AUDIT TAB */}
              {activeTab === "bookings" && (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-green-100 space-y-6">
                  <h3 className="text-xl font-bold text-green-800">Booking logs & visit monitoring</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-green-100 text-green-700 font-bold">
                          <th className="py-3 px-4">Farm Visit</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Farmer</th>
                          <th className="py-3 px-4">Date/Time</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-50">
                        {bookings.map((b) => (
                          <tr key={b._id} className="hover:bg-green-50/20">
                            <td className="py-3 px-4 font-semibold text-green-800">
                              {b.farmId?.farmName || "Deleted Farm"}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-green-750">{b.customerId?.name}</div>
                              <div className="text-xs text-gray-400">{b.customerId?.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-green-750">{b.farmerId?.name}</div>
                              <div className="text-xs text-gray-400">{b.farmerId?.contactNumber}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div>{new Date(b.bookingDate).toLocaleDateString()}</div>
                              <div className="text-xs text-green-600 font-bold">{b.bookingTime}</div>
                            </td>
                            <td className="py-3 px-4 font-bold text-green-800">₹{b.farmId?.pricing || 0}</td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  b.bookingStatus === "Accepted"
                                    ? "bg-green-600 text-white"
                                    : b.bookingStatus === "Rejected"
                                    ? "bg-red-500 text-white"
                                    : "bg-yellow-500 text-white"
                                }
                              >
                                {b.bookingStatus}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
