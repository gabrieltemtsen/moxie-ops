import { fetchMetadata } from "frames.js/next";
import Link from "next/link";
import Image from "next/image";
 
export async function generateMetadata() {
  return {
    title: " Moxie Power action",
    // ...
    other: {
      // ...
      ...(await fetchMetadata(
        // provide a full URL to your /frames endpoint
        new URL(
          "/frames/moxie-power",
          process.env.NEXT_PUBLIC_BASE_URL
            ? `https://${process.env.NEXT_PUBLIC_BASE_URL}/frames/moxie-power`
            : "http://localhost:3000/frames/moxie-power"
        )
      )),
    },
  };
}
 
export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Moxie </h1>
        <p className="text-lg text-gray-600">
          Stay up-to-date with the latest buy and sell activity for your Fan Tokens. Subscribe to our tracker or request stats directly to stay informed.
        </p>
      </header>




   MOXIE POWER

      <footer className="text-center text-gray-600 mt-12">
        <p>Built by @gabrieltemtsen</p>
        <p>© {new Date().getFullYear()} Moxie Fan Token Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}