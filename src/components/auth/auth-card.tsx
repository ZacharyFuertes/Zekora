"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { VaultIcon } from "@/components/ui/vault-icon"

interface AuthCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footerText: string
  footerLink: string
  footerLinkText: string
}

export function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText,
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-sm px-4"
    >
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <VaultIcon className="w-16 h-16 sm:w-20 sm:h-20 mb-4" />
          <h1 className="text-lg sm:text-xl font-medium text-text">{title}</h1>
          <p className="text-sm text-text-muted mt-1.5">{subtitle}</p>
        </div>
        {children}
        <p className="text-center text-sm text-text-muted mt-6">
          {footerText}{" "}
          <Link
            href={footerLink}
            className="text-primary hover:text-primary-hover transition-colors"
          >
            {footerLinkText}
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
