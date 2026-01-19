"use client";

import { useState } from "react";

type SelectDestinationsModalProps = {
  onClose: () => void;
  onConfirm: (destinations: string[]) => void;
  initialSelected: string[];
};

const PLATFORMS = [
  { id: "youtube", name: "YouTube", color: "bg-red-500" },
  { id: "tiktok", name: "TikTok", color: "bg-black" },
  { id: "instagram", name: "Instagram", color: "bg-pink-500" },
  { id: "facebook", name: "Facebook", color: "bg-blue-600" },
  { id: "x", name: "X", color: "bg-gray-900" }
];

export default function SelectDestinationsModal({
  onClose,
  onConfirm,
  initialSelected
}: SelectDestinationsModalProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const togglePlatform = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl shadow-xl">
        <div className="p-6 border-b border-[#e5e7eb]">
          <h2 className="text-xl font-semibold text-[#111827]">Select Destinations</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => (
              <label
                key={platform.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer ${
                  selected.includes(platform.id)
                    ? "border-[#111827] bg-[#f9fafb]"
                    : "border-[#e5e7eb] hover:border-[#d1d5db]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${platform.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {platform.name[0]}
                  </div>
                  <span className="text-sm font-medium text-[#111827]">
                    {platform.name}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={selected.includes(platform.id)}
                  onChange={() => togglePlatform(platform.id)}
                  className="w-4 h-4 rounded border-[#e5e7eb]"
                />
              </label>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-[#e5e7eb] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#6b7280] hover:text-[#111827]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="px-4 py-2 text-sm bg-[#111827] text-white rounded-lg hover:bg-[#1f2937]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
