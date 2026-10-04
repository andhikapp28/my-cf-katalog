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
// 1. FadeInView
// Pembungkus animasi masuk bertahap (fade + slight translate Y) saat elemen
// masuk ke viewport. Menghormati prefers-reduced-motion tanpa rAF / scroll listener.
// =============================================================================

export interface FadeInViewProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
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

  const getOffsets = () => {
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
  };

  const offset = getOffsets();

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
// Animasi staggered masuk untuk judul headline, subjudul, dan tombol aksi hero.
// =============================================================================

export interface HeroEntranceMotionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export interface HeroEntranceItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
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

  const itemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function HeroEntranceMotion({
  children,
  className,
  delay = 0.05,
  staggerDelay = 0.12,
  ...props
}: HeroEntranceMotionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  const containerVariants: Variants = {
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
// Efek hover halus pada kartu metrik (scale 1.02, subtle border illumination)
// dengan transisi spring natural.
// =============================================================================

export interface MetricCardMotionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glowColor?: string;
  borderColor?: string;
}

export function MetricCardMotion({
  children,
  className,
  delay = 0,
  glowColor = "rgba(255, 107, 74, 0.25)",
  borderColor = "rgba(255, 107, 74, 0.45)",
  ...props
}: MetricCardMotionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  if (shouldReduceMotion) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
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
      whileHover={{
        scale: 1.02,
        y: -3,
        borderColor,
        boxShadow: `0 12px 28px -8px ${glowColor}`,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25,
        },
      }}
      whileTap={{
        scale: 0.99,
        transition: { type: "spring", stiffness: 500, damping: 30 },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// 4. BannerCardMotion, BannerImageMotion & BannerBadgeMotion
// Efek hover halus pada kartu banner 16:9 (subtle image zoom, badge lift).
// =============================================================================

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

  const imageVariants: Variants = {
    initial: { scale: 1 },
    hover: shouldReduceMotion
      ? { scale: 1 }
      : {
          scale: 1.05,
          transition: {
            duration: 0.45,
            ease: [0.25, 1, 0.5, 1],
          },
        },
  };

  if (children) {
    return (
      <motion.div
        variants={imageVariants}
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

  const badgeVariants: Variants = {
    initial: { y: 0, scale: 1 },
    hover: shouldReduceMotion
      ? { y: 0, scale: 1 }
      : {
          y: -3,
          scale: 1.03,
          boxShadow: "0 8px 16px -2px rgba(0, 0, 0, 0.3)",
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 22,
          },
        },
  };

  return (
    <motion.div variants={badgeVariants} className={className} {...props}>
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
}

export function BannerCardMotion({
  children,
  className,
  imageSrc,
  imageAlt = "Event banner",
  badge,
  badgePosition = "top-left",
  delay = 0,
  ...props
}: BannerCardMotionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [imgError, setImgError] = useState(false);

  const badgePositionClass = {
    "top-left": "top-3 left-3 sm:top-4 sm:left-4",
    "top-right": "top-3 right-3 sm:top-4 sm:right-4",
    "bottom-left": "bottom-3 left-3 sm:bottom-4 sm:left-4",
    "bottom-right": "bottom-3 right-3 sm:bottom-4 sm:right-4",
  }[badgePosition];

  const hasImage = Boolean(imageSrc && !imgError);

  return (
    <motion.div
      initial={shouldReduceMotion ? false : "initial"}
      whileHover={shouldReduceMotion ? undefined : "hover"}
      whileInView={
        shouldReduceMotion
          ? undefined
          : {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98],
              },
            }
      }
      viewport={{ once: true, margin: "-30px" }}
      className={cn(
        "group relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#141418] transition-colors",
        className
      )}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,107,74,0.12),_transparent_60%),linear-gradient(135deg,#16161b_0%,#0e0e12_100%)] p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-[#FF6B4A]">
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
