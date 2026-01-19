"use client";

type SidebarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const navItems = [
    { name: "Content", icon: <ContentIcon /> },
    { name: "Channels", icon: <ChannelsIcon /> },
    { name: "Accounts", icon: <AccountsIcon /> },
    { name: "Languages", icon: <LanguagesIcon /> },
    { name: "Destinations", icon: <DestinationsIcon /> },
    { name: "Settings", icon: <SettingsIcon /> }
  ];

  return (
    <aside className="w-72 bg-white border-r border-[#e5e7eb] flex flex-col">
      {/* Logo/Brand Area */}
      <div className="px-4 py-4">
        <div className="text-2xl font-bold text-[#111827]">VoxAll</div>
      </div>
      
      {/* Navigation - Centered vertically */}
      <nav className="flex-1 flex flex-col justify-center py-8">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.name)}
            className={`w-full flex items-center gap-5 px-6 py-4 text-xl transition-all ${
              currentPage === item.name
                ? "bg-[#f3f4f6] text-[#111827] font-semibold"
                : "text-[#111827] hover:bg-[#f9fafb] font-normal"
            }`}
          >
            <span className="w-7 h-7">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      {/* Bottom Action Button */}
      <div className="p-4 border-t border-[#e5e7eb]">
        <button className="w-full bg-[#111827] hover:bg-[#1f2937] text-white font-semibold text-lg py-4 rounded-full transition-colors">
          Upload Content
        </button>
      </div>
    </aside>
  );
}

function ContentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polygon points="10,9 15,12 10,15" fill="white" />
    </svg>
  );
}

function ChannelsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function AccountsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="9" r="3" />
      <circle cx="15" cy="15" r="3" />
      <path d="M3 18c0-2.5 2-4.5 4.5-4.5h3c.8 0 1.5.2 2.2.5" />
      <path d="M21 21c0-2.5-2-4.5-4.5-4.5h-3" />
    </svg>
  );
}

function LanguagesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM4 12c0-1.1.2-2.1.6-3.1l2.5 2.5v.6c0 1.1.9 2 2 2v1.4C6.5 14.7 4 13.6 4 12zm14 4c-.3-.9-1.1-1.5-2-1.5h-1v-3c0-.6-.4-1-1-1H8V9h2c.6 0 1-.4 1-1V6h2c1.1 0 2-.9 2-2v-.4c2.3 1 4 3.3 4 6 0 2.1-1 4-2.5 5.4z" />
    </svg>
  );
}

function DestinationsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5zm0 18l-7-7 1.4-1.4L12 17.2l5.6-5.6L19 13l-7 7z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.4 13c0-.3.1-.6.1-1s0-.7-.1-1l2.1-1.6c.2-.1.2-.4.1-.6l-2-3.5c-.1-.2-.3-.3-.6-.2l-2.5 1c-.5-.4-1.1-.7-1.7-1l-.4-2.6c0-.2-.2-.4-.5-.4h-4c-.3 0-.5.2-.5.4l-.4 2.6c-.6.2-1.1.6-1.7 1l-2.5-1c-.2-.1-.5 0-.6.2l-2 3.5c-.1.2 0 .5.1.6L4.6 11c0 .3-.1.6-.1 1s0 .7.1 1l-2.1 1.6c-.2.1-.2.4-.1.6l2 3.5c.1.2.3.3.6.2l2.5-1c.5.4 1.1.7 1.7 1l.4 2.6c0 .2.2.4.5.4h4c.3 0 .5-.2.5-.4l.4-2.6c.6-.2 1.1-.6 1.7-1l2.5 1c.2.1.5 0 .6-.2l2-3.5c.1-.2 0-.5-.1-.6L19.4 13zM12 15.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" />
    </svg>
  );
}
