import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "MamaLens — Stories, people & moments", description: "Photography, creative work and profiles celebrating the people shaping culture." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
