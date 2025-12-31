import { Users, Award, Globe, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

const StatsSection = () => {
  const { t } = useTranslation();
  
  const stats = [
    {
      icon: Users,
      value: "1000+",
      label: t('pages.home.verifiedExperts'),
      description: t('pages.home.skilledProfessionals'),
    },
    {
      icon: Award,
      value: "95%",
      label: t('pages.home.clientSatisfaction'),
      description: t('pages.home.jobsCompleted'),
    },
    {
      icon: Globe,
      value: "2000+",
      label: t('pages.home.projectsCompleted'),
      description: t('pages.home.successfulCollaborations'),
    },
    {
      icon: Clock,
      value: "< 24hrs",
      label: t('pages.home.averageResponse'),
      description: t('pages.home.getProposalsFast'),
    },
  ];

  return (
    <section className="py-24  relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform">
                  <stat.icon className="text-primary-foreground" size={32} />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-primary-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-xl font-semibold text-primary-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-primary-foreground/80">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
