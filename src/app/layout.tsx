import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title:{default:"S.P. AGRO | Agricultural Machinery & Laser Cutting",template:"%s | S.P. AGRO"},description:"Agricultural machinery, precision laser cutting and custom manufacturing in Babhaleshwar Kh., Maharashtra.",metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><SiteHeader/>{children}<SiteFooter/></body></html>}
