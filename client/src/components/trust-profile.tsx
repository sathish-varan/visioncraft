import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Star } from "lucide-react";
import { VendorProfile, Review } from "@shared/schema";

interface TrustProfileProps {
  profile: VendorProfile;
  reviews: Review[];
}

export function TrustProfile({ profile, reviews }: TrustProfileProps) {
  const trustConditions = [
    { key: 'usedAiPrediction', label: 'Used AI prediction today', completed: profile.usedAiPrediction },
    { key: 'participatedGroupBuy', label: 'Participated in group buy', completed: profile.participatedGroupBuy },
    { key: 'postedRescueItem', label: 'Posted food rescue item', completed: profile.postedRescueItem },
  ];

  const completedConditions = trustConditions.filter(c => c.completed).length;
  const progressPercentage = (completedConditions / trustConditions.length) * 100;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Your Trust Profile</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-slow"></div>
            <span className="text-sm text-green-600 font-medium">
              {profile.hasTrustBadge ? 'Trusted Vendor' : 'Building Trust'}
            </span>
          </div>
        </div>
        
        {/* Trust Badge Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Seal of Trust Progress</h4>
            <span className="text-sm text-gray-600">
              {completedConditions}/{trustConditions.length} conditions met
            </span>
          </div>
          
          <Progress value={progressPercentage} className="mb-4" />
          
          <div className="space-y-3">
            {trustConditions.map((condition) => (
              <div key={condition.key} className="flex items-center space-x-3">
                {condition.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300" />
                )}
                <span className={`text-sm ${condition.completed ? 'text-gray-700' : 'text-gray-600'}`}>
                  {condition.label}
                </span>
              </div>
            ))}
          </div>
          
          {!profile.hasTrustBadge && completedConditions < trustConditions.length && (
            <div className="mt-4 p-4 bg-primary-50 rounded-xl">
              <p className="text-sm text-primary-700">
                <strong>
                  {completedConditions === 2 ? 'One more step!' : `${3 - completedConditions} more steps!`}
                </strong>
                {' '}Complete all conditions to unlock your Trust Badge and gain buyer credibility.
              </p>
            </div>
          )}
          
          {profile.hasTrustBadge && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-green-700">
                🎉 <strong>Congratulations!</strong> You've earned the Seal of Trust. Buyers will see this badge on your profile.
              </p>
            </div>
          )}
        </div>
        
        {/* Customer Reviews */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Recent Reviews</h4>
          
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews yet. Complete your first food rescue to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 2).map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Customer</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
