export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <p className="mb-4">
        Effective Date: {new Date().toLocaleDateString()}
      </p>

      <p className="mb-6">
        Welcome to YardPilot. By using our platform, you agree to the following terms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Use of Service</h2>
      <p className="mb-4">
        YardPilot provides software tools for managing lawn care businesses, including
        customers, jobs, invoices, and payments. You agree to use the service only for
        lawful business purposes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Accounts</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account and all
        activity under it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Payments</h2>
      <p className="mb-4">
        Payments processed through YardPilot may use third-party providers such as Stripe.
        We are not responsible for payment processing errors or delays caused by these providers.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Ownership</h2>
      <p className="mb-4">
        You retain ownership of your business data. We do not sell your data. We may store
        and process it to provide the service.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Acceptable Use</h2>
      <p className="mb-4">
        You agree not to misuse the platform, attempt unauthorized access, or interfere
        with service operation.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Termination</h2>
      <p className="mb-4">
        We may suspend or terminate accounts that violate these terms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Disclaimer</h2>
      <p className="mb-4">
        The service is provided "as is" without warranties of any kind.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Limitation of Liability</h2>
      <p className="mb-4">
        YardPilot is not liable for any indirect, incidental, or consequential damages.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Changes</h2>
      <p className="mb-4">
        We may update these terms at any time. Continued use of the service means you accept them.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Contact</h2>
      <p>
        For questions, contact us at: support@yardpilot.net
      </p>
    </div>
  );
}