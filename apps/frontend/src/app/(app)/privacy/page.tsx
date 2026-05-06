export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  const appName = process.env.PUBLIC_APP_NAME || 'Postiz';
  const companyName = process.env.PUBLIC_COMPANY_NAME || 'Postiz';
  const companyAddress = process.env.PUBLIC_COMPANY_ADDRESS || '';
  const supportEmail = process.env.PUBLIC_SUPPORT_EMAIL || '';
  const updatedAt = process.env.PUBLIC_LEGAL_UPDATED_AT || new Date().toISOString().slice(0, 10);
  const mainUrl = process.env.MAIN_URL || '';

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        <div className="mb-10">
          <a
            href={mainUrl || '/'}
            className="text-[#612bd3] hover:underline text-sm"
          >
            ← Back to {appName}
          </a>
        </div>

        <h1 className="text-4xl font-semibold mb-3">Privacy Policy</h1>
        <p className="text-[#8c8c8c] text-sm mb-12">Last updated: {updatedAt}</p>

        <div className="flex flex-col gap-10 text-[#d3d3d3] leading-7 text-[15px]">
          <section>
            <h2 className="text-white text-xl font-semibold mb-3">1. Introduction</h2>
            <p>
              {companyName || appName}
              {companyAddress ? ` (${companyAddress})` : ''} operates {appName} (&quot;Service&quot;).
              This Privacy Policy explains how we collect, use, and protect your information when you use
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-6 flex flex-col gap-3">
              <li>
                <strong className="text-white">Account Information:</strong> Email address, name, and
                password when you register.
              </li>
              <li>
                <strong className="text-white">Social Media Account Data:</strong> When you connect a
                social media account (TikTok, Instagram, Facebook, YouTube, X, etc.), we receive OAuth
                tokens and basic profile information (username, profile picture, account ID) necessary to
                operate the Service.
              </li>
              <li>
                <strong className="text-white">Content You Create:</strong> Posts, media files, captions,
                and scheduling data you create within {appName}.
              </li>
              <li>
                <strong className="text-white">Usage Data:</strong> Logs, IP addresses, browser type,
                pages visited, and interactions with the Service, used for security and performance.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Provide and operate the Service</li>
              <li>Publish and schedule content to connected social media platforms on your behalf</li>
              <li>Display your connected account information within the app</li>
              <li>Send important service notifications and account-related emails</li>
              <li>Improve and maintain the security and performance of the Service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">4. TikTok Data Usage</h2>
            <p className="mb-3">
              When you connect your TikTok account, {appName} accesses the following data through
              TikTok&apos;s official Content Posting API:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong className="text-white">user.info.basic / user.info.profile:</strong> Used to
                identify your TikTok account and display your profile information inside {appName}.
              </li>
              <li>
                <strong className="text-white">video.publish:</strong> Used to directly publish scheduled
                video posts to your TikTok profile at the time you configure.
              </li>
              <li>
                <strong className="text-white">video.upload:</strong> Used to upload videos to your
                TikTok inbox/drafts when you choose the upload flow instead of direct publishing.
              </li>
            </ul>
            <p className="mt-3">
              We do not store your TikTok content beyond what is necessary to schedule and publish it.
              OAuth tokens are stored securely and used only to act on your explicit instructions.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">5. Data Sharing</h2>
            <p className="mb-3">
              We do not sell your personal data. We may share your data only in the following cases:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong className="text-white">With social media platforms</strong> (TikTok, Instagram,
                etc.) when you instruct us to publish content on your behalf.
              </li>
              <li>
                <strong className="text-white">With service providers</strong> who assist in operating the
                Service (hosting, email, analytics) under strict confidentiality agreements.
              </li>
              <li>
                <strong className="text-white">As required by law</strong> in response to valid legal
                requests.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide the
              Service. You may delete your account at any time, which will remove your personal data from
              our systems. Connected social media tokens are revoked upon disconnecting or deleting your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">7. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption in transit (HTTPS),
              secure credential storage, and access controls to protect your data. However, no system is
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">8. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for data processing where consent is the basis</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us
              {supportEmail ? (
                <>
                  {' '}at{' '}
                  <a href={`mailto:${supportEmail}`} className="text-[#612bd3] hover:underline">
                    {supportEmail}
                  </a>
                </>
              ) : (
                ' through our support page'
              )}
              .
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">9. Cookies</h2>
            <p>
              We use essential cookies and local storage to maintain your session and preferences. We do
              not use third-party advertising cookies. You can control cookie settings in your browser,
              though disabling cookies may affect Service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes by
              updating the &quot;Last updated&quot; date at the top. Continued use of the Service after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, please contact us
              {supportEmail ? (
                <>
                  {' '}at{' '}
                  <a href={`mailto:${supportEmail}`} className="text-[#612bd3] hover:underline">
                    {supportEmail}
                  </a>
                </>
              ) : (
                ' through our support page'
              )}
              {companyAddress && (
                <>
                  {' '}or by mail at {companyAddress}
                </>
              )}
              .
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#252525] flex gap-6 text-sm text-[#8c8c8c]">
          <a href="/terms" className="hover:text-white">Terms of Service</a>
          <a href="/support" className="hover:text-white">Support</a>
          {mainUrl && (
            <a href={mainUrl} className="hover:text-white">{appName}</a>
          )}
        </div>
      </div>
    </div>
  );
}
