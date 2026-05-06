export const dynamic = 'force-dynamic';

export default function TermsPage() {
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

        <h1 className="text-4xl font-semibold mb-3">Terms of Service</h1>
        <p className="text-[#8c8c8c] text-sm mb-12">Last updated: {updatedAt}</p>

        <div className="flex flex-col gap-10 text-[#d3d3d3] leading-7 text-[15px]">
          <section>
            <h2 className="text-white text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using {appName} (&quot;Service&quot;), operated by {companyName || appName}
              {companyAddress ? ` located at ${companyAddress}` : ''}, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">2. Description of Service</h2>
            <p>
              {appName} is a social media management platform that allows users to connect their social
              media accounts, create, schedule, and publish content across multiple platforms including
              TikTok, Instagram, Facebook, YouTube, X (Twitter), and others.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">3. User Accounts</h2>
            <p className="mb-3">
              You must create an account to use most features of the Service. You are responsible for:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Providing accurate and complete registration information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">4. Connected Social Media Accounts</h2>
            <p className="mb-3">
              When you connect your social media accounts (including TikTok, Instagram, Facebook, YouTube,
              and others), you authorize {appName} to:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Access your profile information to display your account within {appName}</li>
              <li>Publish, schedule, and upload content on your behalf when you initiate such actions</li>
              <li>Retrieve analytics and engagement data associated with your content</li>
            </ul>
            <p className="mt-3">
              You retain full ownership of your content. {appName} acts only as an intermediary to
              facilitate publishing per your instructions.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">5. Acceptable Use</h2>
            <p className="mb-3">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Post content that infringes on intellectual property rights</li>
              <li>Distribute spam, malware, or harmful content</li>
              <li>Harass, threaten, or harm others</li>
              <li>Attempt to gain unauthorized access to the Service or other accounts</li>
              <li>Violate the terms of service of any connected social media platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">6. Content Ownership and License</h2>
            <p className="mb-3">
              You retain ownership of all content you create and publish through {appName}. By using the
              Service, you grant {appName} a limited, non-exclusive license to process and transmit your
              content solely for the purpose of providing the Service.
            </p>
            <p>
              You are solely responsible for ensuring that your content complies with applicable platform
              policies and laws.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">7. Privacy</h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <a href="/privacy" className="text-[#612bd3] hover:underline">
                Privacy Policy
              </a>
              , which is incorporated by reference into these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at our discretion if you violate
              these Terms or for any other reason with reasonable notice. You may delete your account at
              any time from within the Service settings.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
              uninterrupted, error-free operation, or that the Service will meet your specific requirements.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, {companyName || appName} shall not be liable for
              any indirect, incidental, special, or consequential damages arising from your use of or
              inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of significant changes by
              updating the &quot;Last updated&quot; date above. Continued use of the Service after changes
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">12. Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us
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
        </div>

        <div className="mt-16 pt-8 border-t border-[#252525] flex gap-6 text-sm text-[#8c8c8c]">
          <a href="/privacy" className="hover:text-white">Privacy Policy</a>
          <a href="/support" className="hover:text-white">Support</a>
          {mainUrl && (
            <a href={mainUrl} className="hover:text-white">{appName}</a>
          )}
        </div>
      </div>
    </div>
  );
}
