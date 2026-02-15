"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface Point {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  ox: number;
  oy: number;
  oz: number;
  size: number;
  color: string;
}

export default function PixelatedGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Scroll tracking for the "coming together" and "hiding" effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Transformation for the "assembling" effect
  const assembleProgress = useTransform(smoothProgress, [0.1, 0.4], [0, 1]);

  // Transformation for the "hiding" effect - we'll use sticky positioning for this
  const opacity = useTransform(smoothProgress, [0.7, 0.9], [1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.1, 0.5, 0.7, 1], [0.8, 0.8, 1, 1, 0.9]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let points: Point[] = [];
    const count = isMobile ? 2000 : 4000;
    const radius = isMobile ? 240 : 450;

    // Initialize points
    const initPoints = () => {
      points = [];
      for (let i = 0; i < count; i++) {
        // Spherical coordinates for target position
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;

        const tx = radius * Math.sin(phi) * Math.cos(theta);
        const ty = radius * Math.cos(phi);
        const tz = radius * Math.sin(phi) * Math.sin(theta);

        // Random starting positions (spread out)
        const ox = (Math.random() - 0.5) * 1500;
        const oy = (Math.random() - 0.5) * 1500;
        const oz = (Math.random() - 0.5) * 1500;

        points.push({
          x: ox,
          y: oy,
          z: oz,
          tx,
          ty,
          tz,
          ox,
          oy,
          oz,
          size: Math.random() * 2 + 0.5,
          color: i % 10 === 0 ? "#10b981" : "#d4e157", // Emerald and Lime colors
        });
      }
    };

    initPoints();

    let rotationX = 0;
    let rotationY = 0;

    const animate = () => {
      if (!ctx || !canvas) return;

      const progress = assembleProgress.get();

      // Update canvas size
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      rotationY += 0.003;
      rotationX += 0.0012;

      // Sort points by Z to draw distant ones first
      const sortedPoints = [...points].sort((a, b) => b.z - a.z);

      sortedPoints.forEach((p) => {
        // Interpolate between initial random position and target spherical position
        const targetX = p.tx;
        const targetY = p.ty;
        const targetZ = p.tz;

        // Current unrotated position based on scroll assembly
        const curX = p.ox + (targetX - p.ox) * progress;
        const curY = p.oy + (targetY - p.oy) * progress;
        const curZ = p.oz + (targetZ - p.oz) * progress;

        // Rotate
        let x = curX;
        let y = curY;
        let z = curZ;

        // Y axis rotation
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // X axis rotation
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        // Perspective projection - adjusted for larger radius
        const perspective = 1200 / (1200 + p.z);
        const screenX = centerX + p.x * perspective;
        const screenY = centerY + p.y * perspective;

        const size = p.size * perspective;
        const alpha = Math.max(0, Math.min(1, perspective * 1.8 - 0.7));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.8;

        // Draw pixel (square)
        ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  return (
    <div ref={containerRef} className="relative h-[400vh] z-0 bg-white dark:bg-black transition-colors duration-300">
      {/* Sticky container for the globe */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pointer-events-none">
        <motion.div
          style={{ opacity, scale }}
          className="relative w-full h-full max-w-[1200px] flex items-center justify-center"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full max-w-[1000px] max-h-[1000px]"
          />

          {/* Text Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h2 className="text-4xl lg:text-8xl font-normal text-zinc-900 dark:text-zinc-100 leading-tight mb-8 font-mono uppercase tracking-tighter">
                we are meant to
                <br />
                <span className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4">share stories.</span>
              </h2>
              <p className="text-sm lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-mono font-medium">
                Break every linguistic barrier.
                <br />
                Keep your voice. Scale your impact.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Spacer for scroll assembly effect */}
      <div className="h-[300vh]" />
    </div>
  );
}
