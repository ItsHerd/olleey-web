"use client";

import ProcessingPage from "@/app/ProcessingPage";

export default function ProcessingWorkflowPage({ params }: { params: { id: string } }) {
    // ProcessingPage uses ReviewContext state, not URL params
    return <ProcessingPage />;
}
