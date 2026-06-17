import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

interface NotificationObj {
  _id: string;
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationObj[]>([]);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/login");
      return;
    }
    setToken(storedToken);
    fetchNotifications(storedToken);
  }, [navigate]);

  const fetchNotifications = async (authToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${CONFIG_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`${CONFIG_API_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, readStatus: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${CONFIG_API_URL}/api/notifications/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    // Delete single isn't strictly defined but we can simulate locally or handle by refreshing
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const clearAll = async () => {
    try {
      const res = await fetch(`${CONFIG_API_URL}/api/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  const getFormatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-green-50 pb-6">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white font-bold">{unreadCount}</Badge>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                onClick={markAllAsRead}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-bold"
              >
                Mark all as read
              </Button>
            )}
            <Button
              size="sm"
              onClick={clearAll}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-bold"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="px-4 pt-6 max-w-xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-12 text-center border border-green-100">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-green-800 mb-1">No Notifications</h3>
            <p className="text-sm text-green-600">You are all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => markAsRead(notification._id)}
                className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition-all hover:shadow-md border border-green-50 ${
                  !notification.readStatus ? "border-2 border-green-300 bg-green-50/10" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2.5 rounded-full text-green-600 flex-shrink-0 mt-0.5">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-extrabold text-green-800 text-sm leading-snug">
                        {notification.title}
                      </h3>
                      {!notification.readStatus && (
                        <div className="w-2.5 h-2.5 bg-green-600 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-green-700 leading-relaxed mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between border-t border-green-50 pt-2 mt-1">
                      <span className="text-xs text-green-555 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {getFormatTime(notification.createdAt)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-650" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
