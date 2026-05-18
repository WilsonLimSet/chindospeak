import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service · ChindoSpeak",
  description: "Terms of Service for the ChindoSpeak iOS app and web service.",
};

export default function TermsPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
          Last updated: May 18, 2026
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of these terms</h2>
            <p>
              By downloading, installing, or using ChindoSpeak (the "Service") — whether the iOS app or this website — you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. The Service</h2>
            <p>
              ChindoSpeak is a language-learning application focused on Mandarin Chinese and Bahasa Indonesia. The Service includes flashcard review, video-to-flashcard import, audio playback, and hands-free voice practice. Some features require an active subscription to "ChindoSpeak Pro." Some features require an internet connection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Subscription &amp; payment</h2>
            <p>
              ChindoSpeak Pro is offered as an auto-renewing subscription via the Apple App Store. Subscription prices are displayed in the App Store and may vary by region. A free introductory period (currently 3 days) is offered to first-time subscribers.
            </p>
            <p>
              Payment is charged to your Apple ID account at the confirmation of purchase. The subscription automatically renews unless cancelled at least 24 hours before the end of the current billing period. You can manage and cancel your subscription in your Apple ID account settings.
            </p>
            <p>
              We do not process payments directly. All billing, refunds, and subscription management are handled by Apple under their <a href="https://www.apple.com/legal/internet-services/itunes/" className="underline">Media Services Terms</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Your content</h2>
            <p>
              When you create or import flashcards, paste video URLs, or otherwise input text into ChindoSpeak, that content remains yours. We store this data locally on your device. Imported video content is processed on our servers temporarily for transcription and translation, then discarded.
            </p>
            <p>
              You are responsible for ensuring that any content you import (such as Instagram or TikTok videos) does not violate the rights of third parties. ChindoSpeak does not store, redistribute, or share video content with anyone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Acceptable use</h2>
            <p>
              You agree not to: (a) reverse engineer or attempt to extract the source code of the Service; (b) use the Service to violate any law or another person's rights; (c) submit content that is illegal, harmful, or infringing; (d) abuse our APIs through automated scraping or excessive volume; (e) circumvent the subscription paywall by any means.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Intellectual property</h2>
            <p>
              ChindoSpeak, its logo, design, code, and content (excluding user-generated content) are owned by us. You may not copy, modify, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Disclaimers</h2>
            <p>
              The Service is provided "as is" and "as available." We make no warranties regarding the accuracy of translations, transcriptions, or pronunciation. ChindoSpeak is a study aid — not a replacement for professional language instruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, ChindoSpeak and its operators are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability is limited to the amount you paid us in the 12 months prior to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service if you violate these terms. You may stop using the Service at any time by deleting the app and cancelling your subscription through your Apple ID.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Changes to these terms</h2>
            <p>
              We may update these terms occasionally. Material changes will be reflected by updating the "Last updated" date at the top of this page. Continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Contact</h2>
            <p>
              Questions about these terms? Email{" "}
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
