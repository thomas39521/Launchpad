import type { Metadata } from "next";
import "./globals.css";
import Web3Provider from "../context/Web3Provider";

export const metadata: Metadata = {
  title: "Pegasus Launchpad",
  description: "Decentralized Token Launchpad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
