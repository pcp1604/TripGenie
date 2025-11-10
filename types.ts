

export interface UserPreferences {
  currency: string;
  homeAirport: string;
  travelPace: 'relaxed' | 'moderate' | 'intense';
  interests: string[];
}

export type TransportMode = 'flight' | 'train' | 'bus' | 'car';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Activity {
  id: string;
  time: string; // "09:00 AM"
  title: string;
  description: string;
  duration: string; // "2h"
  type: 'nature' | 'culture' | 'food' | 'relax' | 'transit';
  location: string;
  coordinates?: GeoPoint;
  cost?: number;
  bookingLink?: string;
}

export interface DayPlan {
  day: number;
  date?: string;
  theme: string;
  activities: Activity[];
  dailyTotalEstimate: number;
}

export interface FlightOption {
  id: string;
  airline: string; // Or Train Name / Bus Operator
  flightNumber: string; // Or Train Number
  departureTime: string;
  arrivalTime: string;
  price: number;
  duration: string;
  stops: number;
  bookingLink: string;
}

export interface HotelOption {
  id: string;
  name: string;
  stars: number;
  location: string;
  pricePerNight: number;
  totalPrice: number;
  amenities: string[];
  bookingLink: string;
  image?: string;
}

export interface CostBreakdown {
  flights: number; // Transport costs
  hotels: number;
  transport: number; // Local transport
  activities: number;
  food: number;
  total: number;
}

export interface TripItinerary {
  id: string;
  destination: string;
  summary: string;
  startDate: string;
  endDate: string;
  travelers: number;
  days: DayPlan[];
  flights: FlightOption[];
  hotels: HotelOption[];
  costs: CostBreakdown;
  visaGuidance: {
    required: boolean;
    summary: string;
    officialLink: string;
  };
  packingList: string[];
  safetyNotes: string;
}

export interface MustVisitPlace {
  name: string;
  description: string;
  reason: string;
  bestTime: string;
  tip: string;
}

// --- StratAI / Project Management Types ---

export enum UserRole {
  CONSULTANT = 'Consultant',
  CLIENT = 'Client',
  ADMIN = 'Admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  avatarUrl: string;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  status: string;
  dueDate: string;
  progress: number;
  description: string;
  contextSnippet: string;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}
