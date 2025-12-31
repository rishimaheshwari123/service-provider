import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const TestimonialsSection = () => {
  const { t } = useTranslation();
  
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechCorp",
      content: t('pages.home.testimonial1'),
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Founder, StartupHub",
      content: t('pages.home.testimonial2'),
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director, GlobalBrand",
      content: t('pages.home.testimonial3'),
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('pages.home.whatOurClients')} <span className="gradient-text">{t('pages.home.clientsSay')}</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('pages.home.hearFromBusinesses')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elegant animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
              <div>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
