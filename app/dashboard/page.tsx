"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { DemoProvider } from "@/lib/DemoContext";
import { ReviewProvider } from "@/lib/ReviewContext";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DemoProvider userEmail={user?.email}>
      <ReviewProvider>
        <DashboardLayout />
      </ReviewProvider>
    </DemoProvider>
  );
}
