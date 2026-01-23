"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { logger } from "@/lib/logger";

function YouTubeConnectErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>("Unknown error");

  useEffect(() => {
    // Extract error message from URL parameter
    const errorParam = searchParams.get("error");

    if (errorParam) {
      // URL decode the error message
      setErrorMessage(decodeURIComponent(errorParam));
    }

    logger.error("YouTube Connect Error", "Error details received", {
      error: errorParam,
      decoded: errorMessage,
      current_url: window.location.href,
      all_params: Object.fromEntries(searchParams.entries()),
    });
  }, [searchParams, errorMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <X className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-normal text-gray-900 mb-2">
                Connection Failed
              </h1>
              <p className="text-dark-textSecondary mb-4">
                <strong>Error:</strong> {errorMessage}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/")}
                className="bg-dark-card hover:bg-dark-cardAlt text-dark-text font-normal py-3 px-6 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push("/")}
                className="bg-dark-card hover:bg-gray-200 text-gray-700 font-normal py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function YouTubeConnectErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-gray-900">Loading error details...</div>
        </div>
      </div>
    }>
      <YouTubeConnectErrorContent />
    </Suspense>
  );
}
