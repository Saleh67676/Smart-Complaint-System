import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"المساعد الذكي للدعم الفني",description:"مشروع طلابي للمحادثة والدعم الفني الجامعي باستخدام Groq.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ar" dir="rtl"><body>{children}<script src="https://serviq-business.unihelp.workers.dev/widget.js" data-key="pk_srv_71e2eb65e5141f3d3817bdeb0d82f7aeebc2654cc5ee03700ad81eb05b068601" defer></script></body></html>;}
