import OpenAI from "openai";

// Initialize OpenAI with API key - use fallback if not available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
}) : null;

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  condition: string;
}

export interface PredictionRequest {
  city: string;
  vendorType: string;
  historicalSales?: number[];
  currentInventory?: string[];
}

export interface PredictionResult {
  predictions: Array<{
    ingredient: string;
    suggestedQuantity: string;
    confidence: number;
    reasoning: string;
  }>;
  weather: WeatherData;
  marketTrends: {
    demand: "high" | "medium" | "low";
    factors: string[];
  };
}

export class AIService {
  
  async getWeatherData(city: string): Promise<WeatherData> {
    try {
      if (!openai) {
        // Fallback weather data when OpenAI is not available
        return this.getFallbackWeatherData(city);
      }
      
      // Simulate weather API call with AI-generated realistic data
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a weather API service. Generate realistic current weather data for Indian cities. Respond with JSON in this format: { 'temperature': number, 'humidity': number, 'description': string, 'condition': string }"
          },
          {
            role: "user",
            content: `Generate current weather data for ${city}, India. Temperature should be in Celsius, humidity as percentage, description should be descriptive, and condition should be one of: sunny, cloudy, rainy, stormy.`
          }
        ],
        response_format: { type: "json_object" },
      });

      const weatherData = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        temperature: weatherData.temperature || 28,
        humidity: weatherData.humidity || 65,
        description: weatherData.description || "Partly cloudy",
        condition: weatherData.condition || "cloudy"
      };
    } catch (error) {
      console.log("Weather API error, using fallback:", error);
      // Fallback weather data
      return {
        temperature: 28,
        humidity: 65,
        description: "Partly cloudy",
        condition: "cloudy"
      };
    }
  }

  async generateIngredientPredictions(request: PredictionRequest): Promise<PredictionResult> {
    try {
      const weather = await this.getWeatherData(request.city);
      
      if (!openai) {
        // Return fallback predictions when OpenAI is not available
        return {
          predictions: this.getFallbackPredictions(request.vendorType, weather),
          weather,
          marketTrends: {
            demand: "medium",
            factors: ["Weather conditions", "Local preferences"]
          }
        };
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI expert for Indian street food vendors. Based on weather, location, and vendor type, predict ingredient quantities needed for the day. Consider:
            - Weather impact on customer preferences (hot weather = cold drinks, rainy = hot snacks)
            - Regional preferences for different cities
            - Typical ingredient usage patterns
            - Seasonal variations
            
            Respond with JSON in this format:
            {
              "predictions": [
                {
                  "ingredient": "ingredient name",
                  "suggestedQuantity": "quantity with unit",
                  "confidence": confidence_score_0_to_1,
                  "reasoning": "brief explanation"
                }
              ],
              "marketTrends": {
                "demand": "high|medium|low",
                "factors": ["factor1", "factor2"]
              }
            }`
          },
          {
            role: "user",
            content: `Generate ingredient predictions for:
            - City: ${request.city}
            - Vendor Type: ${request.vendorType}
            - Current Weather: ${weather.description}, ${weather.temperature}°C
            - Weather Condition: ${weather.condition}
            
            Predict 5-8 key ingredients with realistic quantities for a day's operation.`
          }
        ],
        response_format: { type: "json_object" },
      });

      const predictionData = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        predictions: predictionData.predictions || [],
        weather,
        marketTrends: predictionData.marketTrends || {
          demand: "medium",
          factors: ["Weather conditions", "Seasonal patterns"]
        }
      };
    } catch (error) {
      console.log("AI prediction error, using fallback:", error);
      
      // Fallback predictions based on weather and vendor type
      const weather = await this.getWeatherData(request.city);
      
      return {
        predictions: this.getFallbackPredictions(request.vendorType, weather),
        weather,
        marketTrends: {
          demand: "medium",
          factors: ["Weather conditions", "Local preferences"]
        }
      };
    }
  }

  private getFallbackPredictions(vendorType: string, weather: WeatherData) {
    const baseIngredients = [
      { ingredient: "Onions", suggestedQuantity: "5 kg", confidence: 0.8, reasoning: "Essential for most dishes" },
      { ingredient: "Tomatoes", suggestedQuantity: "3 kg", confidence: 0.7, reasoning: "High demand ingredient" },
      { ingredient: "Potatoes", suggestedQuantity: "4 kg", confidence: 0.9, reasoning: "Popular base ingredient" },
      { ingredient: "Oil", suggestedQuantity: "2 liters", confidence: 0.85, reasoning: "Cooking essential" },
      { ingredient: "Spices Mix", suggestedQuantity: "500g", confidence: 0.9, reasoning: "Flavor enhancement" }
    ];

    // Adjust quantities based on weather
    if (weather.temperature > 30) {
      baseIngredients.push({
        ingredient: "Lemons", 
        suggestedQuantity: "2 kg", 
        confidence: 0.8, 
        reasoning: "Hot weather increases demand for refreshing items"
      });
    }

    if (weather.condition === "rainy") {
      baseIngredients.push({
        ingredient: "Ginger", 
        suggestedQuantity: "300g", 
        confidence: 0.75, 
        reasoning: "Rainy weather increases demand for hot, spicy food"
      });
    }

    return baseIngredients;
  }

  async analyzeSentiment(text: string): Promise<{
    rating: number;
    confidence: number;
    summary: string;
  }> {
    try {
      if (!openai) {
        return {
          rating: 3,
          confidence: 0.5,
          summary: "Neutral sentiment (AI service not available)"
        };
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a sentiment analysis expert. Analyze the sentiment of reviews and feedback. Respond with JSON in this format: { 'rating': number_1_to_5, 'confidence': number_0_to_1, 'summary': 'brief_summary' }"
          },
          {
            role: "user",
            content: `Analyze the sentiment of this text: "${text}"`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      return {
        rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        summary: result.summary || "Neutral sentiment"
      };
    } catch (error) {
      console.log("Sentiment analysis error:", error);
      return {
        rating: 3,
        confidence: 0.5,
        summary: "Unable to analyze sentiment"
      };
    }
  }

  private getFallbackWeatherData(city: string): WeatherData {
    // Realistic weather data for Indian cities
    const cityWeatherMap: { [key: string]: WeatherData } = {
      'mumbai': { temperature: 32, humidity: 75, description: "Hot and humid", condition: "sunny" },
      'delhi': { temperature: 28, humidity: 60, description: "Partly cloudy", condition: "cloudy" },
      'bangalore': { temperature: 24, humidity: 65, description: "Pleasant weather", condition: "cloudy" },
      'chennai': { temperature: 31, humidity: 80, description: "Hot and coastal", condition: "sunny" },
      'kolkata': { temperature: 29, humidity: 70, description: "Warm and humid", condition: "cloudy" },
      'pune': { temperature: 26, humidity: 55, description: "Pleasant", condition: "sunny" },
    };

    return cityWeatherMap[city.toLowerCase()] || {
      temperature: 28,
      humidity: 65,
      description: "Moderate weather",
      condition: "sunny"
    };
  }
}

export const aiService = new AIService();