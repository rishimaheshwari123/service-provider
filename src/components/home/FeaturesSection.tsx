import {
  Zap,
  Shield,
  Rocket,
  HeadphonesIcon,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Zap,
      title: t("pages.home.instantHiring", "Instant Hiring"),
      description: t(
        "pages.home.instantHiringDesc",
        "Post your requirement and receive competitive proposals from qualified experts within just a few hours."
      ),
    },
    {
      icon: Shield,
      title: t("pages.home.secureEscrow", "Secure Escrow"),
      description: t(
        "pages.home.secureEscrowDesc",
        "Payments are held securely in escrow and released only upon your complete satisfaction with the delivered work."
      ),
    },
    {
      icon: Rocket,
      title: t("pages.home.highQualityOutput", "High Quality Output"),
      description: t(
        "pages.home.highQualityOutputDesc",
        "Work exclusively with pre-vetted professionals who have verifiable records of delivering excellent results."
      ),
    },
    {
      icon: HeadphonesIcon,
      title: t("pages.home.expertSupport", "24/7 Expert Support"),
      description: t(
        "pages.home.expertSupportDesc",
        "Our dedicated support team is available around the clock to assist you with any queries or concerns."
      ),
    },
    {
      icon: TrendingUp,
      title: t("pages.home.transparentPricing", "Transparent Pricing"),
      description: t(
        "pages.home.transparentPricingDesc",
        "No hidden fees or surprises. Get clear, upfront pricing for all services before you commit."
      ),
    },
    {
      icon: Clock,
      title: t("pages.home.timeSavings", "Maximized Time Savings"),
      description: t(
        "pages.home.timeSavingsDesc",
        "Save valuable time with our streamlined process that connects you with the right professionals quickly."
      ),
    },
  ];

  return (
    <section id="features" className="py-5 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">
            {t("pages.home.whyHireOnPlatform", "WHY HIRE ON OUR PLATFORM")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("pages.home.unlockBenefits", "Unlock Key")}{" "}
            <span className="text-blue-600">
              {t("pages.home.benefits", "Benefits")}
            </span>
          </h2>
          <p className="text-gray-600">
            {t(
              "pages.home.platformDescription",
              "We provide all the tools and assurance needed to find, hire, and manage top-tier talent effortlessly."
            )}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
                <feature.icon className="text-white w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
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
