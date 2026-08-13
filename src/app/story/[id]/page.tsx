'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';
import { FaArrowLeft, FaClock, FaUser, FaCrown, FaHeart, FaShare } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  imageUrl?: string;
  readTime: number;
  isPremium: boolean;
  isActive: boolean;
  views?: number;
  likes?: number;
  createdAt?: any;
}

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchStory();
  }, []);

  const fetchStory = async () => {
    try {
      const docRef = doc(db, 'stories', params.id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStory({ id: docSnap.id, ...docSnap.data() } as Story);
      } else {
        toast.error('Story not found');
        router.push('/stories');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      toast.error('Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // You can update the like count in Firestore here
    toast.success(liked ? 'Unliked' : 'Liked! ❤️');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        text: story?.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Story not found</p>
          <Link href="/stories" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Stories
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {story.imageUrl && (
            <img src={story.imageUrl} alt={story.title} className="w-full h-64 object-cover" />
          )}
          
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{story.title}</h1>
              {story.isPremium && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  <FaCrown className="w-4 h-4" />
                  Premium
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1">
                <FaUser className="w-4 h-4" />
                {story.author}
              </span>
              <span className="flex items-center gap-1">
                <FaClock className="w-4 h-4" />
                {story.readTime} min read
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                {story.category}
              </span>
              {story.createdAt && (
                <span className="text-xs">
                  {new Date(story.createdAt.seconds * 1000).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {story.content}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-100">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  liked ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaHeart className={liked ? 'fill-red-500' : ''} />
                <span>Like</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaShare />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
