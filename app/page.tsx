"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ContentPage from "./pages/ContentPage";
import ChannelsPage from "./pages/ChannelsPage";
import AccountsPage from "./pages/AccountsPage";
import LanguagesPage from "./pages/LanguagesPage";
import DestinationsPage from "./pages/DestinationsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("Content");

  const getPageTitle = () => {
    return currentPage;
  };

  const renderPage = () => {
    switch (currentPage) {
      case "Content":
        return <ContentPage />;
      case "Channels":
        return <ChannelsPage />;
      case "Accounts":
        return <AccountsPage />;
      case "Languages":
        return <LanguagesPage />;
      case "Destinations":
        return <DestinationsPage />;
      case "Settings":
        return <SettingsPage />;
      default:
        return <ContentPage />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={getPageTitle()} />
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  );
}
