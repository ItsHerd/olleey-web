"use client";

import ProcessingPage from "@/app/ProcessingPage";
import { use } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ProcessingWorkflowPage({ params }: PageProps) {
    // Unwrap the async params
    const { id } = use(params);

    // ProcessingPage uses ReviewContext state, not URL params
    // The id is available if needed in the future
    return <ProcessingPage />;
}
