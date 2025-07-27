import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Clock, Bell } from "lucide-react";

interface RealTimeMetrics {
  activeGroupBuys: number;
  totalSavings: number;
  rescueItemsClaimed: number;
  vendorsOnline: number;
}

export function RealTimeDashboard() {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeGroupBuys: 12,
    totalSavings: 2450,
    rescueItemsClaimed: 8,
    vendorsOnline: 156
  });

  const [notifications, setNotifications] = useState([
    { id: 1, message: "Group buy for onions reaching target!", type: "success" },
    { id: 2, message: "3 new rescue items in your area", type: "info" },
    { id: 3, message: "Weather update affecting predictions", type: "warning" }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalSavings: prev.totalSavings + Math.floor(Math.random() * 100),
        vendorsOnline: prev.vendorsOnline + Math.floor(Math.random() * 10 - 5),
        rescueItemsClaimed: prev.rescueItemsClaimed + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Real-time Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Live Updates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg text-sm ${
                  notification.type === 'success' ? 'bg-green-50 text-green-700' :
                  notification.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-blue-50 text-blue-700'
                }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{metrics.activeGroupBuys}</p>
                <p className="text-xs text-gray-500">Active Group Buys</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">₹{metrics.totalSavings}</p>
                <p className="text-xs text-gray-500">Total Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{metrics.rescueItemsClaimed}</p>
                <p className="text-xs text-gray-500">Items Rescued</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{metrics.vendorsOnline}</p>
                <p className="text-xs text-gray-500">Vendors Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Market Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Onions Demand</span>
                <Badge className="bg-green-100 text-green-700">High</Badge>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tomatoes Demand</span>
                <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Rice Demand</span>
                <Badge className="bg-red-100 text-red-700">Low</Badge>
              </div>
              <Progress value={30} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}