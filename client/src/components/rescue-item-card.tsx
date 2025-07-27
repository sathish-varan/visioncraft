import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin } from "lucide-react";
import { RescueItem } from "@shared/schema";

interface RescueItemCardProps {
  item: RescueItem;
  onClaim?: (itemId: string) => void;
}

export function RescueItemCard({ item, onClaim }: RescueItemCardProps) {
  const discount = Math.round(((parseFloat(item.originalPrice) - parseFloat(item.rescuePrice)) / parseFloat(item.originalPrice)) * 100);
  const timeAgo = Math.floor((new Date().getTime() - new Date(item.createdAt || new Date()).getTime()) / (1000 * 60));
  
  const getTypeEmoji = (type: string, title: string) => {
    if (type === 'prepared') {
      if (title.toLowerCase().includes('samosa')) return '🥟';
      if (title.toLowerCase().includes('dal') || title.toLowerCase().includes('rice')) return '🍛';
      return '🍽️';
    }
    if (title.toLowerCase().includes('onion')) return '🧅';
    if (title.toLowerCase().includes('tomato')) return '🍅';
    return '🥬';
  };

  const handleClaim = () => {
    if (onClaim) {
      onClaim(item.id);
    }
  };

  return (
    <Card className="overflow-hidden card-hover">
      {/* Mock image placeholder */}
      <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{getTypeEmoji(item.type, item.title)}</span>
        </div>
        <div className="absolute top-4 left-4">
          <Badge 
            className={item.type === 'prepared' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}
          >
            {item.type === 'prepared' ? 'Available Now' : 'Raw Ingredient'}
          </Badge>
        </div>
        {item.isHot && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/90 text-gray-700">
              🔥 Hot
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
          <span className="text-sm text-gray-500">
            {timeAgo < 60 ? `${timeAgo} min ago` : `${Math.floor(timeAgo / 60)}h ago`}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">@vendor</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-600">{item.type === 'prepared' ? 'Price' : 'Price per unit'}</p>
            <p className="font-semibold text-lg text-primary">
              ₹{item.rescuePrice} 
              <span className="text-sm text-gray-400 line-through ml-1">₹{item.originalPrice}</span>
            </p>
            {discount > 0 && (
              <p className="text-xs text-green-600">{discount}% off</p>
            )}
          </div>
          <div>
            <p className="text-gray-600">Distance</p>
            <div className="flex items-center space-x-1 mt-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <p className="font-semibold text-lg text-gray-900">
                {(Math.random() * 2).toFixed(1)} km
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleClaim}
          className="w-full bg-primary hover:bg-primary/90"
          disabled={item.status !== 'available'}
        >
          {item.status === 'available' 
            ? (item.type === 'prepared' ? 'Claim for Pickup' : 'Contact Seller')
            : 'Already Claimed'
          }
        </Button>
      </CardContent>
    </Card>
  );
}
