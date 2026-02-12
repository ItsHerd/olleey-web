"use client";

import DashboardV2Layout from "@/components/DashboardV2/DashboardV2Layout";
import { DemoProvider } from "@/lib/DemoContext";
import { ReviewProvider } from "@/lib/ReviewContext";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardV2Page() {
  const { user } = useAuth();

  return (
    <DemoProvider userEmail={user?.email}>
      <ReviewProvider>
        <DashboardV2Layout />
      </ReviewProvider>
    </DemoProvider>
  );
}
