import {
  Handshake,
  UserCheck,
  Users,
  Award,
  Lightbulb,
  Scale,
  Cpu,
  UsersRound,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const coreValues = [
    {
      icon: Handshake,
      title: t("pages.home.trustTransparency", "Trust & Transparency"),
      description: t(
        "pages.home.trustTransparencyDesc",
        "We believe trust is the foundation of every service. GharSansaar promotes transparency in service listings, provider details, and processes to ensure users can make informed decisions with confidence."
      ),
    },
    {
      icon: UserCheck,
      title: t("pages.home.customerFirst", "Customer First"),
      description: t(
        "pages.home.customerFirstDesc",
        "Every feature, policy, and decision at GharSansaar is designed around the needs and convenience of our users. Their satisfaction and experience guide everything we do."
      ),
    },
    {
      icon: Users,
      title: t("pages.home.empoweringProviders", "Empowering Service Providers"),
      description: t(
        "pages.home.empoweringProvidersDesc",
        "We are committed to enabling service providers to grow by giving them digital visibility, fair opportunities, and tools to build sustainable businesses."
      ),
    },
    {
      icon: Award,
      title: t("pages.home.qualityReliability", "Quality & Reliability"),
      description: t(
        "pages.home.qualityReliabilityDesc",
        "We focus on connecting users with dependable service providers who meet our quality standards, ensuring consistent and reliable service experiences."
      ),
    },
    {
      icon: Lightbulb,
      title: t("pages.home.simplicityAccessibility", "Simplicity & Accessibility"),
      description: t(
        "pages.home.simplicityAccessibilityDesc",
        "We strive to make service discovery easy and accessible for everyone through intuitive technology on both Web and Mobile App."
      ),
    },
    {
      icon: Scale,
      title: t("pages.home.integrityFairness", "Integrity & Fairness"),
      description: t(
        "pages.home.integrityFairnessDesc",
        "We operate with honesty, ethical practices, and fairness for users, service providers, and partners alike."
      ),
    },
    {
      icon: Cpu,
      title: t("pages.home.innovationTechnology", "Innovation Through Technology"),
      description: t(
        "pages.home.innovationTechnologyDesc",
        "We continuously improve our platform using technology to enhance convenience, efficiency, and service outcomes."
      ),
    },
    {
      icon: UsersRound,
      title: t("pages.home.communityGrowth", "Community & Growth"),
      description: t(
        "pages.home.communityGrowthDesc",
        "GharSansaar believes in building a strong service community where users and providers grow together, creating long-term value."
      ),
    },
  ];

  return (
    <section id="features" className="py-5 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">
            {t("pages.home.whyGharSansaarPlatform", "WHY GHARSANSAAR")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("pages.home.coreValuesTitle", "Core Values of")}{" "}
            <span className="text-blue-600">
              {t("pages.home.gharSansaar", "GharSansaar")}
            </span>
          </h2>
          <p className="text-gray-600">
            {t(
              "pages.home.coreValuesDescription",
              "Our values guide every decision we make and every service we provide."
            )}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {coreValues.map((value, index) => (
            <div
              key={index}
              className="group p-5 rounded-xl bg-white border border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-lg bg-blue-600 flex items-center justify-center mb-3">
                <value.icon className="text-white w-5 h-5" />
              </div>

              <h3 className="text-base font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {value.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-700 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            {t(
              "pages.home.readyToExperience",
              "Ready to experience the difference? Get started today!"
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
