"use client";

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoadingPandaProps {
    size?: number;
    className?: string;
}

export function LoadingPanda({ size = 120, className = "" }: LoadingPandaProps) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div style={{ width: size, height: size }}>
                <DotLottieReact
                    src="/panda.lottie"
                    loop
                    autoplay
                />
            </div>
        </div>
    );
}
