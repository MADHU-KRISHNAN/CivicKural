import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Shield, Zap } from "lucide-react";
import heroImage from "@/assets/hero-civic.jpg";

interface HeroProps {
  onNavigate: (page: string) => void;
}

export const Hero = ({ onNavigate }: HeroProps) => {
  return (
    <section className="relative bg-gradient-subtle overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Modern civic building representing government services"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-light rounded-full px-4 py-2 mb-8">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Samvad - Civic Reporting</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Report Civic Issues
            <span className="bg-gradient-hero bg-clip-text text-transparent block">
              Build Better Communities
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Connect directly with your local government. Report issues, track progress, 
            and help create positive change in your community with fast, mobile-first reporting.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => onNavigate("login")}
              className="text-lg"
            >
              Report an Issue
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => onNavigate("login")}
              className="text-lg"
            >
              Government Login
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <div className="bg-card rounded-xl p-6 shadow-md border border-border">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Fast Reporting</h3>
              <p className="text-muted-foreground">
                Submit issues with photo, description, and GPS location in under 2 minutes.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md border border-border">
              <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                Automatic categorization and priority scoring for efficient government response.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md border border-border sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Real-Time Updates</h3>
              <p className="text-muted-foreground">
                Track your reports and get notified when government staff take action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};