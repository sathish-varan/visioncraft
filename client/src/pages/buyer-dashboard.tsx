import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAuthToken } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/ui/navigation";
import { MobileNav } from "@/components/ui/mobile-nav";
import { RescueItemCard } from "@/components/rescue-item-card";
import { Heart, MapPin, Star, Filter } from "lucide-react";
import { Link } from "wouter";

export default function BuyerDashboard() {
  const { user } = useAuth();

  // Fetch rescue items
  const { data: rescueItems = [], isLoading: rescueLoading } = useQuery({
    queryKey: ['/api/rescue'],
    queryFn: async () => {
      const response = await fetch(`/api/rescue?city=${user?.city}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch rescue items');
      return response.json();
    },
    enabled: !!user,
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const featuredVendors = [
    { id: 1, name: "Raj's Kitchen", rating: 4.8, speciality: "North Indian", image: "🍛", reviews: 124 },
    { id: 2, name: "Priya's Foods", rating: 4.9, speciality: "South Indian", image: "🥘", reviews: 89 },
    { id: 3, name: "Street Delights", rating: 4.7, speciality: "Snacks", image: "🥟", reviews: 156 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        {/* Hero Section */}
        <section className="mb-8 animate-fade-in">
          <div className="relative overflow-hidden rounded-3xl gradient-mesh p-8 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-4">Welcome to DailyFresh Marketplace</h1>
              <p className="text-lg text-primary-100 mb-6">
                Discover fresh food from trusted local vendors and help reduce waste
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/rescue">
                  <Button className="bg-white text-primary hover:bg-white/90">
                    Browse Food Rescue
                  </Button>
                </Link>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Vendors Near Me
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🍛</div>
                <h3 className="text-2xl font-bold text-primary">{rescueItems.length}</h3>
                <p className="text-sm text-gray-600">Fresh items available now</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">👨‍🍳</div>
                <h3 className="text-2xl font-bold text-secondary">24</h3>
                <p className="text-sm text-gray-600">Trusted vendors nearby</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">💚</div>
                <h3 className="text-2xl font-bold text-green-600">₹2,450</h3>
                <p className="text-sm text-gray-600">Community savings this week</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Vendors */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Vendors</h2>
            <Button variant="outline">View All Vendors</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVendors.map((vendor) => (
              <Card key={vendor.id} className="card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-2xl">
                      {vendor.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-600">{vendor.speciality}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{vendor.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({vendor.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Trusted Vendor
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>0.8 km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Food Rescue Marketplace */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Fresh Food Available Now</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Link href="/rescue">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </div>
          
          {rescueLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : rescueItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Available</h3>
                <p className="text-gray-600">Check back soon for fresh food from local vendors!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rescueItems.slice(0, 6).map((item: any) => (
                <RescueItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Impact Section */}
        <section className="mb-8">
          <Card className="gradient-mesh text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Your Impact This Month</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold">₹650</div>
                  <p className="text-primary-100">Money Saved</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">12</div>
                  <p className="text-primary-100">Meals Rescued</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">3.2kg</div>
                  <p className="text-primary-100">Food Waste Prevented</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
