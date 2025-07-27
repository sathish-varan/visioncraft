import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigation } from "@/components/ui/navigation";
import { MobileNav } from "@/components/ui/mobile-nav";
import { GroupBuyCard } from "@/components/group-buy-card";
import { Plus, Users, Clock, TrendingUp, DollarSign } from "lucide-react";

const createGroupBuySchema = z.object({
  ingredient: z.string().min(1, "Ingredient is required"),
  targetQuantity: z.string().min(1, "Target quantity is required"),
  pricePerKg: z.string().min(1, "Price per kg is required"),
  originalPrice: z.string().min(1, "Original price is required"),
  deadline: z.string().min(1, "Deadline is required"),
});

type CreateGroupBuyForm = z.infer<typeof createGroupBuySchema>;

export default function GroupBuy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<CreateGroupBuyForm>({
    resolver: zodResolver(createGroupBuySchema),
    defaultValues: {
      ingredient: "",
      targetQuantity: "",
      pricePerKg: "",
      originalPrice: "",
      deadline: "",
    },
  });

  // Fetch group buys
  const { data: groupBuys = [], isLoading, refetch } = useQuery({
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

  // Create group buy mutation
  const createGroupBuy = useMutation({
    mutationFn: async (data: CreateGroupBuyForm) => {
      const deadline = new Date(data.deadline);
      return apiRequest('POST', '/api/groupbuy', {
        ...data,
        targetQuantity: data.targetQuantity,
        pricePerKg: data.pricePerKg,
        originalPrice: data.originalPrice,
        deadline: deadline.toISOString(),
        city: user?.city,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groupbuy'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-profile'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Group Buy Created!",
        description: "Your group purchase has been started successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create group buy",
        description: "Please try again later.",
        variant: "destructive",
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
    onError: () => {
      toast({
        title: "Failed to join group buy",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateGroupBuyForm) => {
    createGroupBuy.mutate(data);
  };

  const handleJoinGroupBuy = (groupBuyId: string, quantity: number) => {
    joinGroupBuy.mutate({ groupBuyId, quantity });
  };

  const commonIngredients = [
    "onions", "tomatoes", "potatoes", "paneer", "garlic", "ginger", 
    "green chilies", "coriander", "mint", "rice", "wheat flour", "oil"
  ];

  const activeGroupBuys = groupBuys.filter((gb: any) => gb.status === 'active');
  const completedGroupBuys = groupBuys.filter((gb: any) => gb.status === 'completed');

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Group Buying</h1>
            <p className="text-gray-600">Collaborate with nearby vendors to unlock wholesale prices</p>
          </div>
          
          {user.role === 'vendor' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 sm:mt-0 bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Group Buy
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Group Buy</DialogTitle>
                  <DialogDescription>
                    Create a group purchase to get better prices on ingredients
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ingredient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingredient</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ingredient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {commonIngredients.map((ingredient) => (
                                <SelectItem key={ingredient} value={ingredient}>
                                  {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="targetQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Quantity (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="25" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pricePerKg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group Price (₹/kg)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="28" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Market Price (₹/kg)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="35" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              min={new Date().toISOString().slice(0, 16)}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
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
                        disabled={createGroupBuy.isPending}
                        className="flex-1"
                      >
                        {createGroupBuy.isPending ? 'Creating...' : 'Create Group Buy'}
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
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{activeGroupBuys.length}</div>
              <p className="text-sm text-gray-600">Active Group Buys</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{completedGroupBuys.length}</div>
              <p className="text-sm text-gray-600">Completed This Week</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-gray-900">23%</div>
              <p className="text-sm text-gray-600">Average Savings</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">₹1,240</div>
              <p className="text-sm text-gray-600">Total Saved</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Group Buys */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Group Buys</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-40 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeGroupBuys.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Group Buys</h3>
                <p className="text-gray-600 mb-6">Be the first to start a group purchase in your area!</p>
                {user.role === 'vendor' && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    Start Group Buy
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeGroupBuys.map((groupBuy: any) => (
                <GroupBuyCard 
                  key={groupBuy.id} 
                  groupBuy={groupBuy} 
                  onJoin={handleJoinGroupBuy}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed Group Buys */}
        {completedGroupBuys.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Completed</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedGroupBuys.slice(0, 4).map((groupBuy: any) => (
                <Card key={groupBuy.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {groupBuy.ingredient === 'onions' ? '🧅' : 
                           groupBuy.ingredient === 'tomatoes' ? '🍅' : 
                           groupBuy.ingredient === 'paneer' ? '🧀' : '🥬'}
                        </span>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 capitalize">
                            {groupBuy.ingredient}
                          </h3>
                          <p className="text-sm text-gray-500">Completed group buy</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        Completed
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Final quantity</span>
                        <span className="font-semibold">{groupBuy.currentQuantity}kg</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Savings achieved</span>
                        <span className="font-semibold text-green-600">
                          ₹{((parseFloat(groupBuy.originalPrice) - parseFloat(groupBuy.pricePerKg)) * parseFloat(groupBuy.currentQuantity)).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="mb-8">
          <Card className="gradient-mesh text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">How Group Buying Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Start or Join</h3>
                  <p className="text-sm text-primary-100">
                    Create a group buy for ingredients you need or join existing ones in your area
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Reach Target</h3>
                  <p className="text-sm text-primary-100">
                    Wait for enough vendors to join and reach the minimum quantity for wholesale pricing
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Save Money</h3>
                  <p className="text-sm text-primary-100">
                    Purchase at discounted wholesale rates and save significantly on your ingredient costs
                  </p>
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
