import { Tiny5 } from "next/font/google"

const tiny5 = Tiny5({
  variable: "--font-tiny5",
  subsets: ["latin"],
  weight: "400",
})

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={tiny5.variable}>{children}</div>
}
