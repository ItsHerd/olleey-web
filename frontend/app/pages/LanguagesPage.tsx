"use client";

import { useState } from "react";
import { MOCK_LANGUAGES } from "../data/mockData";
import type { Language } from "../data/mockData";

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>(MOCK_LANGUAGES);

  const toggleLanguage = (code: string) => {
    setLanguages((prev) =>
      prev.map((lang) =>
        lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
      )
    );
  };

  return (
    <div className="flex-1 p-6 bg-[#f9fafb]">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#111827]">Languages</h2>
        <p className="text-sm text-[#6b7280] mt-1">
          Configure which languages are available for localization
        </p>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                Language
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                ISO Code
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#6b7280] uppercase">
                Enabled
              </th>
            </tr>
          </thead>
          <tbody>
            {languages.map((lang) => (
              <tr key={lang.code} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                <td className="px-6 py-4 text-sm text-[#111827] font-medium">
                  {lang.name}
                </td>
                <td className="px-6 py-4 text-sm text-[#6b7280]">{lang.code}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleLanguage(lang.code)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      lang.enabled ? "bg-[#111827]" : "bg-[#e5e7eb]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        lang.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
