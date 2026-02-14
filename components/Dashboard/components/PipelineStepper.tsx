"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, LucideIcon } from "lucide-react";

interface PipelineStage {
  id: string;
  label: string;
  icon: LucideIcon;
  status: "completed" | "active" | "pending" | "failed";
}

interface PipelineStepperProps {
  stages: PipelineStage[];
  theme: string;
}

export function PipelineStepper({ stages, theme }: PipelineStepperProps) {
  const isDark = theme === "dark";

  return (
    <div className="relative">
      {/* Connection Line */}
      <div className={`absolute top-6 left-0 right-0 h-0.5 ${isDark ? "bg-gray-800" : "bg-gray-300"}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${
              (stages.filter((s) => s.status === "completed").length /
                (stages.length - 1)) *
              100
            }%`,
          }}
          className="h-full bg-[#FFC107]"
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Stages */}
      <div className="relative flex justify-between items-start">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = stage.status === "completed";
          const isActive = stage.status === "active";
          const isFailed = stage.status === "failed";

          let bgColor = isDark ? "bg-gray-800" : "bg-gray-200";
          let textColor = isDark ? "text-gray-500" : "text-gray-400";
          let borderColor = isDark ? "border-gray-700" : "border-gray-300";

          if (isCompleted) {
            bgColor = "bg-green-500";
            textColor = isDark ? "text-green-500" : "text-green-600";
            borderColor = "border-green-500";
          } else if (isActive) {
            bgColor = "bg-[#FFC107]";
            textColor = isDark ? "text-[#FFC107]" : "text-amber-600";
            borderColor = "border-[#FFC107]";
          } else if (isFailed) {
            bgColor = "bg-red-500";
            textColor = "text-red-500";
            borderColor = "border-red-500";
          }

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center gap-2 relative z-10"
            >
              {/* Icon Circle */}
              <motion.div
                className={`w-12 h-12 rounded-full border-2 ${borderColor} ${
                  isDark ? "bg-[#0A0A0A]" : "bg-white"
                } flex items-center justify-center`}
                whileHover={{ scale: 1.1 }}
                animate={
                  isActive
                    ? {
                        boxShadow: [
                          "0 0 0 0 rgba(255, 193, 7, 0.4)",
                          "0 0 0 8px rgba(255, 193, 7, 0)",
                        ],
                      }
                    : {}
                }
                transition={
                  isActive
                    ? {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop",
                      }
                    : {}
                }
              >
                {isCompleted ? (
                  <CheckCircle className={`w-6 h-6 ${textColor}`} />
                ) : isActive ? (
                  <Loader2 className={`w-6 h-6 ${textColor} animate-spin`} />
                ) : (
                  <Icon className={`w-5 h-5 ${textColor}`} />
                )}
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs font-medium ${textColor} text-center whitespace-nowrap`}
              >
                {stage.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-[#FFC107] text-black text-xs font-bold"
                >
                  Active
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
