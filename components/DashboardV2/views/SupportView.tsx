"use client";

import React from "react";
import { HelpCircle, MessageCircle, Book, Mail, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupportViewProps {
  theme: string;
}

export function SupportView({ theme }: SupportViewProps) {
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#0A0A0A]" : "bg-gray-50";
  const cardBgClass = isDark ? "bg-[#141414]" : "bg-white";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-500";

  const supportOptions = [
    {
      title: "Documentation",
      description: "Browse our comprehensive guides and tutorials",
      icon: Book,
      action: "View Docs",
      color: "blue",
    },
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      action: "Start Chat",
      color: "green",
    },
    {
      title: "Email Support",
      description: "Send us a detailed message about your issue",
      icon: Mail,
      action: "Send Email",
      color: "purple",
    },
    {
      title: "Feature Request",
      description: "Suggest new features or improvements",
      icon: FileText,
      action: "Submit Request",
      color: "orange",
    },
  ];

  const faqs = [
    {
      question: "How do I start a new localization?",
      answer: "Click the 'New Localization' button and follow the wizard to upload your video and select target languages.",
    },
    {
      question: "What video formats are supported?",
      answer: "We support MP4, MOV, AVI, and most common video formats up to 5GB in size.",
    },
    {
      question: "How long does processing take?",
      answer: "Processing time varies based on video length and number of languages, typically 5-15 minutes per language.",
    },
    {
      question: "Can I edit translations after processing?",
      answer: "Yes! You can review and edit all translations before publishing to your channels.",
    },
  ];

  return (
    <div className={`h-full ${bgClass} overflow-auto`}>
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-[#FFC107]" />
            <h1 className={`text-3xl font-bold ${textClass}`}>Support Center</h1>
          </div>
          <p className={`${mutedTextClass}`}>
            Get help with your localization projects and find answers to common questions
          </p>
        </div>

        {/* Support Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {supportOptions.map((option) => {
            const Icon = option.icon;
            const colorClasses = {
              blue: "bg-blue-500/10 text-blue-500 hover:border-blue-500/30",
              green: "bg-green-500/10 text-green-500 hover:border-green-500/30",
              purple: "bg-purple-500/10 text-purple-500 hover:border-purple-500/30",
              orange: "bg-orange-500/10 text-orange-500 hover:border-orange-500/30",
            }[option.color];

            return (
              <div
                key={option.title}
                className={`${cardBgClass} border ${borderClass} rounded-2xl p-6 hover:border-opacity-50 transition-all cursor-pointer group`}
              >
                <div className={`w-12 h-12 rounded-xl ${colorClasses.split(" ")[0]} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${colorClasses.split(" ")[1]}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${textClass}`}>
                  {option.title}
                </h3>
                <p className={`text-sm ${mutedTextClass} mb-4`}>
                  {option.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:border-white/20 transition-all"
                >
                  {option.action}
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className={`${cardBgClass} border ${borderClass} rounded-2xl p-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className={`text-base font-semibold mb-2 ${textClass}`}>
                  {faq.question}
                </h3>
                <p className={`text-sm ${mutedTextClass} leading-relaxed`}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className={`mt-6 ${cardBgClass} border ${borderClass} rounded-2xl p-6 text-center`}>
          <p className={`text-sm ${mutedTextClass}`}>
            Need immediate assistance? Email us at{" "}
            <a href="mailto:support@olleey.com" className="text-[#FFC107] hover:underline">
              support@olleey.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
