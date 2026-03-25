import { useState, useRef, useEffect } from "react";
import {
  Bell,
  ShieldAlert,
  FileSearch,
  AlertTriangle,
  CheckCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications, type Notification } from "../hooks/useNotifications";

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "approval_pending":
    case "access_request_received":
      return <FileSearch className="w-4 h-4 text-primary" />;
    case "critical_finding":
    case "critical_vuln":
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case "audit_returned":
    case "access_rejected":
      return <ShieldAlert className="w-4 h-4 text-amber-500" />;
    case "audit_approved":
    case "access_approved":
      return <CheckCheck className="w-4 h-4 text-green-500" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
}

function getNavigationPath(notification: Notification): string {
  switch (notification.type) {
    case "approval_pending":
      return notification.reference_id
        ? `/audit/programs/${notification.reference_id}/approve`
        : "/audit/programs";
    case "critical_finding":
      return "/audit/findings";
    case "audit_returned":
      return notification.reference_id
        ? `/audit/programs/${notification.reference_id}/execute`
        : "/audit/programs";
    case "audit_approved":
      return notification.reference_id
        ? `/audit/programs/${notification.reference_id}`
        : "/audit/programs";
    case "access_request_received":
    case "access_approved":
    case "access_rejected":
      return "/settings/team";
    case "critical_vuln":
      return "/github/security";
    default:
      return "/";
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
    navigate(getNavigationPath(notification));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full shadow-lg shadow-red-500/30 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 max-h-96 bg-background/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <h3 className="text-sm font-semibold text-foreground">
              Notificações
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
              >
                <CheckCheck className="w-3 h-3" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-72 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Bell className="w-8 h-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Nenhuma notificação.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-muted/40 border-b border-border/10 ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs truncate ${
                        !n.is_read
                          ? "font-semibold text-foreground"
                          : "text-foreground/80"
                      }`}
                    >
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    )}
                    <p className="text-[9px] text-muted-foreground/60 mt-1">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
