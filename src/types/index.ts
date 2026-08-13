export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin' | 'moderator';
  subscription: {
    level: 0 | 1 | 2 | 3; // 0: free, 1: basic, 2: premium, 3: vip
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
  };
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  passingScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  imageUrl: string;
  readTime: number; // in minutes
  isPremium: boolean;
  isActive: boolean;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  level: 0 | 1 | 2 | 3;
  price: number;
  duration: number; // in days
  features: string[];
  isActive: boolean;
}
