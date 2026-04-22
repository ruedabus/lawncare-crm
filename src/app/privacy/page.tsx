export default function PrivacyPage() {
  const effective = "April 19, 2026";
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Effective Date: {effective}</p>

      <p className="mb-6">
        YardPilot (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy and
        the privacy of your customers&apos; data. This Privacy Policy explains what information
        we collect, how we use it, who we share it with, and what rights you have
        regarding your data. By using the YardPilot platform (&ldquo;Service&rdquo;) you agree to
        the practices described in this policy.
      </p>

      {/* 1 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">1. Information We Collect</h2>

      <h3 className="text-base font-semibold mt-6 mb-2">a. Account &amp; Business Information</h3>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Name and email address of account holders and team members.</li>
        <li>Business name, phone number, and service address.</li>
        <li>Profile photo or logo you upload.</li>
        <li>Subscription plan and billing history (managed by Stripe; we do not store full card numbers).</li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">b. Customer &amp; Business Data You Enter</h3>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Your customers&apos; names, addresses, phone numbers, and email addresses.</li>
        <li>Job records, scheduling information, estimates, invoices, and payment records.</li>
        <li>Lead information captured via your QR code capture page.</li>
        <li>Technician profiles including names, email addresses, and phone numbers.</li>
        <li>Notes, tasks, and other content you create within the Service.</li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">c. Usage &amp; Technical Data</h3>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Log data including IP address, browser type, pages visited, and timestamps.</li>
        <li>Device information (type, operating system, screen size).</li>
        <li>Feature usage patterns used to improve the Service.</li>
        <li>Error and crash reports.</li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">d. Cookies &amp; Similar Technologies</h3>
      <p className="mb-4">
        We use session cookies and authentication tokens to keep you logged in and to
        secure your session. We do not use third-party advertising cookies. You can
        configure your browser to refuse cookies, but doing so may prevent you from
        using certain features of the Service.
      </p>

      {/* 2 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">2. How We Use Your Information</h2>
      <p className="mb-2">We use the information we collect to:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Provide, operate, and maintain the Service.</li>
        <li>Process payments and manage your subscription.</li>
        <li>Send transactional emails (invoices, estimates, team invitations, technician reminders).</li>
        <li>Respond to support requests and communicate with you about your account.</li>
        <li>Detect and prevent fraud, abuse, or security incidents.</li>
        <li>Analyze usage trends to improve and develop new features.</li>
        <li>Comply with legal obligations.</li>
      </ul>
      <p className="mb-4">
        We will not use your data or your customers&apos; data for advertising or sell it to
        any third party for marketing purposes.
      </p>

      {/* 3 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">3. Data We Do Not Collect</h2>
      <p className="mb-4">
        We do not collect or store full credit card numbers, bank account numbers, or
        government identification numbers. Payment card details are handled entirely by
        Stripe and are subject to Stripe&apos;s{" "}
        <a
          href="https://stripe.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 underline"
        >
          Privacy Policy
        </a>
        .
      </p>

      {/* 4 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">4. How We Share Your Information</h2>
      <p className="mb-4">
        We do not sell, rent, or trade your personal information. We share data only in
        the following limited circumstances:
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">a. Service Providers (Sub-processors)</h3>
      <p className="mb-4">
        We work with the following trusted third-party service providers who process
        data on our behalf, each bound by appropriate data protection agreements:
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-200 px-4 py-2 text-left font-semibold">Provider</th>
              <th className="border border-slate-200 px-4 py-2 text-left font-semibold">Purpose</th>
              <th className="border border-slate-200 px-4 py-2 text-left font-semibold">Data Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-200 px-4 py-2">Supabase</td>
              <td className="border border-slate-200 px-4 py-2">Database hosting &amp; authentication</td>
              <td className="border border-slate-200 px-4 py-2">United States</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="border border-slate-200 px-4 py-2">Stripe, Inc.</td>
              <td className="border border-slate-200 px-4 py-2">Payment processing</td>
              <td className="border border-slate-200 px-4 py-2">United States</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2">Resend</td>
              <td className="border border-slate-200 px-4 py-2">Transactional email delivery</td>
              <td className="border border-slate-200 px-4 py-2">United States</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="border border-slate-200 px-4 py-2">Vercel</td>
              <td className="border border-slate-200 px-4 py-2">Application hosting &amp; delivery</td>
              <td className="border border-slate-200 px-4 py-2">United States</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold mt-6 mb-2">b. Legal Requirements</h3>
      <p className="mb-4">
        We may disclose your information if required to do so by law, subpoena, court
        order, or other governmental authority, or if we believe in good faith that such
        disclosure is necessary to protect our rights, protect your safety or the safety
        of others, investigate fraud, or respond to a government request.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">c. Business Transfer</h3>
      <p className="mb-4">
        In the event that YardPilot is acquired, merged, or its assets are transferred,
        your data may be transferred as part of that transaction. We will notify you
        before your data is subject to a materially different privacy policy.
      </p>

      {/* 5 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">5. Your Customers&apos; Data</h2>
      <p className="mb-4">
        As a YardPilot subscriber, you are the data controller for any personal
        information you enter about your own customers (names, addresses, contact
        details, etc.). We act as a data processor on your behalf. You are responsible
        for ensuring you have appropriate lawful basis to store and process your
        customers&apos; personal information and for informing your customers about how their
        data is used.
      </p>

      {/* 6 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">6. Data Retention</h2>
      <p className="mb-4">
        We retain your account and business data for as long as your account is active.
        If you cancel your account, we will retain your data for 30 days to allow you to
        export it. After that period, we will permanently delete or anonymize your data
        from our active systems. Backups may persist for up to 90 days following deletion
        from active systems.
      </p>
      <p className="mb-4">
        We may retain certain records (such as transaction records) for longer periods
        where required by law or for legitimate business purposes such as fraud
        prevention.
      </p>

      {/* 7 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">7. Security</h2>
      <p className="mb-4">
        We implement industry-standard security measures to protect your data, including:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Encrypted data transmission via HTTPS/TLS.</li>
        <li>Password hashing; we never store plaintext passwords.</li>
        <li>Optional multi-factor authentication (MFA) for account access.</li>
        <li>Row-level security on our database so users can only access their own data.</li>
        <li>Access controls limiting employee access to customer data.</li>
      </ul>
      <p className="mb-4">
        No method of transmission or storage is 100% secure. While we strive to protect
        your data, we cannot guarantee absolute security. You are encouraged to enable
        MFA on your account and use a strong unique password.
      </p>

      {/* 8 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">8. Your Rights</h2>
      <p className="mb-4">
        Depending on your location, you may have the following rights regarding your
        personal data:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
        <li><strong>Correction:</strong> Request that we correct inaccurate or incomplete data.</li>
        <li><strong>Deletion:</strong> Request deletion of your personal data, subject to our legal obligations.</li>
        <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
        <li><strong>Objection / Restriction:</strong> Object to or request restriction of certain processing activities.</li>
        <li><strong>Withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time without affecting prior processing.</li>
      </ul>
      <p className="mb-4">
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:info@yardpilot.net" className="text-emerald-600 underline">
          info@yardpilot.net
        </a>
        . We will respond within 30 days. We may need to verify your identity before
        processing your request.
      </p>

      {/* 9 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">9. California Privacy Rights (CCPA)</h2>
      <p className="mb-4">
        If you are a California resident, you have the following rights under the
        California Consumer Privacy Act (CCPA):
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li><strong>Right to Know:</strong> You may request disclosure of the categories and specific pieces of personal information we have collected about you, the sources of that information, the business or commercial purpose for collecting it, and the categories of third parties with whom we share it.</li>
        <li><strong>Right to Delete:</strong> You may request deletion of personal information we have collected from you, subject to certain exceptions.</li>
        <li><strong>Right to Opt-Out of Sale:</strong> We do not sell personal information. You do not need to opt out.</li>
        <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights.</li>
      </ul>
      <p className="mb-4">
        To submit a CCPA request, contact us at{" "}
        <a href="mailto:info@yardpilot.net" className="text-emerald-600 underline">
          info@yardpilot.net
        </a>{" "}
        with the subject line &ldquo;CCPA Request.&rdquo;
      </p>

      {/* 10 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">10. Children&apos;s Privacy</h2>
      <p className="mb-4">
        The Service is not directed to individuals under the age of 18. We do not
        knowingly collect personal information from minors. If you believe we have
        inadvertently collected information from a minor, please contact us and we will
        delete it promptly.
      </p>

      {/* 11 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">11. International Users</h2>
      <p className="mb-4">
        YardPilot is operated in the United States. If you access the Service from
        outside the United States, your information will be transferred to and processed
        in the United States, where data protection laws may differ from those in your
        country. By using the Service you consent to this transfer. If you are located in
        the European Economic Area (EEA) or United Kingdom and have concerns about this,
        please contact us.
      </p>

      {/* 12 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">12. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. When we make material
        changes, we will notify you by email or by a notice in the Service at least 14
        days before the changes take effect. We encourage you to review this policy
        periodically. Your continued use of the Service after the effective date
        constitutes acceptance of the updated policy.
      </p>

      {/* 13 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">13. Contact Us</h2>
      <p className="mb-2">
        If you have questions or concerns about this Privacy Policy or our data
        practices, please contact us:
      </p>
      <address className="not-italic text-slate-700">
        <strong>YardPilot</strong><br />
        Email:{" "}
        <a href="mailto:info@yardpilot.net" className="text-emerald-600 underline">
          info@yardpilot.net
        </a>
      </address>

      <p className="mt-12 text-xs text-slate-400">
        Note: This Privacy Policy is provided as a starting point for your legal
        documentation. We recommend having a licensed attorney review and tailor this
        policy to your specific business operations before going live with paying
        customers, particularly if you serve customers in the EU, UK, or California.
      </p>
    </div>
  );
}
