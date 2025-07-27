import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, TrendingUp, Users, Heart, Shield, BarChart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-mesh min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="w-8 h-8" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              DailyFresh Connect
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-slide-up">
              Empowering Indian street food vendors with AI predictions, collaborative purchasing, and sustainable practices
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link href="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg">
                  Get Started as Vendor
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg">
                  Browse as Buyer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Revolutionizing Street Food Commerce</h2>
            <p className="text-xl text-gray-600">Advanced features for modern vendors and conscious buyers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Predictions</h3>
                <p className="text-gray-600">Get smart ingredient recommendations based on weather patterns, historical sales, and market trends.</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Collaborative Group Buying</h3>
                <p className="text-gray-600">Pool purchases with nearby vendors to unlock wholesale prices and reduce costs.</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Food Rescue Marketplace</h3>
                <p className="text-gray-600">Reduce waste by selling excess ingredients and prepared food at discounted prices.</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Trust Profile System</h3>
                <p className="text-gray-600">Build credibility with verified trust badges and transparent customer reviews.</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Analytics</h3>
                <p className="text-gray-600">Track sales performance, waste reduction, and cost savings with detailed insights.</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Mobile-First Design</h3>
                <p className="text-gray-600">Optimized for mobile usage with intuitive interface and smooth interactions.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Food Business?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of vendors already reducing waste and increasing profits</p>
          
          <Link href="/login">
            <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg">
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
