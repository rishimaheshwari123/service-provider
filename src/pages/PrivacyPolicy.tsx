import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Navbar />
      
      <div className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Niyati Services Platform</p>
            <p className="text-sm text-gray-500">Operated by Niyati Solutions (Proprietor: Rahul Kant Dubey)</p>
            <p className="text-sm text-gray-500">Registered Address: H. No. 114/2, Basant Vihar Colony, Tilli Road, Shivaji Ward, Sagar, Madhya Pradesh - 470001</p>
            <p className="text-sm text-gray-500 mt-2 italic">Effective Date: 01/01/2026</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-10">
            <PrivacyContent />
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


const PrivacyContent = () => (
  <div className="space-y-8">
    <Section title="1. INTRODUCTION">
      <p className="mb-4">1.1 This Privacy Policy describes the manner in which Niyati Solutions ("Company", "we", "us", "our") collects, stores, processes, uses, transfers, discloses, and protects the information of individuals who access or use the Niyati Services Platform ("Platform"), including Customers, Service Providers, visitors, and any person interacting with the Platform ("User", "you", "your").</p>
      <p className="mb-2">1.2 This Policy applies to:</p>
      <List items={[
        "the website and mobile application of the Platform;",
        "communication channels operated through WhatsApp, SMS, email, phone calls, and push notifications;",
        "all digital interfaces, tools, services, and technologies provided by the Company.",
      ]} />
      <p className="mt-4">1.3 By accessing or using the Platform, you expressly agree to the terms of this Privacy Policy and consent to the collection, storage, and use of your information in accordance with this Policy.</p>
      <p className="mt-2">1.4 If you do not agree with this Policy, you must immediately discontinue the use of the Platform.</p>
    </Section>

    <Section title="2. DEFINITIONS">
      <p className="mb-4">For the purposes of this Policy:</p>
      <div className="space-y-3">
        <p><strong>2.1 Personal Information</strong> - means information relating to an identified or identifiable natural person, including but not limited to name, mobile number, email address, location, IP address, device details, gender, age, identifiers, and any information defined as personal information under Applicable Laws.</p>
        <p><strong>2.2 Sensitive Personal Data or Information (SPDI)</strong> - shall have the meaning assigned under IT Rules, 2011, including passwords, financial information, biometric data, health information, etc. The Platform does not ordinarily collect SPDI except where expressly required (e.g., payment gateway processing).</p>
        <p><strong>2.3 Non-Personal Information</strong> - means anonymized, aggregated, or de-identified data that cannot reasonably identify an individual.</p>
        <p><strong>2.4 Applicable Laws</strong> - means the laws of India including the IT Act, IT Rules 2011, Consumer Protection Rules, Intermediary Guidelines, and any other statutory requirements.</p>
      </div>
    </Section>

    <Section title="3. INFORMATION THAT WE COLLECT">
      <p className="mb-4">We may collect the following categories of information:</p>
      
      <p className="font-semibold mt-4 mb-2">3.1 Information You Provide Directly</p>
      
      <p className="font-medium mb-2">(a) Registration Information:</p>
      <List items={["Name", "Mobile number", "Email address", "Password", "Address or location", "Business details (for Service Providers)"]} />
      
      <p className="font-medium mt-4 mb-2">(b) Profile Information:</p>
      <List items={["Photograph (optional)", "Preferences", "Service requests", "Reviews, ratings, feedback"]} />
      
      <p className="font-medium mt-4 mb-2">(c) Communication Data:</p>
      <p className="ml-4 italic">Information exchanged through WhatsApp, SMS, emails, in-app chat, or customer support systems.</p>
      
      <p className="font-medium mt-4 mb-2">(d) Payment Information:</p>
      <List items={["Transaction details", "Subscription or listing fee data", "Payment mode"]} />
      <p className="ml-4 mt-2 text-sm italic">Payment card information is handled by third-party payment gateways compliant with PCI-DSS standards; the Platform does not store card numbers.</p>
      
      <p className="font-medium mt-4 mb-2">(e) Content Uploaded:</p>
      <p className="ml-4 italic">Any content voluntarily shared, such as: service descriptions, photos, documents, messages, listings.</p>

      <p className="font-semibold mt-6 mb-2">3.2 Information Automatically Collected</p>
      
      <p className="font-medium mb-2">(a) Device Information:</p>
      <List items={["device type, operating system, device identifiers, mobile network, browser type"]} />
      
      <p className="font-medium mt-4 mb-2">(b) Usage Information:</p>
      <List items={["pages accessed, features used, time spent, search queries, clickstream data"]} />
      
      <p className="font-medium mt-4 mb-2">(c) Location Data:</p>
      <List items={["IP-based location, browser-based geolocation (only if permitted)"]} />
      
      <p className="font-medium mt-4 mb-2">(d) Cookies and Tracking Technologies:</p>
      <p className="mb-2">We use: cookies, web beacons, analytics scripts, pixel tags, session identifiers. These help us improve functionality and user experience.</p>
      
      <p className="font-semibold mt-6 mb-2">3.3 Information from Third Parties</p>
      <p>We may receive information from: payment gateways, marketing partners, analytics providers, Service Providers after rendering services, identity verification agencies (if applicable).</p>
    </Section>

    <Section title="4. PURPOSE OF COLLECTION AND USE OF INFORMATION">
      <p className="mb-4">We process your information for the following lawful purposes:</p>
      
      <p className="font-medium mb-2">4.1 To Provide and Improve Platform Functionality:</p>
      <List items={[
        "enabling registrations and logins",
        "connecting Customers with Service Providers",
        "facilitating searches, listings, recommendations",
        "personalizing content and offerings",
        "improving Platform performance and user experience",
      ]} />
      
      <p className="font-medium mt-4 mb-2">4.2 To Enable Communication:</p>
      <p className="mb-2">We use your information to communicate via: WhatsApp, SMS, email, phone calls, push notifications.</p>
      <p className="mb-2">These communications may include:</p>
      <List items={["transactional alerts", "service confirmations", "reminders", "promotional messages", "customer support"]} />
      <p className="mt-2">You consent to such communication by using the Platform.</p>
      
      <p className="font-medium mt-4 mb-2">4.3 For Payments and Commercial Transactions:</p>
      <List items={["processing subscription fees", "generating invoices", "taxes and accounting", "fraud prevention", "dispute resolution related to payments"]} />
      
      <p className="font-medium mt-4 mb-2">4.4 Legal and Regulatory Compliance:</p>
      <List items={["comply with court orders or government directions", "enforce Platform policies", "prevent illegal activities", "maintain lawful records"]} />
      
      <p className="font-medium mt-4 mb-2">4.5 Marketing and Analytics:</p>
      <p className="mb-2">We may use anonymized or aggregated data for:</p>
      <List items={["behaviour analysis", "trend analysis", "product development", "targeted advertising"]} />
      <p className="mt-2">Users may opt out of promotional communication at any time.</p>
    </Section>


    <Section title="5. SHARING AND DISCLOSURE OF INFORMATION">
      <p className="mb-4 italic">We do not sell or rent your Personal Information. However, we may share information in the following circumstances:</p>
      <div className="space-y-3">
        <p><strong>5.1 Sharing with Service Providers:</strong> To facilitate services requested by Customers (name, contact details, request details, location).</p>
        <p><strong>5.2 Third-Party Service Providers:</strong> Payment processors, hosting, analytics, communication, support tools.</p>
        <p><strong>5.3 Legal Requirements:</strong> Comply with Applicable Laws, legal process, or orders of courts.</p>
        <p><strong>5.4 Business Transfers:</strong> In the event of merger, acquisition, sale of assets, etc.</p>
      </div>
    </Section>

    <Section title="6. DATA STORAGE, RETENTION & SECURITY">
      <List items={[
        "6.1 Information is stored on secure servers located in India or abroad, as permitted by law.",
        "6.2 We implement reasonable security practices including encryption, access controls, secure networks, authentication protocols, periodic audits.",
        "6.3 The Company complies with ISO/IEC 27001 standards where applicable.",
        "6.4 Information shall be retained as long as necessary for business purposes, as required under law, or until account deletion requests are processed.",
        "6.5 Users acknowledge that no method of transmission is fully secure, and the Company shall not be liable for breaches beyond reasonable control.",
      ]} />
    </Section>

    <Section title="7. USER RIGHTS">
      <p className="mb-2">Subject to Applicable Laws, Users may:</p>
      <List items={[
        "Access Personal Information",
        "Correct inaccurate information",
        "Withdraw Consent",
        "Request Deletion of account and associated information",
        "Opt-out of marketing communications",
      ]} />
      <p className="mt-4">Such requests may be made to the Grievance Officer.</p>
    </Section>

    <Section title="8. COOKIES AND TRACKING TECHNOLOGIES">
      <p className="mb-2">8.1 Cookies are used for:</p>
      <List items={["session management", "authentication", "personalization", "analytics"]} />
      <p className="mt-4">8.2 Users may disable cookies via browser settings, though functionality may be affected.</p>
    </Section>

    <Section title="9. CHILDREN'S PRIVACY">
      <p>The Platform is not intended for children under 18 years. We do not knowingly collect information from minors. If such information is identified, it shall be deleted.</p>
    </Section>

    <Section title="10. THIRD-PARTY LINKS">
      <p>The Platform may contain links to external websites. We are not responsible for their privacy practices. Users should review third-party policies independently.</p>
    </Section>

    <Section title="11. INTERNATIONAL TRANSFER OF DATA">
      <p>User information may be transferred outside India, subject to compliance with Indian data protection laws.</p>
    </Section>

    <Section title="12. DATA BREACH PROCEDURE">
      <p className="mb-2">In the event of a breach:</p>
      <List items={[
        "we will take immediate remedial actions",
        "notify affected Users where required by law",
        "cooperate with authorities",
      ]} />
    </Section>


    <Section title="13. DISCLAIMERS">
      <p className="mb-2">13.1 The Company shall not be liable for:</p>
      <List items={[
        "inaccuracies in information provided by Providers",
        "unauthorised access due to User negligence",
        "loss caused by third-party providers",
        "technical failures or force majeure events",
      ]} />
      <p className="mt-4">13.2 Users understand that engagement with Service Providers is independent of the Company.</p>
    </Section>

    <Section title="14. UPDATES TO THIS POLICY">
      <p>The Company reserves the right to revise this Policy at any time. Updates shall be posted on the Platform. Continued use constitutes acceptance of revised terms.</p>
    </Section>

    <Section title="15. GRIEVANCE OFFICER">
      <p className="mb-4">In accordance with Information Technology Act, 2000 and rules thereunder, the Grievance Officer is:</p>
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <p><strong>Name:</strong> Niyati Solutions</p>
        <p><strong>Email:</strong> solutions.niyati@gmail.com</p>
        <p><strong>Phone:</strong> +91 78798 84363</p>
        <p><strong>Address:</strong> Same as Company Registered Address</p>
      </div>
      <p className="mt-4 text-sm italic">The Grievance Officer shall acknowledge complaints within 48 hours and endeavour to resolve them within 30 days.</p>
    </Section>

    <Section title="16. CONTACT US">
      <div className="bg-gray-50 p-4 rounded-lg space-y-1">
        <p className="font-semibold">Niyati Solutions</p>
        <p>H. No. 114/2, Basant Vihar Colony,</p>
        <p>Tilli Road, Shivaji Ward,</p>
        <p>Sagar, Madhya Pradesh - 470001</p>
        <p className="mt-2"><strong>Email:</strong> solutions.niyati@gmail.com</p>
        <p><strong>Phone:</strong> +91 78798 84363</p>
      </div>
    </Section>
  </div>
);

export default PrivacyPolicy;
