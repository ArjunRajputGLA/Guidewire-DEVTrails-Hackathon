"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, Info, XCircle, CheckCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserAndNotifications = async () => {
      let targetUserId = null;
      if (user?.role === "admin") {
        targetUserId = "2135b572-1dc8-4e4a-825f-b0c4f074d886";
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        targetUserId = session?.user?.id || null;
      }
      
      if (!targetUserId) return;
      setUserId(targetUserId);

      // Fetch initial notifications
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    fetchUserAndNotifications();

    // Setup click outside handling
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user?.role]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to new notifications
    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
            console.log("Realtime event received!", payload);
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
            setUnreadCount((count) => count + 1);

            // Show Toast
            if (newNotif.type === "success") {
              toast.success(newNotif.title + ": " + newNotif.message);
            } else if (newNotif.type === "error") {
              toast.error(newNotif.title + ": " + newNotif.message, { duration: 5000 });
            } else {
              toast(newNotif.title + ": " + newNotif.message, { icon: "ℹ️" });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime Subscribed Successfully to notifications for user:', userId);
          }
          if (status === 'CHANNEL_ERROR') {
            console.error('Realtime Channel Error. Check RLS policies and table replication settings.');
          }
        });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);
  };

  const getIcon = (type: string) => {
    if (type === "success") return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (type === "error") return <XCircle className="w-5 h-5 text-red-400" />;
    return <Info className="w-5 h-5 text-blue-400" />;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1a1b26] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          style={{ animation: 'slideIn 0.2s ease-out' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1f212e]">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {notifications.map((notif) => (
                  <li 
                    key={notif.id}
                    onClick={() => { if (!notif.is_read) markAsRead(notif.id) }}
                    className={`p-4 transition-colors cursor-pointer group flex gap-3 ${
                      notif.is_read ? "bg-transparent hover:bg-white/[0.02]" : "bg-blue-500/5 hover:bg-blue-500/10"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className={`text-sm font-semibold truncate ${notif.is_read ? 'text-gray-200' : 'text-white'}`}>
                          {notif.title}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(notif.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm leading-snug line-clamp-2 ${notif.is_read ? 'text-gray-400' : 'text-gray-300'}`}>
                        {notif.message}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="flex-shrink-0 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
