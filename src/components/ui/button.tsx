import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react"
import { cn } from "@/lib/utils"

export type ButtonVariant = "primary" | "ghost"

const variantClass: Record<ButtonVariant, string> = {
  primary: "dz-btn-primary",
  ghost: "dz-btn-ghost",
}

type SharedProps = {
  variant?: ButtonVariant
  children: ReactNode
  className?: string
}

type ButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">

type ButtonLinkProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className">

export function Button({
  variant = "primary",
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("dz-btn", variantClass[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={cn("dz-btn", variantClass[variant], className)} {...props}>
      {children}
    </a>
  )
}
