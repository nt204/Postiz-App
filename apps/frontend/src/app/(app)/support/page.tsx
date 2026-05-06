export const dynamic = 'force-dynamic';

export default function SupportPage() {
  const appName = process.env.PUBLIC_APP_NAME || 'Postiz';
  const companyName = process.env.PUBLIC_COMPANY_NAME || 'Postiz';
  const supportEmail = process.env.PUBLIC_SUPPORT_EMAIL || '';
  const supportUrl = process.env.PUBLIC_SUPPORT_URL || '';
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_SUPPORT || '';
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

        <h1 className="text-4xl font-semibold mb-3">Support</h1>
        <p className="text-[#8c8c8c] text-sm mb-12">
          We&apos;re here to help. Choose the option that works best for you.
        </p>

        <div className="flex flex-col gap-6">
          {supportEmail && (
            <div className="bg-[#1a1919] border border-[#252525] rounded-[12px] p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#612bd3]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#612bd3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-white text-lg font-semibold mb-1">Email Support</h2>
                  <p className="text-[#8c8c8c] text-sm mb-4">
                    Send us an email and we&apos;ll get back to you as soon as possible.
                  </p>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="inline-flex items-center gap-2 bg-[#612bd3] hover:bg-[#7236f1] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {supportEmail}
                  </a>
                </div>
              </div>
            </div>
          )}

          {discordUrl && (
            <div className="bg-[#1a1919] border border-[#252525] rounded-[12px] p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#5865F2]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.055a19.863 19.863 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-white text-lg font-semibold mb-1">Discord Community</h2>
                  <p className="text-[#8c8c8c] text-sm mb-4">
                    Join our Discord community for real-time help, tips, and discussions with other users.
                  </p>
                  <a
                    href={discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Join Discord
                  </a>
                </div>
              </div>
            </div>
          )}

          {supportUrl && (
            <div className="bg-[#1a1919] border border-[#252525] rounded-[12px] p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#612bd3]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#612bd3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-white text-lg font-semibold mb-1">Help Center</h2>
                  <p className="text-[#8c8c8c] text-sm mb-4">
                    Browse our documentation, guides, and frequently asked questions.
                  </p>
                  <a
                    href={supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#313030] hover:bg-[#3d3c3c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Visit Help Center
                  </a>
                </div>
              </div>
            </div>
          )}

          {!supportEmail && !discordUrl && !supportUrl && (
            <div className="bg-[#1a1919] border border-[#252525] rounded-[12px] p-8 text-center">
              <p className="text-[#8c8c8c]">
                Please contact {companyName || appName} for support. Check the app for contact options.
              </p>
            </div>
          )}
        </div>

        <div className="mt-16 bg-[#1a1919] border border-[#252525] rounded-[12px] p-6">
          <h2 className="text-white text-lg font-semibold mb-3">Common Questions</h2>
          <div className="flex flex-col gap-4 text-[15px]">
            <div>
              <p className="text-white font-medium mb-1">How do I connect my TikTok account?</p>
              <p className="text-[#8c8c8c]">
                Go to Integrations in the sidebar, click &quot;Add channel&quot;, and select TikTok.
                You&apos;ll be redirected to TikTok to authorize the connection.
              </p>
            </div>
            <div className="border-t border-[#252525] pt-4">
              <p className="text-white font-medium mb-1">What is the difference between Direct Post and Upload?</p>
              <p className="text-[#8c8c8c]">
                <strong className="text-[#d3d3d3]">Direct Post</strong> publishes your content directly to TikTok at the scheduled time.
                <strong className="text-[#d3d3d3]"> Upload</strong> sends the content to your TikTok inbox/drafts so you can review before posting.
              </p>
            </div>
            <div className="border-t border-[#252525] pt-4">
              <p className="text-white font-medium mb-1">How do I schedule a post?</p>
              <p className="text-[#8c8c8c]">
                Create a post, select your connected channels, choose a date and time, and click Schedule.
                The post will be automatically published at the configured time.
              </p>
            </div>
            <div className="border-t border-[#252525] pt-4">
              <p className="text-white font-medium mb-1">How do I disconnect a social media account?</p>
              <p className="text-[#8c8c8c]">
                Go to Integrations, find the connected account, and click the disconnect button. This will
                revoke {appName}&apos;s access to that account.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#252525] flex gap-6 text-sm text-[#8c8c8c]">
          <a href="/terms" className="hover:text-white">Terms of Service</a>
          <a href="/privacy" className="hover:text-white">Privacy Policy</a>
          {mainUrl && (
            <a href={mainUrl} className="hover:text-white">{appName}</a>
          )}
        </div>
      </div>
    </div>
  );
}
