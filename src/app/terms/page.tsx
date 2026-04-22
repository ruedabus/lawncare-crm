export default function TermsPage() {
  const effective = "April 19, 2026";
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 text-slate-800">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-8">Effective Date: {effective}</p>

      <p className="mb-6">
        Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the
        YardPilot platform (&ldquo;Service&rdquo;) operated by YardPilot (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By
        creating an account or using the Service in any way, you agree to be bound by these
        Terms. If you do not agree, do not use the Service.
      </p>

      {/* 1 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">1. Eligibility</h2>
      <p className="mb-4">
        You must be at least 18 years old and have the legal capacity to enter into a
        binding contract to use this Service. By using YardPilot you represent that you
        meet these requirements. Use of the Service on behalf of a business entity
        constitutes acceptance of these Terms by that entity, and you represent that you
        have authority to bind that entity.
      </p>

      {/* 2 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">2. Description of Service</h2>
      <p className="mb-4">
        YardPilot is a cloud-based customer relationship management (CRM) platform
        designed for lawn care and landscaping businesses. Features include, but are not
        limited to, customer management, job scheduling, estimates, invoicing, online
        payment collection, lead capture, and technician management tools.
      </p>

      {/* 3 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">3. Accounts and Security</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your login credentials
        and for all activity that occurs under your account. You agree to notify us
        immediately at <a href="mailto:info@yardpilot.net" className="text-emerald-600 underline">info@yardpilot.net</a> if
        you suspect any unauthorized use of your account. We will not be liable for any
        loss or damage arising from your failure to protect your credentials. You may not
        share your account with any third party or allow multiple individuals to access
        the Service under a single account login.
      </p>

      {/* 4 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">4. Subscription Plans and Billing</h2>
      <p className="mb-4">
        YardPilot is offered on a subscription basis. By selecting a paid plan you
        authorize us (or our payment processor, Stripe) to charge your payment method on
        a recurring monthly basis at the then-current plan price. Subscription fees are
        billed in advance. All fees are in U.S. dollars and are non-refundable except as
        expressly stated herein or required by applicable law.
      </p>
      <p className="mb-4">
        <strong>Free trial.</strong> We may offer a free trial period. At the end of the
        trial, your account will automatically convert to a paid subscription unless you
        cancel before the trial ends.
      </p>
      <p className="mb-4">
        <strong>Price changes.</strong> We reserve the right to change subscription
        pricing at any time. We will provide at least 30 days&apos; notice before any price
        increase takes effect for existing subscribers.
      </p>
      <p className="mb-4">
        <strong>Cancellation.</strong> You may cancel your subscription at any time
        through your account settings. Cancellation takes effect at the end of the
        current billing period. You will retain access to the Service through the end of
        the paid period. We do not provide prorated refunds for partial billing periods.
      </p>
      <p className="mb-4">
        <strong>Failed payments.</strong> If a payment fails, we may suspend or
        terminate your account after a reasonable notice period.
      </p>

      {/* 5 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">5. Payment Processing</h2>
      <p className="mb-4">
        Online invoice payments made by your customers are processed by Stripe, Inc., a
        third-party payment processor. By using the payment features of the Service you
        agree to Stripe&apos;s{" "}
        <a
          href="https://stripe.com/legal/ssa"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 underline"
        >
          Services Agreement
        </a>
        . We are not responsible for payment processing errors, delays, chargebacks, or
        disputes arising from transactions processed by Stripe. You are solely
        responsible for your compliance with applicable payment card industry rules and
        any obligations to your own customers.
      </p>

      {/* 6 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">6. Data Ownership</h2>
      <p className="mb-4">
        You retain full ownership of all business data you input into YardPilot,
        including customer records, job details, invoices, and related content
        (&ldquo;Your Data&rdquo;). We do not sell Your Data to third parties. You grant us a limited,
        non-exclusive, royalty-free license to store, process, and transmit Your Data
        solely for the purpose of providing and improving the Service. Upon account
        termination you may export Your Data for a period of 30 days following
        termination, after which we may permanently delete it.
      </p>

      {/* 7 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">7. Acceptable Use</h2>
      <p className="mb-4">You agree not to:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Use the Service for any unlawful purpose or in violation of any applicable regulation.</li>
        <li>Attempt to gain unauthorized access to any part of the Service or its related systems.</li>
        <li>Transmit viruses, malware, or other harmful code through the Service.</li>
        <li>Scrape, reverse-engineer, decompile, or otherwise attempt to extract source code from the Service.</li>
        <li>Resell, sublicense, or provide the Service to third parties without our written consent.</li>
        <li>Use the Service to store or transmit content that is defamatory, obscene, or infringes any third-party rights.</li>
        <li>Circumvent or disable any security features of the Service.</li>
      </ul>
      <p className="mb-4">
        We reserve the right to investigate and take appropriate legal action against
        anyone who, in our sole discretion, violates this section.
      </p>

      {/* 8 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">8. Intellectual Property</h2>
      <p className="mb-4">
        The YardPilot name, logo, platform design, software, and all related content are
        owned by or licensed to us and are protected by copyright, trademark, and other
        intellectual property laws. Nothing in these Terms grants you any right to use
        our intellectual property except as necessary to use the Service as intended.
      </p>

      {/* 9 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">9. Third-Party Services</h2>
      <p className="mb-4">
        The Service integrates with third-party services including Stripe (payments),
        Supabase (data infrastructure), and Resend (email delivery). These services are
        governed by their own terms and privacy policies. We are not responsible for the
        practices or availability of third-party services.
      </p>

      {/* 10 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">10. Disclaimer of Warranties</h2>
      <p className="mb-4">
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY
        KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE
        DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY
        SECURE. YOU USE THE SERVICE AT YOUR OWN RISK.
      </p>

      {/* 11 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">11. Limitation of Liability</h2>
      <p className="mb-4">
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, YARDPILOT AND ITS OFFICERS,
        DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY
        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
        LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS INTERRUPTION, ARISING OUT OF OR IN
        CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF WE HAVE
        BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p className="mb-4">
        OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO
        THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE TOTAL AMOUNT YOU PAID US IN
        THE THREE MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE
        HUNDRED U.S. DOLLARS ($100.00).
      </p>

      {/* 12 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">12. Indemnification</h2>
      <p className="mb-4">
        You agree to indemnify, defend, and hold harmless YardPilot and its officers,
        directors, employees, and agents from and against any claims, liabilities,
        damages, losses, and expenses (including reasonable attorney&apos;s fees) arising out
        of or in any way connected with your use of the Service, Your Data, your
        violation of these Terms, or your violation of any rights of another person or
        entity.
      </p>

      {/* 13 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">13. Termination</h2>
      <p className="mb-4">
        We may suspend or permanently terminate your access to the Service at any time,
        with or without notice, for conduct that we believe violates these Terms or is
        harmful to other users, us, third parties, or the public interest. Upon
        termination for cause, no refund will be issued for any prepaid fees.
      </p>
      <p className="mb-4">
        You may terminate your account at any time by cancelling your subscription and
        ceasing use of the Service. Sections 6, 10, 11, 12, 14, 15, and 16 survive any
        termination of these Terms.
      </p>

      {/* 14 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">14. Dispute Resolution and Arbitration</h2>
      <p className="mb-4">
        <strong>Informal resolution.</strong> Before filing any formal legal action,
        you agree to first contact us at{" "}
        <a href="mailto:info@yardpilot.net" className="text-emerald-600 underline">
          info@yardpilot.net
        </a>{" "}
        and give us 30 days to attempt to resolve the dispute informally.
      </p>
      <p className="mb-4">
        <strong>Binding arbitration.</strong> If informal resolution fails, you and
        YardPilot agree that any dispute, claim, or controversy arising out of or
        relating to these Terms or the Service shall be resolved by binding individual
        arbitration administered by the American Arbitration Association (&ldquo;AAA&rdquo;) under
        its Consumer Arbitration Rules. The arbitration shall take place in the State of
        Texas. The arbitrator&apos;s decision shall be final and binding and may be entered
        as a judgment in any court of competent jurisdiction.
      </p>
      <p className="mb-4">
        <strong>Class action waiver.</strong> YOU AND YARDPILOT AGREE THAT EACH MAY
        BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY AND NOT AS A
        PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
      </p>
      <p className="mb-4">
        <strong>Exception.</strong> Either party may seek emergency injunctive relief in
        a court of competent jurisdiction to prevent irreparable harm pending arbitration.
      </p>

      {/* 15 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">15. Governing Law</h2>
      <p className="mb-4">
        These Terms are governed by and construed in accordance with the laws of the
        State of Texas, without regard to its conflict-of-law principles. To the extent
        any court proceeding is permitted under these Terms, you consent to the exclusive
        jurisdiction of the state and federal courts located in Texas.
      </p>

      {/* 16 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">16. Force Majeure</h2>
      <p className="mb-4">
        We will not be liable for any failure or delay in performance resulting from
        causes beyond our reasonable control, including natural disasters, acts of
        government, pandemics, internet or power outages, or third-party service
        failures.
      </p>

      {/* 17 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">17. Changes to These Terms</h2>
      <p className="mb-4">
        We may update these Terms from time to time. When we make material changes we
        will notify you by email or by displaying a notice in the Service at least 14
        days before the changes take effect. Your continued use of the Service after the
        effective date of the revised Terms constitutes acceptance of the changes. If you
        do not agree to the updated Terms, you must cancel your account before the
        effective date.
      </p>

      {/* 18 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">18. General</h2>
      <p className="mb-4">
        These Terms, together with our Privacy Policy, constitute the entire agreement
        between you and YardPilot regarding the Service and supersede all prior
        agreements. If any provision is found unenforceable, the remaining provisions
        will remain in full force and effect. Our failure to enforce any right or
        provision of these Terms is not a waiver of that right or provision. You may not
        assign your rights or obligations under these Terms without our prior written
        consent.
      </p>

      {/* 19 */}
      <h2 className="text-xl font-semibold mt-10 mb-3">19. Contact Us</h2>
      <p className="mb-2">For questions about these Terms, contact:</p>
      <address className="not-italic text-slate-700">
        <strong>YardPilot</strong><br />
        Email:{" "}
        <a href="mailto:info@yardpilot.net" className="text-emerald-600 underline">
          info@yardpilot.net
        </a>
      </address>

      <p className="mt-12 text-xs text-slate-400">
        Note: These Terms of Service are provided for informational purposes and as a
        starting point for your legal documentation. We recommend having a licensed
        attorney review and tailor these Terms to your specific business before going
        live with paying customers.
      </p>
    </div>
  );
}
