import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '@/src/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { ChatRoom } from '@/src/types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ChatListProps {
  onSelectRoom: (roomId: string, expertId: string, expertName: string) => void;
}

export default function ChatList({ onSelectRoom }: ChatListProps) {
  const { user } = useFirebase();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const roomsRef = collection(db, 'chatRooms');
    const q = query(
      roomsRef,
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatRoom[];
      setRooms(roomsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chat rooms:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No messages yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Start a chat with a Quiklancer to discuss your issues.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rooms.map((room) => {
        const isExpert = user?.uid === room.expertId;
        const otherName = isExpert ? room.clientName : room.expertName;
        const otherId = isExpert ? room.clientId : room.expertId;

        return (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card 
              className="p-4 hover:border-blue-500 transition-all cursor-pointer group"
              onClick={() => onSelectRoom(room.id, otherId, otherName)}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shrink-0">
                  {otherName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{otherName}</h4>
                    {room.lastMessageAt && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                    {room.lastMessage || 'No messages yet'}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
