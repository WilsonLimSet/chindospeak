import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy · ChindoSpeak",
  description: "How ChindoSpeak handles your data. Short version: we don't want any of it.",
};

export default function PrivacyPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
          Last updated: May 18, 2026
        </p>

        <div className="space-y-6 leading-relaxed">
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 mb-8">
            <h2 className="text-lg font-bold mb-2">The short version</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ChindoSpeak doesn't ask for your name, email, phone number, or any personal information. There are no user accounts. All your flashcards live locally on your device. We don't sell, share, or analyze your data. We use third-party services for subscription billing, voice generation, translation, and transcription — they each have their own privacy policies linked below.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-bold mb-3">1. What we collect</h2>
            <p className="mb-3">
              We do not collect, store, or process any personally identifiable information through ChindoSpeak. Specifically:
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>No name, email, phone number, or date of birth</li>
              <li>No user accounts or login</li>
              <li>No analytics or behavioural tracking SDKs</li>
              <li>No advertising identifiers</li>
              <li>No location data</li>
              <li>No contacts, photos, or messages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. What stays on your device</h2>
            <p>
              Flashcards you create, decks you organize, review history, streak data, and your selected language live only on your device (via SwiftData on iOS / local storage on the web). If you delete the app, this data is deleted with it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Third-party services we rely on</h2>

            <div className="space-y-4 mt-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold mb-1">RevenueCat (subscription management)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Handles your subscription state. Receives a randomly-generated anonymous user identifier from Apple — not your name, email, or Apple ID. See{" "}
                  <a href="https://www.revenuecat.com/privacy" className="underline">RevenueCat's privacy policy</a>.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold mb-1">Apple (App Store + subscriptions)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Processes all payments. We never see your payment method, full name, or billing address. Apple's data practices apply. See{" "}
                  <a href="https://www.apple.com/legal/privacy/" className="underline">Apple's privacy policy</a>.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold mb-1">OpenAI (Whisper + GPT-4o-mini)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When you import a video, we transcribe its audio via OpenAI Whisper and process the transcript with GPT-4o-mini. The transcript is not stored on our servers after processing. See{" "}
                  <a href="https://openai.com/policies/privacy-policy" className="underline">OpenAI's privacy policy</a>.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold mb-1">Microsoft Edge TTS</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generates native-quality voice audio. Text you ask to be spoken is sent to Microsoft; no user identifier is attached. See{" "}
                  <a href="https://privacy.microsoft.com/en-us/privacystatement" className="underline">Microsoft's privacy statement</a>.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold mb-1">Baidu Translate &amp; Google Cloud Translation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Translation requests are sent to these APIs. Only the text to translate is sent; no user identifier. See{" "}
                  <a href="https://policies.google.com/privacy" className="underline">Google's policy</a> and{" "}
                  <a href="https://www.baidu.com/duty/" className="underline">Baidu's policy</a>.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold mb-1">Vercel (hosting)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our backend (api.chindospeak.com) runs on Vercel. Standard server logs (IP, timestamp, request path) may be retained briefly for security and debugging. See{" "}
                  <a href="https://vercel.com/legal/privacy-policy" className="underline">Vercel's privacy policy</a>.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Permissions the iOS app asks for</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>
                <strong>Microphone</strong> — used only when you start Drive Mode, to listen for your spoken answers. Audio is processed by Apple's on-device speech recognition; it never leaves your phone.
              </li>
              <li>
                <strong>Speech Recognition</strong> — required to grade your spoken answers in Drive Mode. On-device only.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Children's privacy</h2>
            <p>
              ChindoSpeak is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has provided us with data, contact us and we'll address it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Your rights</h2>
            <p>
              Because we don't collect personal information, there's no profile to access, export, or delete on our side. You can delete all your local data by deleting the app from your device. You can cancel your subscription anytime through your Apple ID settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Changes to this policy</h2>
            <p>
              We'll update this page if our practices change. Material changes will be reflected in the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Contact</h2>
            <p>
              Privacy questions? Email{" "}
              <a href="mailto:wilsonlimsetiawan@gmail.com" className="underline">
                wilsonlimsetiawan@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
