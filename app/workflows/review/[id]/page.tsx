"use client";

import ReviewHubPage from "@/app/ReviewHubPage";
import { use } from "react";

export const runtime = 'edge';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ReviewWorkflowPage({ params }: PageProps) {
    // Unwrap the async params
    const { id } = use(params);

    // ReviewHubPage will extract video ID from pathname automatically
    // The id is available if needed in the future
    return <ReviewHubPage />;
}
