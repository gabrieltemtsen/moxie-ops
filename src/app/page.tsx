import { fetchMetadata } from "frames.js/next";
import Link from "next/link";
import Image from "next/image";
 
export async function generateMetadata() {
  return {
    title: "FanToken Tracker",
    // ...
    other: {
      // ...
      ...(await fetchMetadata(
        // provide a full URL to your /frames endpoint
        new URL(
          "/frames",
          process.env.NEXT_PUBLIC_BASE_URL
            ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
            : "http://localhost:3000"
        )
      )),
    },
  };
}
 
export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Moxie Fan Token Tracker</h1>
        <p className="text-lg text-gray-600">
          Stay up-to-date with the latest buy and sell activity for your Fan Tokens. Subscribe to our tracker or request stats directly to stay informed.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Subscription Service</h2>
        <p className="text-gray-700 mb-4">
          Subscribe to receive daily updates on the buy and sell activities of your Fan Tokens. Our subscription service allows you to get notified directly through your Farcaster account, ensuring you never miss an important transaction.
        </p>
        <Image
          src="/subFantoken.jpg"
          alt="Subscribe to Fan Token Tracker"
          width={600}
          height={300}
          className="rounded-lg shadow-lg mx-auto"
        />
        <div className="text-center mt-6">
          <Link href="/frames" passHref>
            <span className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600">
              Subscribe Now
            </span>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Request Fan Token Stats</h2>
        <p className="text-gray-700 mb-4">
          Need to know who bought or sold your Fan Token? You can request stats for any User or Channel Fan Token. We-  ll fetch the latest data and send it directly to you via Direct Cast.
        </p>
        <Image
          src="/reqFantoken.jpg"
          alt="Request Fan Token Stats"
          width={600}
          height={300}
          className="rounded-lg shadow-lg mx-auto"
        />
        <div className="text-center mt-6">
          <Link href="/frames" passHref>
            <span className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600">
              Request Stats Now
            </span>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Unsubscribe</h2>
        <p className="text-gray-700 mb-4">
          No longer interested in receiving updates? You can easily unsubscribe from the tracker and stop receiving notifications.
        </p>
        <div className="text-center mt-6">
          <Link href="/frames" passHref>
            <span className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-600">
              Unsubscribe
            </span>
          </Link>
        </div>
      </section>

      <footer className="text-center text-gray-600 mt-12">
        <p>Built by @gabrieltemtsen</p>
        <p>© {new Date().getFullYear()} Moxie Fan Token Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}