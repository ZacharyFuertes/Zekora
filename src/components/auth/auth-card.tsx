"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { VaultIcon } from "@/components/ui/vault-icon"

interface AuthCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  headerImage?: string
  headerImageAlt?: string
  footerText?: string
  footerLink?: string
  footerLinkText?: string
}

export function AuthCard({
  title,
  subtitle,
  children,
  headerImage,
  headerImageAlt = "",
  footerText,
  footerLink,
  footerLinkText,
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md px-4"
    >
      <div className="rounded-none border-2 border-neon bg-surface p-6 sm:p-8 pixel-shadow-neon">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          {headerImage ? (
            <img
              src={headerImage}
              alt={headerImageAlt}
              className="mb-4 h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
          ) : (
            <VaultIcon className="mb-4 h-16 w-16 sm:h-20 sm:w-20" />
          )}
          <h1 className="font-pixel text-base sm:text-lg font-bold text-text uppercase tracking-wider">
            {title}
          </h1>
          <p className="font-pixel text-[10px] text-text-muted mt-2 uppercase tracking-wide">
            {subtitle}
          </p>
        </div>
        {children}
        {footerText && footerLink && footerLinkText && (
          <p className="text-center font-pixel text-[10px] text-text-muted mt-6 uppercase tracking-wide">
            {footerText}{" "}
            <Link
              href={footerLink}
              className="text-neon hover:underline font-bold"
            >
              {footerLinkText}
            </Link>
          </p>
        )}
      </div>
    </motion.div>
  )
}
