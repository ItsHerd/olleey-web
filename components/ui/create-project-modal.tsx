"use client";

import React, { useState } from "react";
import { X, Loader2, CheckCircle, AlertCircle, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/useTheme";
import { projectsAPI, youtubeAPI } from "@/lib/api";
import { logger } from "@/lib/logger";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateProjectModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateProjectModalProps) {
    const { theme } = useTheme();
    const [projectName, setProjectName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isConnectingChannel, setIsConnectingChannel] = useState(false);

    // Theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

    // Reset form when modal opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setProjectName("");
            setError(null);
            setSuccess(false);
            setIsConnectingChannel(false);
        }
    }, [isOpen]);

    const handleConnectChannel = async () => {
        try {
            setIsConnectingChannel(true);
            setError(null);

            // Initiate YouTube OAuth connection
            const response = await youtubeAPI.initiateConnection();

            // Redirect to OAuth URL
            window.location.href = response.auth_url;
        } catch (err: any) {
            logger.error("CreateProjectModal", "Failed to initiate channel connection", err);
            setError(err.message || "Failed to connect channel. Please try again.");
            setIsConnectingChannel(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validation
        if (!projectName.trim()) {
            setError("Please enter a project name");
            return;
        }

        try {
            setIsSubmitting(true);

            // Create the project
            await projectsAPI.createProject({
                name: projectName.trim(),
            });

            logger.info("CreateProjectModal", "Project created successfully");
            setSuccess(true);

            // Close modal after a brief delay
            setTimeout(() => {
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            }, 1500);
        } catch (err: any) {
            logger.error("CreateProjectModal", "Failed to create project", err);
            setError(err.message || "Failed to create project. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative ${cardClass} border ${borderClass} rounded-2xl shadow-2xl max-w-md w-full`}
            >
                {/* Header */}
                <div className={`sticky top-0 ${cardClass} border-b ${borderClass} px-6 py-4 flex items-center justify-between z-10`}>
                    <div>
                        <h2 className={`text-xl font-semibold ${textClass}`}>
                            Create New Project
                        </h2>
                        <p className={`text-sm ${textSecondaryClass} mt-1`}>
                            Set up a new dubbing project
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`${textSecondaryClass} hover:${textClass} transition-colors`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Project Name */}
                    <div>
                        <label className={`block text-sm font-medium ${textClass} mb-2`}>
                            Project Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="My Dubbing Project"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className={`w-full ${cardClass} ${borderClass} ${textClass}`}
                            disabled={isSubmitting || success}
                            autoFocus
                        />
                        <p className={`text-xs ${textSecondaryClass} mt-1`}>
                            Choose a descriptive name for your project
                        </p>
                    </div>

                    {/* Master Channel Requirement */}
                    <div className={`p-4 border ${borderClass} rounded-lg bg-blue-500/10`}>
                        <div className="flex items-start gap-3">
                            <Youtube className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${textClass} mb-1`}>
                                    Master Channel Required
                                </p>
                                <p className={`text-xs ${textSecondaryClass} mb-3`}>
                                    Each project needs at least one master YouTube channel to source content from.
                                </p>
                                <Button
                                    type="button"
                                    onClick={handleConnectChannel}
                                    disabled={isConnectingChannel}
                                    className="w-full bg-blue-500 text-white hover:bg-blue-600 text-sm"
                                >
                                    {isConnectingChannel ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Youtube className="h-4 w-4 mr-2" />
                                            Connect Master Channel
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-500">Project created successfully!</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting || success}
                            className="px-6 bg-white text-black border border-gray-300 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || success}
                            className="px-6 bg-black text-white hover:bg-gray-800"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Created!
                                </>
                            ) : (
                                "Create Project"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
