"use client";

import { useState } from "react";

type Channel = {
  id: string;
  name: string;
  creator: string;
  language: string;
  subscribers: string;
  videos: number;
  lastUpdated: string;
  thumbnail: string;
};

const MOCK_CHANNELS: Channel[] = [
  { 
    id: "1", 
    name: "MrBeast French", 
    creator: "MrBeast",
    language: "French", 
    subscribers: "3.45M", 
    videos: 412, 
    lastUpdated: "1 day ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "2", 
    name: "MrBeast Spanish", 
    creator: "MrBeast",
    language: "Spanish", 
    subscribers: "27.8M", 
    videos: 531, 
    lastUpdated: "3 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_m8O0BxJY-dE8D1-7gVYq-5VMQnqr0qVGUqH7uT=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "3", 
    name: "MrBeast German", 
    creator: "MrBeast",
    language: "German", 
    subscribers: "2.1M", 
    videos: 298, 
    lastUpdated: "5 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "4", 
    name: "MrBeast Portuguese", 
    creator: "MrBeast",
    language: "Portuguese", 
    subscribers: "8.9M", 
    videos: 467, 
    lastUpdated: "4 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "5", 
    name: "MrBeast Hindi", 
    creator: "MrBeast",
    language: "Hindi", 
    subscribers: "4.2M", 
    videos: 321, 
    lastUpdated: "1 week ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "6", 
    name: "MrBeast Japanese", 
    creator: "MrBeast",
    language: "Japanese", 
    subscribers: "1.8M", 
    videos: 245, 
    lastUpdated: "6 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "7", 
    name: "MrBeast Arabic", 
    creator: "MrBeast",
    language: "Arabic", 
    subscribers: "5.6M", 
    videos: 389, 
    lastUpdated: "2 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "8", 
    name: "MrBeast Russian", 
    creator: "MrBeast",
    language: "Russian", 
    subscribers: "3.1M", 
    videos: 276, 
    lastUpdated: "1 week ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "9", 
    name: "MrBeast Korean", 
    creator: "MrBeast",
    language: "Korean", 
    subscribers: "2.4M", 
    videos: 254, 
    lastUpdated: "4 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "10", 
    name: "MrBeast Italian", 
    creator: "MrBeast",
    language: "Italian", 
    subscribers: "1.9M", 
    videos: 233, 
    lastUpdated: "5 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "11", 
    name: "PewDiePie French", 
    creator: "PewDiePie",
    language: "French", 
    subscribers: "1.5M", 
    videos: 189, 
    lastUpdated: "3 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "12", 
    name: "PewDiePie Spanish", 
    creator: "PewDiePie",
    language: "Spanish", 
    subscribers: "2.8M", 
    videos: 215, 
    lastUpdated: "2 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "13", 
    name: "Markiplier Spanish", 
    creator: "Markiplier",
    language: "Spanish", 
    subscribers: "980K", 
    videos: 145, 
    lastUpdated: "6 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "14", 
    name: "Markiplier French", 
    creator: "Markiplier",
    language: "French", 
    subscribers: "750K", 
    videos: 132, 
    lastUpdated: "1 week ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "15", 
    name: "Dude Perfect Spanish", 
    creator: "Dude Perfect",
    language: "Spanish", 
    subscribers: "3.2M", 
    videos: 178, 
    lastUpdated: "3 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  },
  { 
    id: "16", 
    name: "Dude Perfect Portuguese", 
    creator: "Dude Perfect",
    language: "Portuguese", 
    subscribers: "2.1M", 
    videos: 165, 
    lastUpdated: "5 days ago",
    thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kGRjk3FxPHD7M8TJYkxxVEPSPW0tVqTxKfPFsN=s176-c-k-c0x00ffffff-no-rj"
  }
];

export default function ChannelsPage() {
  const [selectedChannel, setSelectedChannel] = useState<Channel>(MOCK_CHANNELS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = MOCK_CHANNELS.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-transparent">
      {/* Middle Column - Channel List */}
      <div className="w-96 bg-transparent border-r border-gray-200 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full px-4 py-4 border-b border-gray-200 text-left transition-colors ${
                selectedChannel.id === channel.id 
                  ? "bg-blue-50 border-l-4 border-l-blue-600" 
                  : "hover:bg-gray-50 border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <img 
                  src={channel.thumbnail} 
                  alt={channel.name}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate mb-0.5">{channel.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">{channel.language}</p>
                  <p className="text-xs text-gray-500">{channel.subscribers} • {channel.videos} videos</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{channel.lastUpdated}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column - Channel Details & Form */}
      <div className="flex-1 overflow-y-auto bg-transparent">
        {/* Channel Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <img 
              src={selectedChannel.thumbnail} 
              alt={selectedChannel.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedChannel.name}</h1>
              <p className="text-sm text-gray-600">{selectedChannel.subscribers} subscribers • {selectedChannel.videos} videos • {selectedChannel.language}</p>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="px-8 py-6">
          {/* Channel Information */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Channel Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Channel Name
                </label>
                  <input
                    type="text"
                    defaultValue={selectedChannel.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Original Creator
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedChannel.creator}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Target Language
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>{selectedChannel.language}</option>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@channel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Translation Settings */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Translation Settings</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Voice Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>AI Voice Clone</option>
                    <option>Professional Voice Actor</option>
                    <option>Text-to-Speech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Translation Quality
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>High Quality</option>
                    <option>Balanced</option>
                    <option>Fast</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Translation Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Add specific instructions for cultural context, terminology preferences..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Auto-translate new uploads</p>
                  <p className="text-xs text-gray-600 mt-0.5">Automatically translate new videos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Past Videos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Past Videos Uploaded</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {[
                { title: "I Survived 7 Days In An Abandoned City", views: "45M", date: "2 days ago", status: "Published" },
                { title: "$1 vs $100,000,000 Car!", views: "38M", date: "1 week ago", status: "Published" },
                { title: "I Built Willy Wonka's Chocolate Factory!", views: "52M", date: "2 weeks ago", status: "Published" },
              ].map((video, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="w-24 h-16 bg-gray-300 rounded flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{video.title}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{video.views} views • {video.date}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                    {video.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex gap-3">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors">
              Save Changes
            </button>
            <button className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
