import { Users, Award, Globe, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

const StatsSection = () => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Users,
      value: "100+",
      label: t("pages.home.verifiedExperts", "Verified Experts"),
      description: t("pages.home.skilledProfessionals", "Skilled Professionals"),
    },
    {
      icon: Award,
      value: "100%",
      label: t("pages.home.clientSatisfaction", "Client Satisfaction"),
      description: t("pages.home.jobsCompleted", "Jobs Completed"),
    },
    {
      icon: Globe,
      value: t("pages.home.multple"),
      label: t("pages.home.projectsCompleted", "Projects Completed"),
      description: t("pages.home.successfulCollaborations", "Successful Collaborations"),
    },
    {
      icon: Clock,
      value: "< 24hrs",
      label: t("pages.home.averageResponse", "Average Response"),
      description: t("pages.home.getProposalsFast", "Get Proposals Fast"),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm md:text-base font-medium text-white/90 mb-1">
              {stat.label}
            </div>
            <div className="text-xs md:text-sm text-white/70">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
