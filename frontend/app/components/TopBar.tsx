"use client";

type TopBarProps = {
  title: string;
};

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-[#111827]">{title}</h1>
      <div className="flex items-center gap-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-4 py-2 w-96">
        <svg className="w-4 h-4 text-[#9ca3af]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 20.3 16.7 16a7 7 0 1 0-.7.7L20.3 21 21 20.3ZM5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" />
        </svg>
        <span className="text-sm text-[#9ca3af]">Search</span>
      </div>
    </header>
  );
}
