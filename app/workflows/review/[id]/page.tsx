"use client";

import ReviewHubPage from "@/app/ReviewHubPage";

export default function ReviewWorkflowPage({ params }: { params: { id: string } }) {
    // ReviewHubPage will extract video ID from pathname automatically
    return <ReviewHubPage />;
}
