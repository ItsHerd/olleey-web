"use client";

import { useState } from "react";

type Channel = {
  id: string;
  name: string;
  creator: string;
  language: string;
  subscribers: string;
  videos: number;
  color?: string;
};

const CHANNELS: Channel[] = [
  { id: "mrbeast-french", name: "MrBeast French", creator: "MrBeast", language: "French", subscribers: "2.5M", videos: 145, color: "#FF6B6B" },
  { id: "mrbeast-spanish", name: "MrBeast Spanish", creator: "MrBeast", language: "Spanish", subscribers: "3.2M", videos: 158, color: "#4ECDC4" },
  { id: "mrbeast-german", name: "MrBeast German", creator: "MrBeast", language: "German", subscribers: "1.8M", videos: 132, color: "#FFD93D" },
  { id: "mrbeast-portuguese", name: "MrBeast Portuguese", creator: "MrBeast", language: "Portuguese", subscribers: "2.1M", videos: 140, color: "#95E1D3" },
  { id: "mrbeast-hindi", name: "MrBeast Hindi", creator: "MrBeast", language: "Hindi", subscribers: "4.5M", videos: 165, color: "#FF8B94" },
  { id: "mrbeast-japanese", name: "MrBeast Japanese", creator: "MrBeast", language: "Japanese", subscribers: "1.5M", videos: 128, color: "#A8E6CF" },
  { id: "mrbeast-arabic", name: "MrBeast Arabic", creator: "MrBeast", language: "Arabic", subscribers: "2.8M", videos: 150, color: "#FFB6C1" },
  { id: "mrbeast-russian", name: "MrBeast Russian", creator: "MrBeast", language: "Russian", subscribers: "1.9M", videos: 135, color: "#C7CEEA" },
  { id: "mrbeast-korean", name: "MrBeast Korean", creator: "MrBeast", language: "Korean", subscribers: "2.3M", videos: 142, color: "#FFDAC1" },
  { id: "mrbeast-italian", name: "MrBeast Italian", creator: "MrBeast", language: "Italian", subscribers: "1.6M", videos: 130, color: "#B5EAD7" },
  { id: "pewdiepie-french", name: "PewDiePie French", creator: "PewDiePie", language: "French", subscribers: "1.2M", videos: 98, color: "#FF6B9D" },
  { id: "pewdiepie-spanish", name: "PewDiePie Spanish", creator: "PewDiePie", language: "Spanish", subscribers: "1.8M", videos: 112, color: "#C44569" },
  { id: "markiplier-spanish", name: "Markiplier Spanish", creator: "Markiplier", language: "Spanish", subscribers: "980K", videos: 87, color: "#FFA07A" },
  { id: "markiplier-french", name: "Markiplier French", creator: "Markiplier", language: "French", subscribers: "750K", videos: 76, color: "#98D8C8" },
  { id: "dude-perfect-spanish", name: "Dude Perfect Spanish", creator: "Dude Perfect", language: "Spanish", subscribers: "2.2M", videos: 125, color: "#6C5CE7" },
  { id: "dude-perfect-portuguese", name: "Dude Perfect Portuguese", creator: "Dude Perfect", language: "Portuguese", subscribers: "1.5M", videos: 110, color: "#A29BFE" },
];

export default function ChannelsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedChannel, setSelectedChannel] = useState<Channel>(CHANNELS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ["All", "MrBeast", "PewDiePie", "Markiplier", "Dude Perfect"];

  const filteredChannels = CHANNELS.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeTab === "All" || channel.creator === activeTab)
  );

  return (
    <div className="flex h-full bg-gradient-to-br from-white to-gray-50">
      <div className="w-[320px] bg-white shadow-sm flex flex-col border-r border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-1.5">Your Channels</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Manage your translated channels
          </p>
        </div>

        <div className="px-4 py-4 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex border-b border-gray-100 bg-white overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3 py-3 text-xs font-medium relative transition-all ${
                activeTab === tab
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all ${
                selectedChannel.id === channel.id 
                  ? "bg-blue-50 border-l-2 border-blue-500" 
                  : "hover:bg-gray-50 border-l-2 border-transparent"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm`}
                   style={{ backgroundColor: channel.color }}>
                {channel.language.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${
                  selectedChannel.id === channel.id ? "text-gray-900" : "text-gray-700"
                }`}>
                  {channel.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span>{channel.subscribers}</span>
                  <span>•</span>
                  <span>{channel.videos} videos</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Channel Header */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg`}
                   style={{ backgroundColor: selectedChannel.color }}>
                {selectedChannel.language.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedChannel.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedChannel.subscribers} subscribers • {selectedChannel.videos} videos • {selectedChannel.language}
                </p>
              </div>
            </div>
          </div>

          {/* Channel Settings Form */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Channel Information</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedChannel.name}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Creator
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedChannel.creator}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Language
                    </label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                      <option>{selectedChannel.language}</option>
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Portuguese</option>
                      <option>Hindi</option>
                      <option>Japanese</option>
                      <option>Arabic</option>
                      <option>Russian</option>
                      <option>Korean</option>
                      <option>Italian</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@channel"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Translation Settings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Translation Settings</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Type
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                    <option>AI Voice Clone</option>
                    <option>Professional Voice Actor</option>
                    <option>Text-to-Speech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Translation Quality
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                    <option>High Quality (Slower)</option>
                    <option>Balanced</option>
                    <option>Fast (Lower Quality)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Auto-translate new videos</p>
                    <p className="text-xs text-gray-500 mt-1">Automatically translate and upload new content</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors shadow-inner"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Past Videos */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Past Videos Uploaded</h2>
              
              <div className="space-y-3 mb-4">
                {[
                  { title: "I Survived 7 Days In An Abandoned City", views: "45M views", date: "2 days ago", status: "Published" },
                  { title: "$1 vs $100,000,000 Car!", views: "38M views", date: "1 week ago", status: "Published" },
                  { title: "I Built Willy Wonka's Chocolate Factory!", views: "52M views", date: "2 weeks ago", status: "Published" },
                  { title: "7 Days Stranded At Sea", views: "41M views", date: "3 weeks ago", status: "Processing" },
                ].map((video, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-32 h-20 bg-gray-300 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{video.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{video.views} • {video.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        video.status === "Published" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {video.status}
                      </span>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
                + Add Video Manually
              </button>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                Save Changes
              </button>
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
