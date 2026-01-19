"use client";

import { useState } from "react";
import { MOCK_VIDEOS } from "../data/mockData";
import type { Video } from "../data/mockData";
import SelectLanguagesModal from "../components/SelectLanguagesModal";
import SelectDestinationsModal from "../components/SelectDestinationsModal";

export default function ContentPage() {
  const [videos] = useState<Video[]>(MOCK_VIDEOS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("Videos");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

  const allSelected = videos.length > 0 && selectedIds.length === videos.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : videos.map((v) => v.id));
  };

  const toggleVideo = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((vid) => vid !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: Video["status"]) => {
    switch (status) {
      case "Ready":
        return "bg-gray-100 text-gray-700";
      case "In Progress":
        return "bg-amber-100 text-amber-700";
      case "Distributed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPlatformIcon = (platform: string) => {
    const colors: Record<string, string> = {
      youtube: "bg-red-500",
      tiktok: "bg-black",
      instagram: "bg-pink-500",
      facebook: "bg-blue-600",
      x: "bg-gray-900"
    };
    return (
      <div
        className={`w-6 h-6 rounded-full ${colors[platform] || "bg-gray-400"} flex items-center justify-center text-white text-xs font-bold`}
      >
        {platform[0].toUpperCase()}
      </div>
    );
  };

  const getRelativeTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-6 py-4 bg-white border-b border-[#e5e7eb]">
        <div className="flex gap-6">
          {["Videos", "Short-form", "Archived"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab
                  ? "text-[#111827] border-b-2 border-[#111827]"
                  : "text-[#6b7280]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-white border-b border-[#e5e7eb] px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="text-sm text-[#111827]">
            <span className="font-semibold">{selectedIds.length}</span> video
            {selectedIds.length > 1 ? "s" : ""} selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLanguageModal(true)}
              className="px-4 py-2 text-sm bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f9fafb] text-[#111827]"
            >
              Select Languages
            </button>
            <button
              onClick={() => setShowDestinationModal(true)}
              className="px-4 py-2 text-sm bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f9fafb] text-[#111827]"
            >
              Select Destinations
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-[#f9fafb]">
        <div className="m-6 bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] sticky top-0">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#e5e7eb]"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  Video
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  Source Channel
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  Languages
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  Destinations
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className={`border-b border-[#e5e7eb] ${
                    selectedIds.includes(video.id) ? "bg-[#f9fafb]" : "hover:bg-[#f3f4f6]"
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(video.id)}
                      onChange={() => toggleVideo(video.id)}
                      className="w-4 h-4 rounded border-[#e5e7eb]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-30 h-17 flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-30 h-17 object-cover rounded"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                          {video.duration}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#111827]">
                        {video.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.5 6.5c-.3-1-.9-1.7-1.9-2-1.6-.4-8.1-.4-8.1-.4s-6.5 0-8.1.4c-1 .3-1.6 1-1.9 2C3 8.1 3 11.5 3 11.5s0 3.4.5 5c.3 1 .9 1.7 1.9 2 1.6.4 8.1.4 8.1.4s6.5 0 8.1-.4c1-.3 1.6-1 1.9-2 .5-1.6.5-5 .5-5s0-3.4-.5-5z" />
                        <path fill="white" d="M9.5 15V8l6.5 3.5-6.5 3.5z" />
                      </svg>
                      <div>
                        <div className="text-sm text-[#111827]">{video.channel}</div>
                        <div className="text-xs text-[#9ca3af]">{video.sourcePlatform}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        video.status
                      )}`}
                    >
                      {video.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[#111827]">
                      {video.languages.slice(0, 3).join(", ")}
                      {video.languages.length > 3 && (
                        <span className="text-[#6b7280]"> +{video.languages.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {video.destinations.map((dest) => (
                        <div key={dest}>{getPlatformIcon(dest)}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#6b7280]">{getRelativeTime(video.updatedAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showLanguageModal && (
        <SelectLanguagesModal
          onClose={() => setShowLanguageModal(false)}
          onConfirm={(langs) => {
            setSelectedLanguages(langs);
            setShowLanguageModal(false);
          }}
          initialSelected={selectedLanguages}
        />
      )}

      {showDestinationModal && (
        <SelectDestinationsModal
          onClose={() => setShowDestinationModal(false)}
          onConfirm={(dests) => {
            setSelectedDestinations(dests);
            setShowDestinationModal(false);
          }}
          initialSelected={selectedDestinations}
        />
      )}
    </div>
  );
}
