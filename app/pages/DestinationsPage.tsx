"use client";

const PLATFORMS = [
  {
    id: "youtube",
    name: "YouTube",
    color: "bg-red-500",
    status: "Active",
    notes: "Primary distribution platform"
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "bg-black",
    status: "Active",
    notes: "Short-form content optimized"
  },
  {
    id: "instagram",
    name: "Instagram",
    color: "bg-pink-500",
    status: "Inactive",
    notes: "Awaiting configuration"
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "bg-blue-600",
    status: "Inactive",
    notes: "Awaiting configuration"
  },
  {
    id: "x",
    name: "X",
    color: "bg-gray-900",
    status: "Inactive",
    notes: "Awaiting configuration"
  }
];

export default function DestinationsPage() {
  return (
    <div className="flex-1 p-6 bg-[#f9fafb]">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#111827]">Destinations</h2>
        <p className="text-sm text-[#6b7280] mt-1">
          Overview of platform configurations and status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORMS.map((platform) => (
          <div
            key={platform.id}
            className="bg-white border border-[#e5e7eb] rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-full ${platform.color} flex items-center justify-center text-white font-bold text-lg`}
              >
                {platform.name[0]}
              </div>
              <div>
                <div className="font-semibold text-[#111827]">{platform.name}</div>
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    platform.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {platform.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#6b7280] mb-4">{platform.notes}</p>

            <button className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]">
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
