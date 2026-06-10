import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Support · ChindoSpeak",
  description: "Get help with ChindoSpeak — contact us and browse common questions.",
};

export default function SupportPage() {
  return (
    <div className="min-h-[100dvh] bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to ChindoSpeak
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">ChindoSpeak Support</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
          Need help with ChindoSpeak? We're happy to help.
        </p>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3">Contact us</h2>
            <p>
              Email us at{" "}
              <a href="mailto:wilsonlimset@gmail.com" className="underline">
                wilsonlimset@gmail.com
              </a>
              . We aim to reply within 2 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Frequently asked questions</h2>

            <div className="space-y-4 mt-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold mb-1">How do I import a video?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share a short video into ChindoSpeak from the iOS share sheet; it becomes flashcards.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold mb-1">How do I cancel my subscription?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage it in iOS Settings → your Apple ID → Subscriptions.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold mb-1">How do I delete my data?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Delete flashcards in the Library tab; uninstalling removes all local data.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold mb-1">Privacy &amp; Terms</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Read our{" "}
                  <Link href="/privacy" className="underline">Privacy Policy</Link>{" "}
                  and{" "}
                  <Link href="/terms" className="underline">Terms of Service</Link>.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
