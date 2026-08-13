import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Store, Quiz, Story, SubscriptionPlan } from '@/types';

// User Services
export const userService = {
  async getAllUsers(): Promise<User[]> {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  },

  async getUser(uid: string): Promise<User | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { uid: docSnap.id, ...docSnap.data() } as User : null;
  },

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  async toggleUserStatus(uid: string, isActive: boolean): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { isActive, updatedAt: serverTimestamp() });
  },

  async updateSubscription(uid: string, level: number): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      'subscription.level': level,
      'subscription.isActive': true,
      'subscription.startDate': serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

// Store Services
export const storeService = {
  async getAllStores(): Promise<Store[]> {
    const q = query(collection(db, 'stores'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
  },

  async createStore(data: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'stores'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateStore(id: string, data: Partial<Store>): Promise<void> {
    const docRef = doc(db, 'stores', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  async deleteStore(id: string): Promise<void> {
    const docRef = doc(db, 'stores', id);
    await deleteDoc(docRef);
  }
};

// Quiz Services
export const quizService = {
  async getAllQuizzes(): Promise<Quiz[]> {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
  },

  async createQuiz(data: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'quizzes'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateQuiz(id: string, data: Partial<Quiz>): Promise<void> {
    const docRef = doc(db, 'quizzes', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  async deleteQuiz(id: string): Promise<void> {
    const docRef = doc(db, 'quizzes', id);
    await deleteDoc(docRef);
  }
};

// Story Services
export const storyService = {
  async getAllStories(): Promise<Story[]> {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
  },

  async createStory(data: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'stories'), {
      ...data,
      views: 0,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateStory(id: string, data: Partial<Story>): Promise<void> {
    const docRef = doc(db, 'stories', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  async deleteStory(id: string): Promise<void> {
    const docRef = doc(db, 'stories', id);
    await deleteDoc(docRef);
  }
};

// Subscription Services
export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const q = query(collection(db, 'subscriptionPlans'), orderBy('level', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubscriptionPlan));
  },

  async createPlan(data: Omit<SubscriptionPlan, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'subscriptionPlans'), data);
    return docRef.id;
  },

  async updatePlan(id: string, data: Partial<SubscriptionPlan>): Promise<void> {
    const docRef = doc(db, 'subscriptionPlans', id);
    await updateDoc(docRef, data);
  },

  async deletePlan(id: string): Promise<void> {
    const docRef = doc(db, 'subscriptionPlans', id);
    await deleteDoc(docRef);
  },

  async getUsersBySubscriptionLevel(level: number): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('subscription.level', '==', level),
      where('subscription.isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  }
};
