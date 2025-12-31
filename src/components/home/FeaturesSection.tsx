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

// **NOTE:** Ensure your project has the 'gradient-text' and relevant animation classes defined.

const FeaturesSection = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Zap,
      title: t('pages.home.instantHiring'),
      description: t('pages.home.instantHiringDesc'),
    },
    {
      icon: Shield,
      title: t('pages.home.secureEscrow'),
      description: t('pages.home.secureEscrowDesc'),
    },
    {
      icon: Rocket,
      title: t('pages.home.highQualityOutput'),
      description: t('pages.home.highQualityOutputDesc'),
    },
    {
      icon: HeadphonesIcon,
      title: t('pages.home.expertSupport'),
      description: t('pages.home.expertSupportDesc'),
    },
    {
      icon: TrendingUp,
      title: t('pages.home.transparentPricing'),
      description: t('pages.home.transparentPricingDesc'),
    },
    {
      icon: Clock,
      title: t('pages.home.timeSavings'),
      description: t('pages.home.timeSavingsDesc'),
    },
  ];

  return (
    // Increased padding for better visual separation
    <section id="features" className="py-5 md:py-5 ">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
            {t('pages.home.whyHireOnPlatform')}
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('pages.home.unlockBenefits')} <span className="gradient-text">{t('pages.home.benefits')}</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('pages.home.platformDescription')}
          </p>
        </div>

        {/* Features Grid - 3-Column Layout with Advanced Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              // Card Styling: Clean, prominent shadow, and lift on hover
              className="group p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-500 shadow-xl shadow-gray-200/50 dark:shadow-black/20 transform hover:-translate-y-2 hover:border-primary animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon Container: Vibrant, primary color background with subtle shadow */}
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/30 transition-transform duration-500 group-hover:scale-105">
                <feature.icon className="text-white" size={28} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Optional: Add a subtle CTA at the bottom */}
        <div className="mt-16 text-center">
             <p className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-3">
                 <CheckCircle className="w-6 h-6 text-green-500" />
                 {t('pages.home.readyToExperience')}
             </p>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;