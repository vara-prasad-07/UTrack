import React from 'react';
import { MessageCircle, TrendingUp, Receipt, Lock } from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: "AI-Powered Chat",
    subtitle: "Intelligent Assistant",
    description: "Get answers about your finances and security with natural language processing. Ask questions in plain English and receive personalized AI-driven financial advice.",
    details: [
      "Natural Language Processing - Ask questions in plain English",
      "Personalized Recommendations - AI-driven financial advice",
      "Intelligent Assistant - Get answers about your finances and security"
    ],
    gradient: "from-blue-500 to-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Progress Monitoring",
    subtitle: "Goal Setting & Tracking",
    description: "Define and track personal financial goals with beautiful visualization. Get smart alerts and comprehensive reports for better financial management.",
    details: [
      "Goal Setting - Define and track personal financial goals",
      "Progress Visualization - Beautiful charts and progress indicators",
      "Alerts & Notifications - Smart alerts for spending patterns",
      "Detailed Reports - Comprehensive spending and security reports"
    ],
    gradient: "from-green-500 to-teal-600"
  },
  {
    icon: Receipt,
    title: "Smart Expense Tracking",
    subtitle: "AI-Powered Analytics",
    description: "Advanced receipt scanning with AI-powered categorization. Real-time analytics and automated budget management with machine learning insights.",
    details: [
      "Receipt Scanning - AI-powered receipt scanning and categorization",
      "Real-time Analytics - Interactive charts and spending insights",
      "Budget Management - Set and track spending limits",
      "Automated Categorization - Machine learning-powered expense sorting"
    ],
    gradient: "from-orange-500 to-red-600"
  },
  {
    icon: Lock,
    title: "Privacy Protection",
    subtitle: "Enterprise Security",
    description: "Your personal information is protected with industry-standard privacy measures and secure protocols. Military-grade encryption keeps your data safe.",
    details: [
      "Industry-standard privacy measures",
      "Secure protocols and encryption",
      "Data protection compliance",
      "Zero-knowledge architecture"
    ],
    gradient: "from-indigo-500 to-purple-600"
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm mb-6">
            <span className="text-xs font-light uppercase tracking-[0.08em] text-white/70">Features</span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span className="text-sm font-light tracking-tight text-white/80">AI-Powered Financial Platform</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extralight leading-tight tracking-tight text-white mb-6">
            Intelligent Finance
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Management
            </span>
          </h2>
          
          <p className="text-lg text-white/75 max-w-2xl mx-auto font-light leading-relaxed">
            Experience the future of personal finance with AI-powered insights, smart expense tracking, and comprehensive security features designed for the modern user.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <h4 className="text-lg font-medium text-blue-300 mb-4">
                    {feature.subtitle}
                  </h4>
                  <p className="text-white/80 leading-relaxed font-light text-sm mb-6 group-hover:text-white/90 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Feature Details */}
                  <ul className="space-y-3">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-3 text-white/70 text-sm">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
