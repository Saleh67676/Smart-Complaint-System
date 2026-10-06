import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"المساعد الذكي للدعم الفني",description:"مشروع طلابي للمحادثة والدعم الفني الجامعي باستخدام Groq.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ar" dir="rtl"><body>{children}</body></html>;}
