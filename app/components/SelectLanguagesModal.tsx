"use client";

import { useState } from "react";

type SelectLanguagesModalProps = {
  onClose: () => void;
  onConfirm: (languages: string[]) => void;
  initialSelected: string[];
};

const LANGUAGES = [
  { code: "EN", name: "English" },
  { code: "ES", name: "Spanish" },
  { code: "FR", name: "French" },
  { code: "DE", name: "German" },
  { code: "AR", name: "Arabic" },
  { code: "HI", name: "Hindi" },
  { code: "ZH", name: "Chinese" },
  { code: "JA", name: "Japanese" },
  { code: "PT", name: "Portuguese" },
  { code: "IT", name: "Italian" }
];

export default function SelectLanguagesModal({
  onClose,
  onConfirm,
  initialSelected
}: SelectLanguagesModalProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [search, setSearch] = useState("");

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(search.toLowerCase()) ||
    lang.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggleLanguage = (code: string) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl shadow-xl">
        <div className="p-6 border-b border-[#e5e7eb]">
          <h2 className="text-xl font-semibold text-[#111827]">Select Languages</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search languages..."
            className="mt-4 w-full px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {filteredLanguages.map((lang) => (
              <label
                key={lang.code}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f9fafb] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(lang.code)}
                  onChange={() => toggleLanguage(lang.code)}
                  className="w-4 h-4 rounded border-[#e5e7eb]"
                />
                <span className="text-sm text-[#111827]">
                  {lang.name} ({lang.code})
                </span>
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
