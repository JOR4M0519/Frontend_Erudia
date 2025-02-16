import { Bell } from "lucide-react";

export default function Notifications() {
    return (
      <button className="p-2 hover:bg-gray-200 rounded-full relative">
        <Bell className="h-6 w-6" />
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          2
        </span>
      </button>
    );
  }
  