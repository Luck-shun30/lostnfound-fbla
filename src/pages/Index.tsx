import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/GlassCard";
import { Search, Upload, CheckCircle, Award } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: "Search Lost Items",
      description: "Browse through items found around campus with powerful search and filters",
    },
    {
      icon: Upload,
      title: "Report Found Items",
      description: "Easily submit items you've found with photos and detailed descriptions",
    },
    {
      icon: CheckCircle,
      title: "Claim Your Items",
      description: "Submit claims to retrieve your lost belongings quickly and securely",
    },
    {
      icon: Award,
      title: "Verified Process",
      description: "Admin-approved system ensures items reach their rightful owners",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <section className="text-center py-20 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            School Lost & Found
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connecting students with their lost belongings through our community-driven platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/items")}
              className="bg-gradient-primary hover:opacity-90 text-lg px-8"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse Items
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/submit")}
              className="text-lg px-8"
            >
              <Upload className="w-5 h-5 mr-2" />
              Report Found Item
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fade-in">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <GlassCard
                key={index}
                hover
                className="p-6 text-center animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <GlassCard className="p-12 text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
              Making a Difference
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  100+
                </div>
                <div className="text-muted-foreground">Items Reported</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">
                  85%
                </div>
                <div className="text-muted-foreground">Return Rate</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                  500+
                </div>
                <div className="text-muted-foreground">Happy Students</div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center animate-fade-in">
          <GlassCard className="p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lost Something?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your search now or help others find their belongings
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/items")}
                className="bg-gradient-primary hover:opacity-90"
              >
                Search Lost Items
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
              >
                Sign In / Sign Up
              </Button>
            </div>
          </GlassCard>
        </section>
      </main>

      <footer className="border-t border-glass-border bg-glass/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 School Lost & Found. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
