import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";

const TermsAndConditions = () => {
  const [activeTab, setActiveTab] = useState<"customer" | "provider">("customer");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <TopBar /> */}
      <Navbar />
      
      <div className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Terms & Conditions</h1>
            <p className="text-gray-600">Niyati Services Platform</p>
            <p className="text-sm text-gray-500">Operated by Niyati Solutions (Proprietor: Rahul Kant Dubey)</p>
            <p className="text-sm text-gray-500">Registered Address: H. No. 114/2, Basant Vihar Colony, Tilli Road, Shivaji Ward, Sagar, Madhya Pradesh - 470001</p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("customer")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "customer"
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              For Customers
            </button>
            <button
              onClick={() => setActiveTab("provider")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "provider"
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              For Service Providers
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-10">
            {activeTab === "customer" ? <CustomerTerms /> : <ProviderTerms />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};


const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
    <div className="text-gray-600 leading-relaxed">{children}</div>
  </div>
);

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-6 space-y-1 text-gray-600">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const CustomerTerms = () => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">TERMS & CONDITIONS FOR CUSTOMERS</h2>
    
    <Section title="1. DEFINITIONS">
      <p className="mb-4">For the purpose of these Terms & Conditions, the following expressions shall have the meanings assigned to them hereunder:</p>
      <div className="space-y-3">
        <p><strong>1.1 Company or Niyati Solutions</strong> - means the sole proprietorship concern owned and operated by Mr. Rahul Kant Dubey.</p>
        <p><strong>1.2 Platform or Niyati Services Platform</strong> - means the Company's digital platform including website, mobile application, digital interfaces, communication channels, WhatsApp/SMS/email systems, backend systems, databases, and all associated technology.</p>
        <p><strong>1.3 Customer or User</strong> - means any individual or legal entity accessing, browsing, registering on, or using the Platform to search for, identify, evaluate, communicate with, or engage a Service Provider.</p>
        <p><strong>1.4 Service Provider</strong> - means any individual, organisation, business, or entity listed on the Platform offering professional, domestic, commercial, technical, advisory, repair, maintenance, or other services.</p>
        <p><strong>1.5 Services</strong> - means the services actually rendered by the Service Provider to the Customer offline/online and not by the Platform.</p>
        <p><strong>1.6 Listing</strong> - means the entry, information, profile, advertisement, or details of the Service Provider as reflected on the Platform.</p>
        <p><strong>1.7 Content</strong> - includes but is not limited to texts, graphics, images, software, videos, data, reviews, ratings, feedback, designs, layouts, codes, and proprietary material appearing on the Platform.</p>
        <p><strong>1.8 Applicable Laws</strong> - means all laws, rules, regulations, notifications, directions, guidelines, orders issued by Central/State authorities in India.</p>
        <p><strong>1.9 Communication Media</strong> - includes WhatsApp, SMS, email, voice calls, push notifications, and any other mode used by the Company for communicating with Users.</p>
      </div>
    </Section>

    <Section title="2. ACCEPTANCE OF TERMS">
      <List items={[
        "2.1 By accessing or using the Platform, the Customer unequivocally agrees to be bound by these Terms, Privacy Policy, and any supplementary policies notified by the Company from time to time.",
        "2.2 In the event the Customer disagrees with these Terms, the Customer shall immediately discontinue the use of the Platform. Continued use constitutes binding acceptance.",
        "2.3 These Terms constitute a legally enforceable contract between the Customer and Niyati Solutions.",
      ]} />
    </Section>


    <Section title="3. NATURE OF PLATFORM & DISCLAIMER OF LIABILITY">
      <p className="mb-4">3.1 The Customer expressly acknowledges that the Platform is only an intermediary, as defined under the Information Technology Act, 2000 and associated rules, whose role is limited to providing a digital interface whereby Customers may identify and connect with third-party Service Providers.</p>
      <p className="mb-2">3.2 The Company:</p>
      <List items={[
        "(a) does not provide or perform any of the services listed;",
        "(b) does not employ or supervise Service Providers;",
        "(c) does not guarantee the quality, capability, conduct, pricing, or qualification of any Service Provider;",
        "(d) does not inspect or verify the validity of licences, permits, registrations, certifications, or credentials of Service Providers;",
        "(e) shall not be liable for any loss, damage, injury, deficiency, misconduct, or fraud committed by any Service Provider.",
      ]} />
      <p className="mt-4">3.3 The Customer understands that engagement of a Service Provider is a private contractual arrangement solely between the Customer and the Service Provider. The Company shall not be deemed a party to any such arrangement.</p>
      <p className="mt-2">3.4 The Customer expressly agrees that the Company assumes no vicarious, contractual, legal, statutory, or tortious liability for any act or omission of any Service Provider.</p>
    </Section>

    <Section title="4. CUSTOMER ELIGIBILITY AND OBLIGATIONS">
      <p className="mb-2">4.1 The Customer represents that they are:</p>
      <List items={[
        "(a) at least 18 years of age;",
        "(b) legally competent to enter binding contracts;",
        "(c) using their own verified mobile number and email;",
        "(d) providing correct and updated information.",
      ]} />
      <p className="mt-4 mb-2">4.2 The Customer shall:</p>
      <List items={[
        "(a) use the Platform only for lawful purposes;",
        "(b) not engage in fraudulent, abusive, defamatory, or illegal conduct;",
        "(c) not misuse ratings, feedback, reviews, or communication channels;",
        "(d) not attempt to harm, disable, or disrupt Platform operations;",
        "(e) not impersonate or misrepresent identity;",
        "(f) comply with all laws relating to hiring of Service Providers.",
      ]} />
      <p className="mt-4">4.3 The Customer acknowledges that the Company may suspend or terminate access in the event of violation of these Terms.</p>
    </Section>

    <Section title="5. COMMUNICATION CONSENT">
      <p className="mb-4">5.1 By using the Platform, the Customer irrevocably consents to receive communications from the Company via WhatsApp, SMS, email, phone calls, push notifications, and any other communication media.</p>
      <p className="mb-2">5.2 Such communications shall include but not be limited to:</p>
      <List items={["account verification", "service-related updates", "promotional messages", "transactional information", "alerts and notices"]} />
      <p className="mt-4">5.3 The Customer may opt out of promotional communications. Transactional communications cannot be disabled.</p>
    </Section>

    <Section title="6. PAYMENT TERMS & FEES">
      <p className="mb-4">6.1 At present, the Platform charges fees primarily to Service Providers for listing and subscription.</p>
      <p className="mb-2">6.2 The Company expressly reserves the unilateral right to:</p>
      <List items={[
        "(a) introduce fees or commissions payable by Customers;",
        "(b) revise, alter, modify, or withdraw fee structures;",
        "(c) impose convenience fees, service charges, booking fees, or other price components;",
        "(d) amend pricing models without prior notice.",
      ]} />
      <p className="mt-4">6.3 All payments made through the Platform shall be subject to payment gateway rules and applicable taxes.</p>
      <p className="mt-2 mb-2">6.4 The Customer agrees that the Company shall not be liable for:</p>
      <List items={["(a) payment disputes between Customer and Service Provider;", "(b) refund, cancellation, non-payment, overcharging, or pricing errors by Service Providers."]} />
    </Section>


    <Section title="7. SERVICE PROVIDER OBLIGATIONS AND LEGAL RESPONSIBILITY">
      <p className="mb-4">7.1 The Customer acknowledges that each Service Provider is solely responsible for ensuring that they possess all statutory licences, registrations, approvals, authorisations, qualifications, permits, and insurance necessary under Applicable Laws to operate their business.</p>
      <p className="mb-4">7.2 The Company does not verify or certify compliance with legal requirements and the Customer waives any claim against the Company in this regard.</p>
      <p>7.3 The Customer agrees to independently satisfy themselves as to the legitimacy, competence, and reliability of the Service Provider before availing services.</p>
    </Section>

    <Section title="8. NO WARRANTY; NO GUARANTEE">
      <p className="mb-4">8.1 The Platform, its content, listings, and features are provided on an "as is" basis without warranties of any kind.</p>
      <p className="mb-2">8.2 The Company expressly disclaims all warranties, whether express or implied, including but not limited to:</p>
      <List items={["quality or suitability of Service Providers", "accuracy of information provided by Service Providers", "timeliness, reliability, or safety of services", "outcomes or results of services", "compliance with law by Service Providers"]} />
      <p className="mt-4">8.3 The Customer agrees that no advice or information obtained from the Platform shall create any warranty not expressly stated in these Terms.</p>
    </Section>

    <Section title="9. LIMITATION OF LIABILITY">
      <p className="mb-2">9.1 To the fullest extent permissible under law, the Company shall not be liable for:</p>
      <List items={["any direct, indirect, incidental, consequential, punitive, exemplary, or special damages;", "loss of profits, business, goodwill, or data;", "injury, property damage, death, or misconduct by Service Providers;", "fraud, deficiency in service, non-performance, breach, or negligence of Service Providers;", "any act of the Customer or third parties."]} />
      <p className="mt-4">9.2 In no event shall the Company's total liability exceed INR 1,000.</p>
      <p className="mt-2">9.3 This limitation applies irrespective of cause of action - contract, tort, negligence, or otherwise.</p>
    </Section>

    <Section title="10. INDEMNITY">
      <p className="mb-2">The Customer agrees to indemnify, defend, and hold harmless the Company, its proprietor, employees, agents, and representatives from any claim, loss, liability, damage, or cost arising from:</p>
      <List items={["use of Platform;", "engagement of Service Provider;", "violation of these Terms;", "breach of law;", "negligence or misconduct of Customer."]} />
    </Section>

    <Section title="11. INTELLECTUAL PROPERTY RIGHTS">
      <p className="mb-4">11.1 All rights in the Platform including trademarks, software, design, layout, databases, and proprietary content belong exclusively to Niyati Solutions.</p>
      <p>11.2 The Customer shall not copy, reproduce, reverse engineer, modify, translate, or commercially exploit any part of the Platform.</p>
    </Section>

    <Section title="12. TERMINATION">
      <p className="mb-2">12.1 The Company may suspend or terminate access if:</p>
      <List items={["(a) Customer violates these Terms;", "(b) Customer engages in fraud or illegal activity;", "(c) Platform security is threatened;", "(d) required by law."]} />
      <p className="mt-4">12.2 Customer may discontinue use at any time.</p>
    </Section>

    <Section title="13. DISPUTE RESOLUTION - ARBITRATION">
      <List items={[
        "13.1 Any dispute arising out of or relating to these Terms shall be resolved through binding arbitration under the Arbitration and Conciliation Act, 1996.",
        "13.2 Seat of Arbitration shall be Sagar, Madhya Pradesh",
        "13.3 Language shall be English or Hindi",
        "13.4 Arbitrator: Sole arbitrator appointed by mutual consent or by the Company if mutual consent fails.",
        "13.5 Courts at Sagar shall have exclusive jurisdiction for interim and enforcement proceedings.",
      ]} />
    </Section>

    <Section title="14. GOVERNING LAW">
      <p>These Terms shall be governed by and construed in accordance with the laws of India.</p>
    </Section>

    <Section title="15. AMENDMENTS">
      <p>The Company may modify these Terms at any time. Updated Terms shall be posted on the Platform and shall take effect upon posting.</p>
    </Section>

    <Section title="16. ENTIRE AGREEMENT">
      <p>This Agreement constitutes the entire agreement and understanding of the Parties with respect to the subject matter hereof, superseding all prior or contemporaneous agreements, representations, promises and understandings, whether written or oral.</p>
    </Section>

    <Section title="17. WAIVER">
      <p>Neither party may assign its rights or delegate its duties under this Agreement without the other party's prior written consent. Neither party will be charged with any waiver of any provision of this Agreement, unless such waiver is evidenced by a writing signed by the party.</p>
    </Section>

    <Section title="18. ASSIGNABILITY">
      <p>This Agreement shall be binding on and inure to the benefit of the Parties hereto and their respective heirs, representatives, successors and assigns, provided, however, neither of the party may assign this Agreement or any rights hereunder to any person or entity without the prior written consent of the other party.</p>
    </Section>

    <Section title="19. SEVERABILITY">
      <p>All of the provisions of this Agreement are distinct and severable, and any provision of this Agreement that is deemed inoperative, unenforceable, void or invalid shall not affect the operation, enforceability, legality or validity of any other part of this Agreement.</p>
    </Section>
  </div>
);


const ProviderTerms = () => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">TERMS & CONDITIONS FOR SERVICE PROVIDERS</h2>
    
    <Section title="1. DEFINITIONS">
      <p className="mb-4">For purposes of these Terms & Conditions, the following expressions shall have the meanings assigned herein:</p>
      <div className="space-y-3">
        <p><strong>1.1 Company or Niyati Solutions</strong> - means the sole proprietorship owned by Mr. Rahul Kant Dubey, operating the Niyati Services Platform.</p>
        <p><strong>1.2 Platform or Niyati Services Platform</strong> - means the Company's digital interface including its website, mobile application, software, communication systems, technology integrations, WhatsApp/SMS/email services, and backend infrastructure.</p>
        <p><strong>1.3 Service Provider or Provider</strong> - means any individual, entity, firm, agency, business, or establishment which registers on the Platform for the purpose of advertising, listing, marketing, or offering its services to Customers.</p>
        <p><strong>1.4 Customer</strong> - means any individual or entity using the Platform to identify, engage, request, or obtain services from Service Providers.</p>
        <p><strong>1.5 Listing</strong> - means all information, content, descriptions, pricing, images, branding, and materials uploaded by the Service Provider.</p>
        <p><strong>1.6 Services</strong> - refers to the actual work, assistance, professional or technical services rendered by the Service Provider to Customers.</p>
        <p><strong>1.7 Subscription Fees or Listing Fees</strong> - means the monetary charges that the Service Provider pays to the Company for being listed or promoted on the Platform.</p>
        <p><strong>1.8 Applicable Laws</strong> - means all statutes, regulations, notifications, orders, circulars, consumer laws, labour laws, tax laws, and other legal requirements applicable in India.</p>
        <p><strong>1.9 Communication Media</strong> - includes WhatsApp, SMS, email, voice calls, app notifications and other channels used by the Company.</p>
      </div>
    </Section>

    <Section title="2. ACCEPTANCE OF TERMS">
      <List items={[
        "2.1 By registering as a Service Provider, accessing the Platform, uploading Listings, or offering Services to Customers, the Service Provider irrevocably agrees to be bound by these Terms.",
        "2.2 These Terms constitute a legally enforceable contract between the Service Provider and Niyati Solutions.",
        "2.3 If the Service Provider disagrees with any provision, they must immediately cease use of the Platform and request deletion of their Profile.",
      ]} />
    </Section>

    <Section title="3. NATURE OF PLATFORM AND ABSENCE OF AGENCY RELATIONSHIP">
      <p className="mb-2">3.1 The Service Provider acknowledges and agrees that:</p>
      <List items={[
        "The Platform is only an intermediary under the Information Technology Act, 2000.",
        "The Company does not recommend, endorse, verify, monitor, or guarantee any Service Provider.",
        "The Company does not supervise or control your employees, subcontractors, or representatives.",
        "No partnership, employment, joint venture, franchise, agency, or principal-agent relationship exists between the Company and the Service Provider.",
      ]} />
      <p className="mt-4">3.2 All transactions between Service Providers and Customers are private, independent commercial dealings, to which the Company is not a party.</p>
      <p className="mt-2 mb-2">3.3 The Service Provider undertakes full responsibility for:</p>
      <List items={["all services rendered", "all representations made", "safety and compliance", "customer satisfaction", "legal & tax obligations"]} />
      <p className="mt-2">The Company shall not be liable in any manner whatsoever.</p>
    </Section>


    <Section title="4. SERVICE PROVIDER REGISTRATION & OBLIGATIONS">
      <p className="mb-2">4.1 The Service Provider must provide:</p>
      <List items={["accurate business information", "valid identity documents", "details of services offered", "pricing, location, qualifications, licences (if applicable)", "valid contact information"]} />
      <p className="mt-4 mb-2">4.2 Service Provider represents that all information submitted to the Platform is:</p>
      <List items={["true", "complete", "current", "not misleading", "legally compliant"]} />
      <p className="mt-4">4.3 The Service Provider shall promptly update any changes to licensing, qualifications, contact information, tax status, or service offerings.</p>
      <p className="mt-2">4.4 The Company reserves the right to verify information and documents, but is not obligated to do so.</p>
    </Section>

    <Section title="5. MANDATORY LEGAL COMPLIANCE">
      <p className="mb-4">The Service Provider warrants and undertakes that:</p>
      <p className="mb-4">5.1 They possess all statutory licences, certificates, registrations, and authorisations required under Applicable Laws to operate their business.</p>
      <p className="mb-2">5.2 They shall ensure full compliance with:</p>
      <List items={["GST regulations", "Labour and employment laws", "Safety standards", "Local municipal laws", "Environmental and health regulations", "Sector-specific licensing (e.g., electrical licence, clinical licence, etc.)"]} />
      <p className="mt-4">5.3 They shall maintain all permits in valid and active condition.</p>
      <p className="mt-2 mb-2">5.4 Non-compliance shall result in:</p>
      <List items={["immediate termination of listing", "blacklisting", "legal action", "reporting to authorities"]} />
      <p className="mt-4">5.5 The Company disclaims all liability for any violation committed by Service Providers.</p>
    </Section>

    <Section title="6. PAYMENTS, FEES & COMMERCIAL TERMS">
      <p className="mb-4">6.1 The Service Provider agrees to pay Listing/Subscription Fees as notified at the time of registration or renewal.</p>
      <p className="mb-4">6.2 Fees are non-refundable, except where explicitly permitted in writing by the Company.</p>
      <p className="mb-2">6.3 The Company reserves the unilateral right to:</p>
      <List items={["revise fee amounts", "introduce new fees or commissions", "charge Customers or Service Providers in any arrangement", "implement promotional or premium listing charges", "modify billing cycles", "alter payment methods"]} />
      <p className="mt-4">6.4 Continued use of the Platform constitutes acceptance of such revisions.</p>
      <p className="mt-2">6.5 The Service Provider agrees that failure to pay fees may result in suspension or deletion of the listing.</p>
    </Section>

    <Section title="7. SERVICE QUALITY OBLIGATIONS">
      <p className="mb-2">The Service Provider shall:</p>
      <List items={[
        "7.1 Maintain professionalism, punctuality, courtesy, and ethical conduct.",
        "7.2 Deliver promised services accurately and in accordance with industry standards.",
        "7.3 Ensure safety of all tools, machinery, chemicals, or equipment used.",
        "7.4 Attend to Customer complaints promptly.",
        "7.5 Avoid misrepresentations, overpricing, concealed charges, or fraudulent practices.",
        "7.6 Abstain from harassment, abuse, or misconduct toward Customers.",
      ]} />
      <p className="mt-4">Any violation shall entitle the Company to suspend or terminate listing.</p>
    </Section>

    <Section title="8. PLATFORM'S DISCLAIMER OF LIABILITY">
      <p className="mb-2">8.1 The Company does not guarantee:</p>
      <List items={["number of leads", "number of customers", "commercial success", "revenue", "business continuity", "accuracy of Customer information", "fulfilment of engagements"]} />
      <p className="mt-4 mb-2">8.2 The Company shall not be liable for:</p>
      <List items={["disputes between Provider and Customer", "injury, property damage, or loss caused during service", "delay or failure in performance", "financial disputes", "defamation or negative reviews", "criminal acts of Provider or Customer", "loss due to force majeure events"]} />
      <p className="mt-4">8.3 The Service Provider agrees that the Platform is not responsible for any outcome of their engagement with Customers.</p>
    </Section>


    <Section title="9. CONTENT, LISTINGS & INTELLECTUAL PROPERTY">
      <p className="mb-4">9.1 All content uploaded by the Service Provider must be lawful, original, and accurate.</p>
      <p className="mb-4">9.2 The Service Provider grants the Company a non-exclusive, worldwide, royalty-free licence to store, modify, display, publish, reproduce, use, distribute their Listings on the Platform.</p>
      <p className="mb-4">9.3 The Company may edit or remove content that is inaccurate, misleading, offensive, unlawful or harmful to reputation.</p>
      <p>9.4 All Platform IP remains exclusively owned by the Company.</p>
    </Section>

    <Section title="10. RATINGS, REVIEWS & FEEDBACK">
      <p className="mb-4">10.1 Customers may publish ratings and reviews about Service Providers.</p>
      <p className="mb-4">10.2 The Company has no obligation to remove negative reviews unless unlawful.</p>
      <p className="mb-2">10.3 Service Provider agrees that:</p>
      <List items={["reviews do not constitute Company opinion", "reviews may affect ranking or visibility", "the Company may moderate or remove content at its discretion"]} />
      <p className="mt-4">10.4 The Company is not liable for Customer reviews.</p>
    </Section>

    <Section title="11. CONFIDENTIALITY & DATA PROTECTION">
      <p className="mb-4">11.1 Service Provider shall treat all Customer data as confidential.</p>
      <p>11.2 Service Provider shall not misuse, sell, share or exploit Customer data for any purpose other than service fulfilment and violation of this condition will result in appropriate action including termination, indemnification, legal action or reporting to authorities.</p>
    </Section>

    <Section title="12. INDEMNIFICATION">
      <p className="mb-2">12.1 The Service Provider shall indemnify and hold harmless the Company, Proprietor, employees, and agents from all losses, damages, liabilities, claims, penalties, fines, costs, and expenses arising out of:</p>
      <List items={["breach of these Terms", "deficiency or negligence in services", "misconduct or fraud", "violation of law", "infringement of rights", "injury or property damage", "wrong disclosures or misrepresentations", "tax non-compliance or regulatory violations"]} />
      <p className="mt-4">12.2 This clause survives termination.</p>
    </Section>

    <Section title="13. LIMITATION OF LIABILITY">
      <p className="mb-4">13.1 To the maximum extent permitted by law, the Company's total liability toward the Service Provider shall not exceed INR 1,000, regardless of cause or nature of claim.</p>
      <p>13.2 The Company is not liable for business losses, goodwill loss, reputation damage, lost opportunities or consequential or incidental damage.</p>
    </Section>

    <Section title="14. TERMINATION & SUSPENSION">
      <p className="mb-2">14.1 The Company may suspend or terminate in case of:</p>
      <List items={["breach of Terms", "non-payment of fees", "fraudulent activity", "Customer complaints", "reputational harm", "regulatory action against the Provider", "inaccurate or misleading information", "any other reason whatsoever at the sole discretion of the Company"]} />
      <p className="mt-4 mb-2">14.2 Upon termination:</p>
      <List items={["all Listings are removed", "Fees paid are non-refundable", "the Service Provider will lose access to leads and customer data"]} />
    </Section>

    <Section title="15. DISPUTE RESOLUTION - ARBITRATION">
      <List items={[
        "15.1 Any dispute arising out of or relating to these Terms shall be resolved through binding arbitration under the Arbitration and Conciliation Act, 1996.",
        "15.2 Seat of Arbitration shall be Sagar, Madhya Pradesh",
        "15.3 Language shall be English or Hindi",
        "15.4 Arbitrator: Sole arbitrator appointed by mutual consent or by the Company if mutual consent fails.",
        "15.5 Courts at Sagar shall have exclusive jurisdiction for interim and enforcement proceedings.",
      ]} />
    </Section>

    <Section title="16. GOVERNING LAW">
      <p>These Terms shall be governed by and construed in accordance with the laws of India.</p>
    </Section>

    <Section title="17. COMMUNICATION">
      <p className="mb-2">All communications shall be delivered via any of the following modes:</p>
      <List items={["WhatsApp", "SMS", "Email", "Phone calls", "Platform notifications"]} />
      <p className="mt-4">The Service Provider consents to receive such communications.</p>
    </Section>

    <Section title="18. AMENDMENTS">
      <p>The Company may modify these Terms at any time. Updated Terms shall be posted on the Platform and shall take effect upon posting.</p>
    </Section>

    <Section title="19. ENTIRE AGREEMENT">
      <p>This Agreement constitutes the entire agreement and understanding of the Parties with respect to the subject matter hereof, superseding all prior or contemporaneous agreements, representations, promises and understandings, whether written or oral.</p>
    </Section>

    <Section title="20. WAIVER">
      <p>Neither party may assign its rights or delegate its duties under this Agreement without the other party's prior written consent. Neither party will be charged with any waiver of any provision of this Agreement, unless such waiver is evidenced by a writing signed by the party.</p>
    </Section>

    <Section title="21. ASSIGNABILITY">
      <p>This Agreement shall be binding on and inure to the benefit of the Parties hereto and their respective heirs, representatives, successors and assigns, provided, however, neither of the party may assign this Agreement or any rights hereunder to any person or entity without the prior written consent of the other party.</p>
    </Section>

    <Section title="22. SEVERABILITY">
      <p>All of the provisions of this Agreement are distinct and severable, and any provision of this Agreement that is deemed inoperative, unenforceable, void or invalid shall not affect the operation, enforceability, legality or validity of any other part of this Agreement.</p>
    </Section>
  </div>
);

export default TermsAndConditions;
