import "./globals.css";
import ClientLayout from "@/client-layout";

export const metadata = {
  title: "studio morpheus.",
  description:
    "Just like the Greek god of dreams, we turn creative visions into reality. Branding, social media, media production, design and more — studio morpheus.",
  openGraph: {
    title: "studio morpheus.",
    description:
      "Transforming ideas into impactful experiences — the creative agency named after the Greek god of dreams.",
    siteName: "studio morpheus.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#002459",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
