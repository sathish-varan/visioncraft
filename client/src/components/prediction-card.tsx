import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, CloudRain, Sun, Cloud, Snowflake, Thermometer } from "lucide-react";

interface Prediction {
  ingredient: string;
  suggestedQuantity: string;
  confidence: number;
  reasoning: string;
}

interface WeatherData {
  description: string;
  temperature: number;
  condition: string;
}

interface PredictionCardProps {
  predictions: Prediction[];
  weather: WeatherData;
  temperature: number;
  confidence: number;
}

export function PredictionCard({ predictions, weather, temperature, confidence }: PredictionCardProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'rainy':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'cloudy':
        return <Cloud className="w-5 h-5 text-gray-500" />;
      case 'stormy':
        return <Snowflake className="w-5 h-5 text-purple-500" />;
      default:
        return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getIngredientEmoji = (ingredient: string) => {
    const emojiMap: { [key: string]: string } = {
      'onions': '🧅',
      'tomatoes': '🍅',
      'potatoes': '🥔',
      'oil': '🛢️',
      'spices': '🌶️',
      'lemons': '🍋',
      'ginger': '🫚',
      'rice': '🍚',
      'flour': '🌾',
      'milk': '🥛',
    };
    return emojiMap[ingredient.toLowerCase().split(' ')[0]] || '🥬';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { variant: 'default' as const, label: 'High Confidence', class: 'bg-green-100 text-green-700' };
    if (confidence >= 0.6) return { variant: 'secondary' as const, label: 'Medium Confidence', class: 'bg-yellow-100 text-yellow-700' };
    return { variant: 'destructive' as const, label: 'Low Confidence', class: 'bg-red-100 text-red-700' };
  };

  return (
    <section className="mb-8 animate-fade-in">
      <Card className="relative overflow-hidden">
        {/* Header with Weather */}
        <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">AI Smart Predictions</CardTitle>
              <p className="text-blue-100 mt-1">Today's ingredient recommendations</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                {getWeatherIcon(weather?.condition)}
                <Thermometer className="w-4 h-4" />
                <span className="text-lg font-semibold">{temperature || weather?.temperature}°C</span>
              </div>
              <p className="text-sm text-blue-100">{weather?.description}</p>
            </div>
          </div>
          
          {/* Overall Confidence */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Overall Prediction Confidence</span>
              <Badge className={getConfidenceBadge(confidence).class}>
                {getConfidenceBadge(confidence).label}
              </Badge>
            </div>
            <Progress value={confidence * 100} className="h-2 bg-white/20" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Predictions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions?.map((prediction, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getIngredientEmoji(prediction.ingredient)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg capitalize">{prediction.ingredient}</h4>
                      <p className="text-sm text-gray-500">Suggested Amount</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{prediction.suggestedQuantity}</span>
                      <Badge 
                        className={`${getConfidenceBadge(prediction.confidence).class} text-xs`}
                      >
                        {Math.round(prediction.confidence * 100)}%
                      </Badge>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {prediction.reasoning}
                        </p>
                      </div>
                    </div>
                    
                    <Progress 
                      value={prediction.confidence * 100} 
                      className="h-1.5"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Insights */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Market Insights</h4>
            </div>
            <p className="text-sm text-green-700">
              Based on current weather conditions and local demand patterns, these predictions are optimized for maximum profitability and minimal waste.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}