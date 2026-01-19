"use client";

import { useState } from "react";
import { MOCK_ACCOUNTS } from "../data/mockData";
import type { Account } from "../data/mockData";

export default function AccountsPage() {
  const [accounts] = useState<Account[]>(MOCK_ACCOUNTS);

  const getPlatformColor = (platform: Account["platform"]) => {
    const colors: Record<Account["platform"], string> = {
      YouTube: "bg-red-500",
      TikTok: "bg-black",
      Instagram: "bg-pink-500",
      Facebook: "bg-blue-600",
      X: "bg-gray-900"
    };
    return colors[platform] || "bg-gray-500";
  };

  return (
    <div className="flex-1 p-6 bg-[#f9fafb]">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#111827]">Destination Accounts</h2>
        <p className="text-sm text-[#6b7280] mt-1">
          Manage accounts where your content will be distributed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white border border-[#e5e7eb] rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${getPlatformColor(
                    account.platform
                  )} flex items-center justify-center text-white font-bold`}
                >
                  {account.platform[0]}
                </div>
                <div>
                  <div className="font-semibold text-[#111827]">{account.name}</div>
                  <div className="text-xs text-[#9ca3af]">{account.platform}</div>
                </div>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  account.connected
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {account.connected ? "Connected" : "Not connected"}
              </span>
            </div>

            <button
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
                account.connected
                  ? "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"
                  : "bg-[#111827] text-white hover:bg-[#1f2937]"
              }`}
            >
              {account.connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
