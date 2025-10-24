import successStory1 from "@/assets/success-story-1.jpg";
import successStory2 from "@/assets/success-story-2.jpg";
import successStory3 from "@/assets/success-story-3.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

const SuccessStories = () => {
  const stories = [
    {
      title: "TechCorp's Digital Transformation",
      description:
        "Helped TechCorp achieve 300% growth through strategic digital transformation and process automation.",
      metric: "300% Growth",
      image: successStory1,
    },
    {
      title: "Data-Driven Success",
      description:
        "Implemented advanced analytics solutions that increased operational efficiency by 150%.",
      metric: "150% Efficiency",
      image: successStory2,
    },
    {
      title: "Innovation Partnership",
      description:
        "Collaborated with StartupHub to develop cutting-edge solutions that revolutionized their industry.",
      metric: "5x ROI",
      image: successStory3,
    },
  ];

  return (
    <section className="pb-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Success <span className="gradient-text">Stories</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Real results from real businesses we've helped transform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stories.map((story, index) => (
            <div
              key={index}
              className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-elegant animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-primary/90 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-primary-foreground font-semibold">
                    <TrendingUp size={16} />
                    <span>{story.metric}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold">{story.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {story.description}
                </p>
                <Button variant="ghost" className="w-full group/btn">
                  Read Case Study
                  <ArrowRight
                    className="ml-2 group-hover/btn:translate-x-1 transition-transform"
                    size={16}
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="hero" size="lg">
            View All Success Stories
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
