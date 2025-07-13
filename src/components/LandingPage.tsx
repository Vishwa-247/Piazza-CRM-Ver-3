import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-slate-700" />,
      title: "Smart Lead Management",
      description:
        "Organize and track leads with intelligent categorization and status management.",
    },
    {
      icon: <FileText className="h-8 w-8 text-slate-700" />,
      title: "AI Document Processing",
      description:
        "Extract lead information from PDFs and images using advanced OCR technology.",
    },
    {
      icon: <Target className="h-8 w-8 text-slate-700" />,
      title: "Workflow Automation",
      description:
        "Design custom workflows to automate lead processing and follow-ups.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-slate-700" />,
      title: "Analytics Dashboard",
      description:
        "Gain insights with comprehensive analytics and performance metrics.",
    },
    {
      icon: <Zap className="h-8 w-8 text-slate-700" />,
      title: "Real-time Interactions",
      description:
        "Engage with leads through intelligent chat-based interactions.",
    },
    {
      icon: <Shield className="h-8 w-8 text-slate-700" />,
      title: "Secure & Professional",
      description:
        "Enterprise-grade security with professional workflow management.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-slate-50"></div>
        <div className="relative px-6 lg:px-8">
          <div className="mx-auto max-w-7xl pt-20 pb-24 sm:pb-32">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="h-16 w-16 rounded-xl bg-slate-900 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">MC</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Professional CRM
                <span className="block text-slate-600">Made Simple</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
                Streamline your lead management with AI-powered document
                processing, intelligent workflows, and comprehensive analytics.
                Built for modern businesses.
              </p>
              <div className="mt-10 flex items-center justify-center">
                <Button
                  onClick={onGetStarted}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to manage leads
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Powerful features designed to help you convert more leads into
              customers
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-slate-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 p-3 bg-slate-100 rounded-lg">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Ready to transform your lead management?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Join thousands of businesses already using our platform
            </p>
            <div className="mt-8">
              <Button
                onClick={onGetStarted}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
