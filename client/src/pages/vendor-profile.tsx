import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigation } from "@/components/ui/navigation";
import { MobileNav } from "@/components/ui/mobile-nav";
import { TrustProfile } from "@/components/trust-profile";
import { 
  CheckCircle, 
  Circle, 
  Star, 
  TrendingUp, 
  DollarSign, 
  Leaf, 
  Users,
  BarChart3,
  Award,
  Target,
  Calendar
} from "lucide-react";

const updateProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  sourcingMethod: z.string().optional(),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export default function VendorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch vendor profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/vendor-profile'],
    enabled: !!user,
  });

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      businessName: profileData?.profile?.businessName || "",
      sourcingMethod: profileData?.profile?.sourcingMethod || "",
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileForm) => {
      return apiRequest('PUT', '/api/vendor-profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-profile'] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your vendor profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateProfileForm) => {
    updateProfile.mutate(data);
  };

  // Update form when data loads
  React.useEffect(() => {
    if (profileData?.profile) {
      form.reset({
        businessName: profileData.profile.businessName,
        sourcingMethod: profileData.profile.sourcingMethod || "",
      });
    }
  }, [profileData, form]);

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const profile = profileData?.profile;
  const reviews = profileData?.reviews || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Profile</h1>
            <p className="text-gray-600">Manage your business profile and build trust with customers</p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {profile?.hasTrustBadge && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Award className="w-4 h-4 mr-1" />
                Trusted Vendor
              </Badge>
            )}
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Kitchen Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sourcingMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sourcing Method</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe how you source your ingredients (e.g., local farmers, wholesale markets, organic suppliers)"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateProfile.isPending}
                          className="flex-1"
                        >
                          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Business Name</Label>
                      <p className="text-lg font-semibold text-gray-900">
                        {profile?.businessName || 'Not set'}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <p className="text-lg font-semibold text-gray-900">{user.city}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {profile?.sourcingMethod && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Sourcing Method</Label>
                        <p className="text-gray-900 mt-1">{profile.sourcingMethod}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {user.rating === "0.0" ? "New" : user.rating}
                    </div>
                    <p className="text-xs text-gray-600">
                      {user.reviewCount === 0 ? "No reviews yet" : `${user.reviewCount} reviews`}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-secondary-50 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="text-2xl font-bold text-secondary">
                      {profile?.trustScore || 0}
                    </div>
                    <p className="text-xs text-gray-600">Trust Score</p>
                  </div>
                  
                  <div className="text-center p-4 bg-accent-50 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div className="text-2xl font-bold text-accent">24</div>
                    <p className="text-xs text-gray-600">Group Buys Joined</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">18</div>
                    <p className="text-xs text-gray-600">Items Rescued</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Summary */}
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>This Month's Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">Money Saved</span>
                    </div>
                    <span className="font-bold text-green-600">₹1,890</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">Waste Reduced</span>
                    </div>
                    <span className="font-bold text-green-600">12.5kg</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <span className="text-sm text-gray-600">AI Predictions Used</span>
                    </div>
                    <span className="font-bold text-primary">18 days</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-secondary" />
                      <span className="text-sm text-gray-600">Group Buys Participated</span>
                    </div>
                    <span className="font-bold text-secondary">7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Profile */}
          <div className="space-y-6">
            {profile && (
              <TrustProfile profile={profile} reviews={reviews} />
            )}

            {/* Recent Activity */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-xl">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Generated AI prediction</p>
                      <p className="text-xs text-gray-500">Today, 9:30 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-xl">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Joined tomatoes group buy</p>
                      <p className="text-xs text-gray-500">Yesterday, 2:15 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Listed samosas for rescue</p>
                      <p className="text-xs text-gray-500">2 days ago, 6:45 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-accent-50 rounded-xl">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Received 5-star review</p>
                      <p className="text-xs text-gray-500">3 days ago, 4:20 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals & Achievements */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Goals & Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Weekly Waste Reduction Goal</span>
                      <span className="text-sm text-gray-600">73%</span>
                    </div>
                    <Progress value={73} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Target: Reduce waste by 20% this week</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Group Buy Participation</span>
                      <span className="text-sm text-gray-600">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-green-600 mt-1">🎉 Goal achieved! Participated in 5 group buys</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">AI Prediction Usage</span>
                      <span className="text-sm text-gray-600">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Target: Use AI predictions 20 days this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
