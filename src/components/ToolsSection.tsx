import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Search, Image, ArrowRight } from "lucide-react";

export const ToolsSection = () => {
  const tools = [
    {
      icon: Video,
      title: "Video Spoofer",
      description: "Transform your videos with subtle modifications that bypass plagiarism detection while maintaining quality and message.",
      features: ["Metadata modification", "Frame alterations", "Audio adjustments", "Quality preservation"],
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Search,
      title: "Similarity Detector",
      description: "Analyze content similarity before posting. Check how likely your content is to be flagged as duplicate across platforms.",
      features: ["Cross-platform analysis", "Similarity scoring", "Detailed reports", "Batch processing"],
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: Image,
      title: "Image Spoofer",
      description: "Create unique variations of your images with intelligent modifications that maintain visual appeal and brand consistency.",
      features: ["Color adjustments", "Filter applications", "Watermark removal", "Format optimization"],
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Three Powerful Tools, One Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create unique content variations and avoid plagiarism detection.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <Card key={index} className="relative group hover:shadow-large transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${tool.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className={`h-8 w-8 ${tool.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">{tool.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {tool.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full ${tool.bgColor} mr-3`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button variant="tool" className="w-full group">
                  Try {tool.title}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};