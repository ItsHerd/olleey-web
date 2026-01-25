"use client"

import {
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
    type MouseEvent,
} from "react"
import Image, { type StaticImageData } from "next/image"
import clsx from "clsx"
import {
    AnimatePresence,
    motion,
    useMotionTemplate,
    useMotionValue,
    type MotionStyle,
    type MotionValue,
    type Variants,
} from "motion/react"
import Balancer from "react-wrap-balancer"

import { cn } from "@/lib/utils"

type WrapperStyle = MotionStyle & {
    "--x": MotionValue<string>
    "--y": MotionValue<string>
}

interface CardProps {
    title: string
    description: string
    bgClass?: string
}

interface ImageSet {
    step1light1: StaticImageData | string
    step1light2: StaticImageData | string
    step2light1: StaticImageData | string
    step2light2: StaticImageData | string
    step3light: StaticImageData | string
    alt: string
}

export interface ComponentProps extends CardProps {
    step1img1Class?: string
    step1img2Class?: string
    step2img1Class?: string
    step2img2Class?: string
    step3imgClass?: string
    image: ImageSet
}

interface StepImageProps {
    src: StaticImageData | string
    alt: string
    className?: string
    style?: React.CSSProperties
    width?: number
    height?: number
}

interface Step {
    id: string
    name: string
    title: string
    description: string
}

const TOTAL_STEPS = 3

const steps: readonly Step[] = [
    {
        id: "1",
        name: "Step 1",
        title: "40+ Languages",
        description: "Reach global audiences with natural-sounding voiceovers in over 40 languages while preserving emotion and tone",
    },
    {
        id: "2",
        name: "Step 2",
        title: "Lightning Fast",
        description: "Upload once and get professionally dubbed videos in minutes, not days or weeks",
    },
    {
        id: "3",
        name: "Step 3",
        title: "Lip Sync Perfect",
        description: "Advanced AI ensures your dubbed videos look as natural as the original with perfect lip synchronization",
    },
] as const

const ANIMATION_PRESETS = {
    fadeInScale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 25,
            mass: 0.5,
        },
    },
    slideInRight: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 25,
            mass: 0.5,
        },
    },
    slideInLeft: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 25,
            mass: 0.5,
        },
    },
} as const

type AnimationPreset = keyof typeof ANIMATION_PRESETS

interface AnimatedStepImageProps extends StepImageProps {
    preset?: AnimationPreset
    delay?: number
    onAnimationComplete?: () => void
}

function useNumberCycler(
    totalSteps: number = TOTAL_STEPS,
    interval: number = 3000
) {
    const [currentNumber, setCurrentNumber] = useState(0)
    const timerRef = useRef<NodeJS.Timeout>()

    const setupTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
            setCurrentNumber((prev) => (prev + 1) % totalSteps)
            setupTimer()
        }, interval)
    }, [interval, totalSteps])

    const increment = useCallback(() => {
        setCurrentNumber((prev) => (prev + 1) % totalSteps)
        setupTimer()
    }, [totalSteps, setupTimer])

    useEffect(() => {
        setupTimer()
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [setupTimer])

    return {
        currentNumber,
        increment,
    }
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const userAgent = navigator.userAgent
        const isSmall = window.matchMedia("(max-width: 768px)").matches
        const isMobileUserAgent = Boolean(
            /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.exec(
                userAgent
            )
        )
        const isDev = process.env.NODE_ENV !== "production"
        if (isDev) {
            setIsMobile(isSmall || isMobileUserAgent)
        } else {
            setIsMobile(isSmall && isMobileUserAgent)
        }
    }, [])
    return isMobile
}

function IconCheck({ className, ...props }: React.ComponentProps<"svg">) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn("h-4 w-4", className)}
            {...props}
        >
            <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
        </svg>
    )
}

const stepVariants: Variants = {
    inactive: {
        scale: 0.8,
        opacity: 0.5,
    },
    active: {
        scale: 1,
        opacity: 1,
    },
}

const StepImage = forwardRef<
    HTMLImageElement,
    StepImageProps & { [key: string]: any }
>(
    (
        { src, alt, className, style, width = 1200, height = 630, ...props },
        ref
    ) => {
        return (
            <Image
                ref={ref}
                alt={alt}
                className={className}
                src={src}
                width={width}
                height={height}
                style={{
                    position: "absolute",
                    userSelect: "none",
                    maxWidth: "unset",
                    ...style,
                }}
                {...props}
            />
        )
    }
)
StepImage.displayName = "StepImage"

const MotionStepImage = motion(StepImage)

const AnimatedStepImage = ({
    preset = "fadeInScale",
    delay = 0,
    onAnimationComplete,
    ...props
}: AnimatedStepImageProps) => {
    const presetConfig = ANIMATION_PRESETS[preset]
    return (
        <MotionStepImage
            {...props}
            {...presetConfig}
            transition={{
                ...presetConfig.transition,
                delay,
            }}
            onAnimationComplete={onAnimationComplete}
        />
    )
}

function FeatureCard({
    bgClass,
    children,
    step,
}: CardProps & {
    children: React.ReactNode
    step: number
}) {
    const [mounted, setMounted] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const isMobile = useIsMobile()

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        if (isMobile) return
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <motion.div
            className="animated-cards relative w-full rounded-[16px]"
            onMouseMove={handleMouseMove}
            style={
                {
                    "--x": useMotionTemplate`${mouseX}px`,
                    "--y": useMotionTemplate`${mouseY}px`,
                } as WrapperStyle
            }
        >
            <div
                className={clsx(
                    "group relative w-full overflow-hidden rounded-3xl border border-white/20 bg-transparent transition duration-300",
                    "md:hover:border-white/30 md:hover:shadow-xl",
                    bgClass
                )}
            >
                <div className="m-12 md:m-16 min-h-[550px] md:min-h-[650px] w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            className="flex w-4/6 flex-col gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{
                                duration: 0.3,
                                ease: [0.23, 1, 0.32, 1],
                            }}
                        >
                            <motion.h2
                                className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    delay: 0.1,
                                    duration: 0.3,
                                    ease: [0.23, 1, 0.32, 1],
                                }}
                            >
                                {steps[step].title}
                            </motion.h2>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    delay: 0.2,
                                    duration: 0.3,
                                    ease: [0.23, 1, 0.32, 1],
                                }}
                            >
                                <p className="text-base leading-6 text-gray-300 md:text-lg md:leading-7">
                                    <Balancer>{steps[step].description}</Balancer>
                                </p>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                    {mounted ? children : null}
                </div>
            </div>
        </motion.div>
    )
}

function Steps({
    steps: stepData,
    current,
    onChange,
}: {
    steps: readonly Step[]
    current: number
    onChange: (index: number) => void
}) {
    return (
        <nav aria-label="Progress" className="flex justify-center px-4">
            <ol
                className="flex w-full flex-wrap items-start justify-start gap-2 sm:justify-center md:w-10/12 md:divide-y-0"
                role="list"
            >
                {stepData.map((step, stepIdx) => {
                    const isCompleted = current > stepIdx
                    const isCurrent = current === stepIdx
                    const isFuture = !isCompleted && !isCurrent

                    return (
                        <motion.li
                            key={`${step.name}-${stepIdx}`}
                            initial="inactive"
                            animate={isCurrent ? "active" : "inactive"}
                            variants={stepVariants}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "relative z-50 rounded-full px-3 py-1 transition-all duration-300 ease-in-out md:flex",
                                isCompleted ? "bg-gray-200" : "bg-gray-100"
                            )}
                        >
                            <div
                                className={cn(
                                    "group flex w-full cursor-pointer items-center focus:outline-none focus-visible:ring-2",
                                    (isFuture || isCurrent) && "pointer-events-none"
                                )}
                                onClick={() => onChange(stepIdx)}
                            >
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <motion.span
                                        initial={false}
                                        animate={{
                                            scale: isCurrent ? 1.2 : 1,
                                        }}
                                        className={cn(
                                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full duration-300",
                                            isCompleted &&
                                            "bg-blue-500 text-white",
                                            isCurrent &&
                                            "bg-blue-400/80 text-gray-700",
                                            isFuture && "bg-gray-300"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    type: "spring" as const,
                                                    stiffness: 300,
                                                    damping: 20,
                                                }}
                                            >
                                                <IconCheck className="h-3 w-3 stroke-white stroke-[3] text-white" />
                                            </motion.div>
                                        ) : (
                                            <span
                                                className={cn(
                                                    "text-xs",
                                                    isCurrent ? "text-white" : "text-gray-600"
                                                )}
                                            >
                                                {stepIdx + 1}
                                            </span>
                                        )}
                                    </motion.span>
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={clsx(
                                            "text-sm font-medium duration-300",
                                            isCompleted && "text-gray-600",
                                            isCurrent && "text-blue-600 font-semibold",
                                            isFuture && "text-gray-500"
                                        )}
                                    >
                                        {step.name}
                                    </motion.span>
                                </span>
                            </div>
                        </motion.li>
                    )
                })}
            </ol>
        </nav>
    )
}

const defaultClasses = {
    step1img1:
        "pointer-events-none w-[50%] border border-gray-200 transition-all duration-500 rounded-2xl",
    step1img2:
        "pointer-events-none w-[60%] border border-gray-200 transition-all duration-500 overflow-hidden rounded-2xl",
    step2img1:
        "pointer-events-none w-[50%] border border-gray-200 transition-all duration-500 rounded-2xl overflow-hidden",
    step2img2:
        "pointer-events-none w-[40%] border border-gray-200 transition-all duration-500 rounded-2xl overflow-hidden",
    step3img:
        "pointer-events-none w-[90%] border border-gray-200 rounded-2xl transition-all duration-500 overflow-hidden",
} as const


export const OlleeyFeatureCarousel = ({
    image,
    step1img1Class = defaultClasses.step1img1,
    step1img2Class = defaultClasses.step1img2,
    step2img1Class = defaultClasses.step2img1,
    step2img2Class = defaultClasses.step2img2,
    step3imgClass = defaultClasses.step3img,
    ...props
}: ComponentProps) => {
    const { currentNumber: step, increment } = useNumberCycler()
    const [isAnimating, setIsAnimating] = useState(false)

    const handleIncrement = () => {
        if (isAnimating) return
        setIsAnimating(true)
        increment()
    }

    const handleAnimationComplete = () => {
        setIsAnimating(false)
    }

    const renderStepContent = () => {
        const content = () => {
            switch (step) {
                case 0:
                    return (
                        <motion.div
                            className="relative w-full h-full"
                            onAnimationComplete={handleAnimationComplete}
                        >
                            <AnimatedStepImage
                                alt={image.alt}
                                className={clsx(step1img1Class)}
                                src={image.step1light1}
                                preset="slideInLeft"
                            />
                            <AnimatedStepImage
                                alt={image.alt}
                                className={clsx(step1img2Class)}
                                src={image.step1light2}
                                preset="slideInRight"
                                delay={0.1}
                            />
                        </motion.div>
                    )
                case 1:
                    return (
                        <motion.div
                            className="relative w-full h-full"
                            onAnimationComplete={handleAnimationComplete}
                        >
                            <AnimatedStepImage
                                alt={image.alt}
                                className={clsx(step2img1Class, "rounded-2xl")}
                                src={image.step2light1}
                                preset="fadeInScale"
                            />
                            <AnimatedStepImage
                                alt={image.alt}
                                className={clsx(step2img2Class, "rounded-2xl")}
                                src={image.step2light2}
                                preset="fadeInScale"
                                delay={0.1}
                            />
                        </motion.div>
                    )
                case 2:
                    return (
                        <AnimatedStepImage
                            alt={image.alt}
                            className={clsx(step3imgClass, "rounded-2xl")}
                            src={image.step3light}
                            preset="fadeInScale"
                            onAnimationComplete={handleAnimationComplete}
                        />
                    )
                default:
                    return null
            }
        }

        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    {...ANIMATION_PRESETS.fadeInScale}
                    className="w-full h-full absolute"
                >
                    {content()}
                </motion.div>
            </AnimatePresence>
        )
    }

    return (
        <FeatureCard {...props} step={step}>
            {renderStepContent()}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute left-[12rem] top-5 z-50 h-full w-full cursor-pointer md:left-0"
            >
                <Steps current={step} onChange={() => { }} steps={steps} />
            </motion.div>
            <motion.div
                className="absolute right-0 top-0 z-50 h-full w-full cursor-pointer md:left-0"
                onClick={handleIncrement}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            />
        </FeatureCard>
    )
}

OlleeyFeatureCarousel.displayName = "OlleeyFeatureCarousel"
