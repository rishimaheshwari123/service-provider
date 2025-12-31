import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-10">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          For Service Providers • Last Updated: 01/01/2026
        </p>

        {/* Section */}
        <Section title="1. Eligibility">
          <List
            items={[
              "You must be at least 18 years old to register as a service provider.",
              "All information provided must be accurate and up to date.",
              "You must be legally authorized to provide the listed services.",
            ]}
          />
        </Section>

        <Section title="2. Service Responsibilities">
          <List
            items={[
              "Services must be delivered professionally and on time.",
              "Any delay or cancellation must be informed to the customer immediately.",
              "You are solely responsible for the quality of services provided.",
            ]}
          />
        </Section>

        <Section title="3. Payments & Fees">
          <List
            items={[
              "Payments are processed as per the platform payment cycle.",
              "Platform fees, commissions, or taxes may be deducted.",
              "The platform is not responsible for offline payment disputes.",
            ]}
          />
        </Section>

        <Section title="4. Cancellations & Refunds">
          <List
            items={[
              "Frequent cancellations may lead to suspension or termination.",
              "Refunds are handled as per platform refund policy.",
              "Any misuse of refund policies is strictly prohibited.",
            ]}
          />
        </Section>

        <Section title="5. Legal Compliance">
          <List
            items={[
              "You must comply with all applicable local and national laws.",
              "Required licenses or certifications must remain valid.",
              "Legal violations may result in immediate account termination.",
            ]}
          />
        </Section>

        <Section title="6. Prohibited Activities">
          <List
            items={[
              "Providing false or misleading information.",
              "Engaging in fraudulent or illegal activities.",
              "Misuse of customer data or platform resources.",
            ]}
          />
        </Section>

        <Section title="7. Ratings & Reviews">
          <List
            items={[
              "Customers may leave ratings and reviews.",
              "Fake or abusive reviews may be removed by the platform.",
              "Consistently poor ratings may lead to suspension.",
            ]}
          />
        </Section>

        <Section title="8. Account Suspension & Termination">
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate
            these terms, receive repeated complaints, or engage in unethical or
            illegal conduct.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p className="text-gray-600 leading-relaxed">
            The platform acts only as a technology intermediary and is not
            responsible for disputes between service providers and customers.
          </p>
        </Section>

        <Section title="10. Confidentiality & Data Protection">
          <p className="text-gray-600 leading-relaxed">
            Customer data must remain confidential. Any misuse or unauthorized
            sharing of data may result in legal action.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p className="text-gray-600 leading-relaxed">
            These Terms shall be governed by the laws of India. All disputes are
            subject to the jurisdiction of local courts.
          </p>
        </Section>

        <Section title="12. Contact Information">
          <p className="text-gray-600">
            {/* Email: <span className="font-medium">support@yourdomain.com</span>
            <br /> */}
            Phone: <span className="font-medium">+91-78798 84363</span>
          </p>
        </Section>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t text-sm text-gray-500">
          By registering as a service provider, you agree to these Terms &
          Conditions.
        </div>
      </div>
    </div>
  );
};

/* Reusable Components */
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
    {children}
  </div>
);

const List = ({ items }) => (
  <ul className="list-disc pl-5 space-y-2 text-gray-600">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

export default TermsAndConditions;
