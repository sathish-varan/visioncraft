import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Clock } from "lucide-react";
import { GroupBuy } from "@shared/schema";

interface GroupBuyCardProps {
  groupBuy: GroupBuy;
  onJoin?: (groupBuyId: string, quantity: number) => void;
}

export function GroupBuyCard({ groupBuy, onJoin }: GroupBuyCardProps) {
  const progress = (parseFloat(groupBuy.currentQuantity || "0") / parseFloat(groupBuy.targetQuantity || "1")) * 100;
  const remainingQuantity = parseFloat(groupBuy.targetQuantity || "1") - parseFloat(groupBuy.currentQuantity || "0");
  const isNearlyFull = progress >= 90;
  const timeLeft = new Date(groupBuy.deadline || new Date()).getTime() - new Date().getTime();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  
  const getIngredientEmoji = (ingredient: string) => {
    const emojiMap: { [key: string]: string } = {
      'onions': '🧅',
      'tomatoes': '🍅',
      'paneer': '🧀',
      'potatoes': '🥔',
      'garlic': '🧄',
      'ginger': '🫚',
    };
    return emojiMap[ingredient.toLowerCase()] || '🥬';
  };

  const handleJoin = () => {
    if (onJoin) {
      const quantity = Math.min(2.5, remainingQuantity); // Default join quantity
      onJoin(groupBuy.id, quantity);
    }
  };

  return (
    <Card className="overflow-hidden card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getIngredientEmoji(groupBuy.ingredient)}</span>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 capitalize">{groupBuy.ingredient}</h3>
              <p className="text-sm text-gray-500">Organized by vendor</p>
            </div>
          </div>
          <Badge 
            variant={isNearlyFull ? "destructive" : "default"}
            className={isNearlyFull ? "bg-accent text-white" : "bg-green-100 text-green-700"}
          >
            {isNearlyFull ? "Closing Soon" : "Active"}
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-gray-900">
                {groupBuy.currentQuantity}kg / {groupBuy.targetQuantity}kg
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-gray-500 mt-1">
              {remainingQuantity > 0 
                ? `${remainingQuantity.toFixed(1)}kg more needed to unlock wholesale price`
                : "Target reached! Ready for supplier"
              }
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Price per kg</p>
              <p className="font-semibold text-lg text-primary">
                ₹{groupBuy.pricePerKg} 
                <span className="text-sm text-gray-400 line-through ml-1">
                  ₹{groupBuy.originalPrice}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-600">Participants</p>
              <div className="flex items-center space-x-1 mt-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {groupBuy.participantCount} vendors
                </span>
              </div>
            </div>
          </div>
          
          {hoursLeft > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{hoursLeft}h remaining</span>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleJoin}
              className={`flex-1 ${isNearlyFull ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary/90'}`}
              disabled={remainingQuantity <= 0}
            >
              {remainingQuantity <= 0 ? 'Full' : `Join (₹${(parseFloat(groupBuy.pricePerKg) * 2.5).toFixed(0)} for 2.5kg)`}
            </Button>
            <Button variant="outline">
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
