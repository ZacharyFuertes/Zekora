import type { LucideIcon } from "lucide-react"
import {
  Bot,
  HardDrive,
  KeyRound,
  LockKeyhole,
  NotebookPen,
  Tags,
} from "lucide-react"

export type NavLink = {
  label: string
  href: string
}

export type Stat = {
  value: number
  decimals?: number
  prefix?: string
  suffix: string
  label: string
  hint: string
}

export type Feature = {
  icon: LucideIcon
  title: string
  copy: string
  span: string
}

export type Testimonial = {
  quote: string
  name: string
  role: string
  company: string
  offset: string
}

export type PricingPlan = {
  name: string
  price: string
  cadence: string
  description: string
  features: string[]
  highlighted: boolean
  cta: string
  href: string
}

export type SectionCopy = {
  eyebrow: string
  title: string
  description: string
}

export type ContactPanelItem = {
  label: string
  value: string
}

export const navLinks: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
]

export const stats: Stat[] = [
  {
    value: 99.9,
    decimals: 1,
    suffix: "%",
    label: "Uptime",
    hint: "Storage pool availability across linked drives",
  },
  {
    value: 24,
    suffix: "/7",
    label: "Monitoring",
    hint: "Activity events recorded for every vault action",
  },
  {
    value: 1,
    prefix: "<",
    suffix: "s",
    label: "AI response",
    hint: "Vault-aware answers without leaving the dashboard",
  },
]

export const features: Feature[] = [
  {
    icon: HardDrive,
    title: "Multi-Drive Pooling",
    copy: "Link several Google Drive accounts and let Zekora route uploads to the account with the most free space.",
    span: "md:col-span-6 lg:col-span-7",
  },
  {
    icon: LockKeyhole,
    title: "Hidden Vault",
    copy: "A second compartment with its own password. Files stay encrypted until you unlock it again.",
    span: "md:col-span-6 lg:col-span-5",
  },
  {
    icon: KeyRound,
    title: "Encrypted Passwords",
    copy: "Store credentials with AES-256-CBC encryption and reveal them only when you ask.",
    span: "md:col-span-6 lg:col-span-5",
  },
  {
    icon: NotebookPen,
    title: "Notes & Collections",
    copy: "Write notes, group files into collections, and keep every project in one place.",
    span: "md:col-span-6 lg:col-span-7",
  },
  {
    icon: Tags,
    title: "Tags & Retrieval",
    copy: "Tag files across accounts. Search by name, tag, collection, or type in one pass.",
    span: "md:col-span-6 lg:col-span-4",
  },
  {
    icon: Bot,
    title: "Vault AI Assistant",
    copy: "Ask where a file lives, what changed this week, or which drive is nearly full. Answers use your real vault context.",
    span: "md:col-span-6 lg:col-span-8",
  },
]

export const testimonials: Testimonial[] = [
  {
    quote:
      "I had three Drive accounts from three different clients. Zekora put them behind one file explorer and stopped the weekly hunt for which account had space.",
    name: "Mara Villanueva",
    role: "Freelance photographer",
    company: "Kalaw Studio",
    offset: "lg:mt-0",
  },
  {
    quote:
      "The hidden vault is the part I actually use. Contract scans stay locked until I open it, and the access log tells me if anything moved.",
    name: "Diego Fontanilla",
    role: "Operations lead",
    company: "Northline Logistics",
    offset: "lg:mt-12",
  },
  {
    quote:
      "Tags and collections fixed a research archive that had been unsearchable for years. The assistant finds field notes faster than I can remember them.",
    name: "Elena Reyes",
    role: "Research coordinator",
    company: "Ateneo Marine Lab",
    offset: "lg:mt-4",
  },
]

export const pricingPlans: PricingPlan[] = [
  {
    name: "Beta",
    price: "R$0",
    cadence: "forever",
    description: "Early access while Zekora is under active development.",
    features: [
      "1 linked Google Drive",
      "Notes, tags, and collections",
      "Basic AI assistant",
      "7-day activity history",
    ],
    highlighted: false,
    cta: "Request access",
    href: "#contact",
  },
  {
    name: "Pro",
    price: "R$29",
    cadence: "per month",
    description: "The full vault for daily use across several drives.",
    features: [
      "5 linked Google Drive accounts",
      "Encrypted password manager",
      "Hidden vault with its own password",
      "Full activity log",
      "Vault-aware AI assistant",
    ],
    highlighted: true,
    cta: "Start with Pro",
    href: "#contact",
  },
  {
    name: "Archive",
    price: "R$59",
    cadence: "per month",
    description: "For teams that treat storage as a long-term record.",
    features: [
      "Unlimited linked drives",
      "Priority AI responses",
      "Export and import tools",
      "Extended access logs",
      "Priority support",
    ],
    highlighted: false,
    cta: "Contact sales",
    href: "#contact",
  },
]

export const heroCopy = {
  headline: "PROJECT ZEKORA",
  subtitle: "Link every Google Drive you own into one file explorer.",
  description:
    "Passwords, notes, hidden files, and an AI assistant stay behind the same login, and every action leaves an audit trail.",
  primaryCta: "Start now",
  secondaryCta: "View demo",
} as const

export const sectionCopy = {
  features: {
    eyebrow: "Recursos / Core modules",
    title: "One vault. Every drive. No blind spots.",
    description:
      "Zekora does not host your files. It reads the drives you already pay for, then gives you one place to search, secure, and audit them.",
  },
  testimonials: {
    eyebrow: "Depoimentos / Field reports",
    title: "People who stopped juggling accounts.",
    description:
      "Three operators, three different storage habits, one pattern: fewer tabs and fewer surprises.",
  },
  pricing: {
    eyebrow: "Preços / Access tiers",
    title: "Pay for the vault, not the storage.",
    description:
      "Zekora reads drives you already own, so the price covers the tools around them. Billing opens after the alpha.",
  },
  contact: {
    eyebrow: "Contato / Request access",
    title: "Open the vault. Keep the receipts.",
    description:
      "The alpha is invite-based while linked-drive limits and audit retention are still being tuned. Leave an email and you will get a key when the next batch opens.",
  },
} satisfies Record<string, SectionCopy>

export const contactCopy = {
  formCommand: "> access.request --beta",
  emailLabel: "Email address",
  emailPlaceholder: "operator@domain.com",
  emailHint:
    "The address must accept mail from a Supabase-backed waitlist.",
  submit: "Request access",
  submitting: "Transmitting",
  success: "> request queued. check your inbox for the next batch.",
  note: "No charge. No drive permissions requested.",
  guardrail:
    "Only your email is stored for this waitlist. No files, no drive access, no passwords.",
  panel: [
    { label: "Batch", value: "ALPHA-04" },
    { label: "Slots", value: "LIMITED / 50" },
  ] satisfies ContactPanelItem[],
}

export const footerCopy = {
  tagline:
    "One encrypted vault over every Google Drive you already own. Built for people who want their files findable, not scattered.",
  copyright: "© {year} Zekora. All systems watched.",
  status: "STATUS: ONLINE",
}

export const footerMetrics = [
  { label: "STATUS", value: "ONLINE" },
  { label: "NODE", value: "ZEKORA-01" },
  { label: "LATENCY", value: "32ms" },
  { label: "BUILD", value: "ALPHA" },
]
