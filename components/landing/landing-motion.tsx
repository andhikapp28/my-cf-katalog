"use client";

import React, { useState } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/utils";

// =============================================================================
// Palet Warna Resmi TANALOKA
// Surface: Gelap (#1B1D24)
// Accent: Coral Red (#FF4838 / #F84632)
// =============================================================================
export const TANALOKA_PALETTE = {
  cardDark: "#1B1D24",
  coralRed: "#FF4838",
  coralRedHover: "#F84632",
  glowColor: "rgba(255, 72, 56, 0.25)",
  borderColor: "rgba(255, 72, 56, 0.45)",
} as const;

export const TANALOKA_COLORS = TANALOKA_PALETTE;

// =============================================================================
// 1. FadeInView
// Pembungkus animasi masuk bertahap (fade + slight translate) saat elemen
// masuk ke viewport. Menghormati prefers-reduced-motion tanpa rAF / scroll listener.
// =============================================================================

export function getFadeInOffsets(
  direction: "up" | "down" | "left" | "right" | "none" = "up",
  distance: number = 20
) {
  switch (direction) {
    case "up":
      return { x: 0, y: distance };
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    case "none":
    default:
      return { x: 0, y: 0 };
  }
}

export interface FadeInViewProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
  margin?: string;
}

export function FadeInView({
  children,
  className,
  delay = 0,
  duration = 0.5,
  distance = 20,
  direction = "up",
  once = true,
  margin = "-30px",
  ...props
}: FadeInViewProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const offset = getFadeInOffsets(direction, distance);

  if (shouldReduceMotion) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// 2. HeroEntranceMotion & HeroEntranceItem
// Animasi staggered masuk untuk judul headline, subjudul, dan tombol aksi hero
// dengan transisi spring natural.
// =============================================================================

export function getHeroContainerVariants(
  shouldReduceMotion: boolean,
  delay: number = 0.05,
  staggerDelay: number = 0.12
): Variants {
  return {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
    },
  };
}

export function getHeroItemVariants(
  shouldReduceMotion: boolean,
  distance: number = 24
): Variants {
  return {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            type: "spring",
            stiffness: 120,
            damping: 18,
            mass: 0.8,
          },
    },
  };
}

export interface HeroEntranceItemProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  className?: string;
  distance?: number;
}

export function HeroEntranceItem({
  children,
  className,
  distance = 24,
  ...props
}: HeroEntranceItemProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const itemVariants = getHeroItemVariants(shouldReduceMotion, distance);

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export interface HeroEntranceMotionProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function HeroEntranceMotion({
  children,
  className,
  delay = 0.05,
  staggerDelay = 0.12,
  ...props
}: HeroEntranceMotionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const containerVariants = getHeroContainerVariants(
    shouldReduceMotion,
    delay,
    staggerDelay
  );

  return (
    <motion.div
      variants={containerVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

HeroEntranceMotion.Item = HeroEntranceItem;

// =============================================================================
// 3. MetricCardMotion
// Efek hover kartu metrik gelap (#1B1D24) dengan border glow Coral Red (#FF4838 / #F84632)
// dan transisi spring natural.
// =============================================================================

export function getMetricCardHoverVariants(
  glowColor: string = TANALOKA_PALETTE.glowColor,
  borderColor: string = TANALOKA_PALETTE.borderColor
) {
  return {
    scale: 1.02,
    y: -3,
    borderColor,
    boxShadow: `0 12px 28px -8px ${glowColor}`,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  };
}

export interface MetricCardMotionProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  glowColor?: string;
  borderColor?: string;
}

export function MetricCardMotion({
  children,
  className,
  delay = 0,
  glowColor = TANALOKA_PALETTE.glowColor,
  borderColor = TANALOKA_PALETTE.borderColor,
  ...props
}: MetricCardMotionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  const cardClasses = cn(
    "rounded-3xl border border-white/10 bg-[#1B1D24] transition-all",
    className
  );

  if (shouldReduceMotion) {
    return (
      <div className={cardClasses} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={getMetricCardHoverVariants(glowColor, borderColor)}
      whileTap={{
        scale: 0.99,
        transition: { type: "spring", stiffness: 500, damping: 30 },
      }}
      className={cardClasses}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// 4. BannerCardMotion, BannerImageMotion & BannerBadgeMotion
// Efek hover halus pada kartu banner 16:9 (zoom halus, border glow, dan elevasi badge)
// selaras dengan estetika TANALOKA.
// =============================================================================

export function getBannerCardHoverVariants(
  glowColor: string = TANALOKA_PALETTE.glowColor,
  borderColor: string = TANALOKA_PALETTE.borderColor
) {
  return {
    borderColor,
    boxShadow: `0 12px 28px -8px ${glowColor}`,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  };
}

export function getBannerCardVariants(
  shouldReduceMotion: boolean,
  glowColor: string = TANALOKA_PALETTE.glowColor,
  borderColor: string = TANALOKA_PALETTE.borderColor
): Variants {
  return {
    initial: {
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
    },
    hover: shouldReduceMotion
      ? {
          borderColor: "rgba(255, 255, 255, 0.1)",
          boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
        }
      : getBannerCardHoverVariants(glowColor, borderColor),
  };
}

export function getBannerImageVariants(
  shouldReduceMotion: boolean,
  duration: number = 0.45
): Variants {
  return {
    initial: { scale: 1 },
    hover: shouldReduceMotion
      ? { scale: 1 }
      : {
          scale: 1.05,
          transition: {
            duration,
            ease: "easeOut",
          },
        },
  };
}

export function getBannerBadgeVariants(
  shouldReduceMotion: boolean,
  scale: number = 1.02
): Variants {
  return {
    initial: { y: 0, scale: 1 },
    hover: shouldReduceMotion
      ? { y: 0, scale: 1 }
      : {
          y: -3,
          scale,
          boxShadow: "0 8px 18px -2px rgba(0, 0, 0, 0.35)",
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 22,
          },
        },
  };
}

export interface BannerImageMotionProps extends HTMLMotionProps<"div"> {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
}

export function BannerImageMotion({
  src,
  alt = "",
  children,
  className,
  ...props
}: BannerImageMotionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const imageVariants = getBannerImageVariants(shouldReduceMotion);

  if (shouldReduceMotion) {
    if (children) {
      return (
        <div
          className={cn("h-full w-full overflow-hidden", className)}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        className={cn("h-full w-full overflow-hidden", className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
    );
  }

  if (children) {
    return (
      <motion.div
        variants={imageVariants}
        whileHover="hover"
        className={cn("h-full w-full overflow-hidden", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={imageVariants}
      whileHover="hover"
      className={cn("h-full w-full overflow-hidden", className)}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : null}
    </motion.div>
  );
}

export interface BannerBadgeMotionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function BannerBadgeMotion({
  children,
  className,
  ...props
}: BannerBadgeMotionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const badgeVariants = getBannerBadgeVariants(shouldReduceMotion);

  if (shouldReduceMotion) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={badgeVariants}
      whileHover="hover"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface BannerCardMotionProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  className?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  badge?: React.ReactNode;
  badgePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  delay?: number;
  glowColor?: string;
  borderColor?: string;
}

export function BannerCardMotion({
  children,
  className,
  imageSrc,
  imageAlt = "Event banner",
  badge,
  badgePosition = "top-left",
  delay = 0,
  glowColor = TANALOKA_PALETTE.glowColor,
  borderColor = TANALOKA_PALETTE.borderColor,
  ...props
}: BannerCardMotionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [imgError, setImgError] = useState(false);
  const cardVariants = getBannerCardVariants(
    shouldReduceMotion,
    glowColor,
    borderColor
  );

  const badgePositionClass = {
    "top-left": "top-3 left-3 sm:top-4 sm:left-4",
    "top-right": "top-3 right-3 sm:top-4 sm:right-4",
    "bottom-left": "bottom-3 left-3 sm:bottom-4 sm:left-4",
    "bottom-right": "bottom-3 right-3 sm:bottom-4 sm:right-4",
  }[badgePosition];

  const hasImage = Boolean(imageSrc && !imgError);

  const cardClasses = cn(
    "group relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1B1D24] transition-colors",
    className
  );

  if (shouldReduceMotion) {
    return (
      <div
        className={cardClasses}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {imageSrc !== undefined ? (
          hasImage ? (
            <BannerImageMotion>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc!}
                alt={imageAlt}
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            </BannerImageMotion>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,72,56,0.12),_transparent_60%),linear-gradient(135deg,#1B1D24_0%,#111317_100%)] p-6 text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-[#FF4838]">
                {imageAlt}
              </p>
            </div>
          )
        ) : null}

        {badge ? (
          <BannerBadgeMotion className={cn("absolute z-20", badgePositionClass)}>
            {badge}
          </BannerBadgeMotion>
        ) : null}

        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay,
          ease: [0.21, 0.47, 0.32, 0.98],
        },
      }}
      viewport={{ once: true, margin: "-30px" }}
      className={cardClasses}
      {...props}
    >
      {imageSrc !== undefined ? (
        hasImage ? (
          <BannerImageMotion>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc!}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          </BannerImageMotion>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,72,56,0.12),_transparent_60%),linear-gradient(135deg,#1B1D24_0%,#111317_100%)] p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-[#FF4838]">
              {imageAlt}
            </p>
          </div>
        )
      ) : null}

      {badge ? (
        <BannerBadgeMotion className={cn("absolute z-20", badgePositionClass)}>
          {badge}
        </BannerBadgeMotion>
      ) : null}

      {children}
    </motion.div>
  );
}

BannerCardMotion.Image = BannerImageMotion;
BannerCardMotion.Badge = BannerBadgeMotion;
