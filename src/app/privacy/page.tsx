export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        Effective Date: {new Date().toLocaleDateString()}
      </p>

      <p className="mb-6">
        YardPilot respects your privacy. This policy explains how we collect and use your data.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Account information (name, email)</li>
        <li>Business data (customers, jobs, invoices)</li>
        <li>Usage data for improving the service</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Data</h2>
      <p className="mb-4">
        We use your data to provide, maintain, and improve the YardPilot platform.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Payments</h2>
      <p className="mb-4">
        Payments are processed through secure third-party providers like Stripe.
        We do not store full credit card information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Sharing</h2>
      <p className="mb-4">
        We do not sell your data. We only share it with trusted services necessary
        to operate the platform.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Security</h2>
      <p className="mb-4">
        We implement reasonable security measures including authentication,
        encryption, and access controls.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Your Rights</h2>
      <p className="mb-4">
        You may request access, correction, or deletion of your data.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Changes</h2>
      <p className="mb-4">
        We may update this policy from time to time.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Contact</h2>
      <p>
        Contact us at: support@yardpilot.net
      </p>
    </div>
  );
}