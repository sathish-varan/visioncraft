import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigation } from "@/components/ui/navigation";
import { MobileNav } from "@/components/ui/mobile-nav";
import { RescueItemCard } from "@/components/rescue-item-card";
import { Plus, Heart, Filter, TrendingDown, Users, Leaf, Clock } from "lucide-react";

const createRescueItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["prepared", "raw"], { required_error: "Type is required" }),
  quantity: z.string().min(1, "Quantity is required"),
  originalPrice: z.string().min(1, "Original price is required"),
  rescuePrice: z.string().min(1, "Rescue price is required"),
  isHot: z.boolean().default(false),
});

type CreateRescueItemForm = z.infer<typeof createRescueItemSchema>;

export default function Rescue() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'prepared' | 'raw'>('all');

  const form = useForm<CreateRescueItemForm>({
    resolver: zodResolver(createRescueItemSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "prepared",
      quantity: "",
      originalPrice: "",
      rescuePrice: "",
      isHot: false,
    },
  });

  // Fetch rescue items
  const { data: rescueItems = [], isLoading, refetch } = useQuery({
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

  // Create rescue item mutation
  const createRescueItem = useMutation({
    mutationFn: async (data: CreateRescueItemForm) => {
      return apiRequest('POST', '/api/rescue', {
        ...data,
        city: user?.city,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rescue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-profile'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Food Listed Successfully!",
        description: "Your item has been added to the rescue marketplace.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to list item",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Claim rescue item mutation
  const claimRescueItem = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest('POST', `/api/rescue/${itemId}/claim`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rescue'] });
      toast({
        title: "Item Claimed!",
        description: "Please contact the vendor for pickup details.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to claim item",
        description: "This item may no longer be available.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateRescueItemForm) => {
    createRescueItem.mutate(data);
  };

  const handleClaimItem = (itemId: string) => {
    claimRescueItem.mutate(itemId);
  };

  const filteredItems = rescueItems.filter((item: any) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const preparedItems = rescueItems.filter((item: any) => item.type === 'prepared');
  const rawItems = rescueItems.filter((item: any) => item.type === 'raw');

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Rescue Marketplace</h1>
            <p className="text-gray-600">Reduce waste by sharing excess food with the community</p>
          </div>
          
          {user.role === 'vendor' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 sm:mt-0 bg-secondary hover:bg-secondary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  List Food
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>List Food for Rescue</DialogTitle>
                  <DialogDescription>
                    Help reduce waste by sharing your excess food
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Fresh Samosas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="4 pieces, just made. Potato filling with mint chutney included."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="prepared">Prepared Food</SelectItem>
                              <SelectItem value="raw">Raw Ingredient</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input placeholder="4 pieces" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="60" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rescuePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rescue Price (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="40" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="isHot"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Hot & Fresh
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Mark if the food is still hot and freshly prepared
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createRescueItem.isPending}
                        className="flex-1"
                      >
                        {createRescueItem.isPending ? 'Listing...' : 'List Item'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card className="card-hover">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{rescueItems.length}</div>
              <p className="text-sm text-gray-600">Items Available</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-gray-900">34%</div>
              <p className="text-sm text-gray-600">Waste Reduced</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-gray-900">156</div>
              <p className="text-sm text-gray-600">Vendors Participating</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">₹8,240</div>
              <p className="text-sm text-gray-600">Community Savings</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="all">All Items ({rescueItems.length})</TabsTrigger>
              <TabsTrigger value="prepared">Prepared ({preparedItems.length})</TabsTrigger>
              <TabsTrigger value="raw">Raw ({rawItems.length})</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline" size="sm" className="mt-4 sm:mt-0">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Rescue Items Grid */}
        <section className="mb-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {filterType === 'all' ? 'No Items Available' : `No ${filterType} items available`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {user.role === 'vendor' 
                    ? 'List your excess food to help reduce waste and earn extra income!'
                    : 'Check back soon for fresh food from local vendors!'
                  }
                </p>
                {user.role === 'vendor' && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    List Food Item
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item: any, index: number) => (
                <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <RescueItemCard 
                    item={item} 
                    onClaim={user.role === 'buyer' ? handleClaimItem : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Impact Section */}
        <section className="mb-8">
          <Card className="gradient-mesh text-white">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Our Collective Impact</h2>
                <p className="text-primary-100">Together, we're making a difference in reducing food waste</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold mb-2">2,450kg</div>
                  <p className="text-sm text-primary-100">Food waste prevented this month</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold mb-2">890</div>
                  <p className="text-sm text-primary-100">Families fed through rescue program</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingDown className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold mb-2">45%</div>
                  <p className="text-sm text-primary-100">Average waste reduction for participating vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tips Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Food Rescue Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">For Vendors</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• List items 2-3 hours before closing time</li>
                  <li>• Price items 30-40% below original cost</li>
                  <li>• Mark hot items to attract immediate buyers</li>
                  <li>• Include pickup instructions in description</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg">For Buyers</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Check hot items first for best freshness</li>
                  <li>• Contact vendors for pickup timing</li>
                  <li>• Leave reviews to build vendor trust</li>
                  <li>• Share great finds with your community</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
