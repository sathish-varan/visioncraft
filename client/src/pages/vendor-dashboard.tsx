import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/ui/navigation";
import { MobileNav } from "@/components/ui/mobile-nav";
import { PredictionCard } from "@/components/prediction-card";
import { GroupBuyCard } from "@/components/group-buy-card";
import { RescueItemCard } from "@/components/rescue-item-card";
import { TrustProfile } from "@/components/trust-profile";
import { Users, Heart, BarChart3, TrendingUp, DollarSign, Leaf } from "lucide-react";
import { Link } from "wouter";

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch latest prediction
  const { data: prediction, isLoading: predictionLoading } = useQuery({
    queryKey: ['/api/predict/latest'],
    enabled: !!user,
  });

  // Fetch group buys
  const { data: groupBuys = [], isLoading: groupBuysLoading } = useQuery({
    queryKey: ['/api/groupbuy'],
    queryFn: async () => {
      const response = await fetch(`/api/groupbuy?city=${user?.city}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch group buys');
      return response.json();
    },
    enabled: !!user,
  });

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

  // Fetch vendor profile
  const { data: profileData } = useQuery({
    queryKey: ['/api/vendor-profile'],
    enabled: !!user,
  });

  // Generate prediction mutation
  const generatePrediction = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/predict', { city: user?.city });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/predict/latest'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-profile'] });
      toast({
        title: "AI Prediction Generated",
        description: "Your smart shopping list is ready!",
      });
    },
  });

  // Join group buy mutation
  const joinGroupBuy = useMutation({
    mutationFn: async ({ groupBuyId, quantity }: { groupBuyId: string; quantity: number }) => {
      return apiRequest('POST', `/api/groupbuy/${groupBuyId}/join`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groupbuy'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-profile'] });
      toast({
        title: "Joined Group Buy",
        description: "You've successfully joined the group purchase!",
      });
    },
  });

  const handleGeneratePrediction = () => {
    generatePrediction.mutate();
  };

  const handleJoinGroupBuy = (groupBuyId: string, quantity: number) => {
    joinGroupBuy.mutate({ groupBuyId, quantity });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        {/* AI Prediction Section */}
        {prediction && prediction.predictions ? (
          <PredictionCard 
            predictions={prediction.predictions}
            weather={prediction.weather}
            temperature={prediction.temperature}
            confidence={prediction.confidence}
          />
        ) : (
          <section className="mb-8 animate-fade-in">
            <Card className="relative overflow-hidden gradient-mesh p-8 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 text-center">
                <h2 className="text-2xl font-bold mb-4">Get Your AI-Powered Predictions</h2>
                <p className="text-primary-100 mb-6">
                  Generate smart ingredient recommendations based on weather and market trends
                </p>
                <Button 
                  onClick={handleGeneratePrediction}
                  disabled={generatePrediction.isPending}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  {generatePrediction.isPending ? 'Generating...' : 'Generate Smart Predictions'}
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/group-buy">
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Group Buy</h3>
                      <p className="text-sm text-gray-500">Join or start</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/rescue">
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Food Rescue</h3>
                      <p className="text-sm text-gray-500">Reduce waste</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-500">View insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Link href="/vendor/profile">
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Badge className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Trust Profile</h3>
                      <p className="text-sm text-gray-500">Build credibility</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Active Group Buys */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Active Group Buys</h2>
            <Link href="/group-buy">
              <Button className="bg-primary hover:bg-primary/90">
                Start New Buy
              </Button>
            </Link>
          </div>
          
          {groupBuysLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : groupBuys.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Group Buys</h3>
                <p className="text-gray-600 mb-4">Be the first to start a group purchase in your area!</p>
                <Link href="/group-buy">
                  <Button>Start Group Buy</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groupBuys.slice(0, 2).map((groupBuy: any) => (
                <GroupBuyCard 
                  key={groupBuy.id} 
                  groupBuy={groupBuy} 
                  onJoin={handleJoinGroupBuy}
                />
              ))}
            </div>
          )}
        </section>

        {/* Food Rescue & Trust Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Food Rescue Preview */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Food Rescue Marketplace</h2>
              <Link href="/rescue">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            
            {rescueLoading ? (
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ) : rescueItems.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rescue Items</h3>
                  <p className="text-gray-600 mb-4">List your excess food to help reduce waste!</p>
                  <Link href="/rescue">
                    <Button>List Food</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rescueItems.slice(0, 1).map((item: any) => (
                  <RescueItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Trust Profile */}
          <div>
            {profileData?.profile && (
              <TrustProfile 
                profile={profileData.profile} 
                reviews={profileData.reviews || []} 
              />
            )}
          </div>
        </div>

        {/* Analytics Preview */}
        <section className="mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Analytics</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-primary-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary-700">Sales</span>
                  </div>
                  <p className="text-2xl font-bold text-primary-900">₹12,450</p>
                  <p className="text-xs text-primary-600">+18% vs last week</p>
                </div>
                
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-secondary" />
                    <span className="text-sm font-medium text-secondary-700">Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">₹890</p>
                  <p className="text-xs text-secondary-600">Through group buys</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Waste Reduced</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">23%</p>
                  <p className="text-xs text-green-600">This week</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
