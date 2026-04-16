import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Phone, Calendar, AlertCircle, ShieldAlert, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs, where, setDoc } from 'firebase/firestore';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { ChatMessage, ChatRoom, UserProfile } from '@/src/types';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

interface ChatWindowProps {
  expertId: string;
  expertName: string;
  onClose: () => void;
}

export default function ChatWindow({ expertId, expertName, onClose }: ChatWindowProps) {
  const { user, profile } = useFirebase();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showIntentCTA, setShowIntentCTA] = useState(false);
  const [showConversionPrompt, setShowConversionPrompt] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [isExpertOnline, setIsExpertOnline] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MASK_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const INTENT_KEYWORDS = ['ok let\'s start', 'can you fix this', 'when can we do this', 'let\'s do it', 'start now', 'fix it'];

  useEffect(() => {
    if (!user || !expertId) return;

    const findOrCreateRoom = async () => {
      const participants = [user.uid, expertId].sort();
      const roomsRef = collection(db, 'chatRooms');
      const q = query(roomsRef, where('participants', '==', participants));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setRoomId(snapshot.docs[0].id);
      } else {
        const newRoomRef = doc(roomsRef);
        const roomData: Partial<ChatRoom> = {
          participants,
          clientId: user.uid,
          expertId: expertId,
          clientName: profile?.displayName || 'Client',
          expertName: expertName,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(newRoomRef, roomData);
        setRoomId(newRoomRef.id);
      }
    };

    findOrCreateRoom();
  }, [user, expertId]);

  useEffect(() => {
    if (!expertId) return;
    const expertRef = doc(db, 'users', expertId);
    const unsubscribe = onSnapshot(expertRef, (doc) => {
      if (doc.exists()) {
        setIsExpertOnline(doc.data().isAvailable !== false);
      }
    });
    return () => unsubscribe();
  }, [expertId]);

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(msgs);
      
      const clientMsgs = msgs.filter(m => m.senderId === user?.uid).length;
      const expertMsgs = msgs.filter(m => m.senderId === expertId).length;
      if (clientMsgs >= 5 && expertMsgs >= 5) {
        setShowConversionPrompt(true);
      }
    });

    const roomRef = doc(db, 'chatRooms', roomId);
    const unsubscribeRoom = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const typing = doc.data().typing || {};
        const others = Object.keys(typing).filter(id => id !== user?.uid && typing[id]);
        setOtherTyping(others.length > 0);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeRoom();
    };
  }, [roomId, user?.uid]);

  const handleTyping = async (isTypingNow: boolean) => {
    if (!roomId || !user) return;
    const roomRef = doc(db, 'chatRooms', roomId);
    await updateDoc(roomRef, {
      [`typing.${user.uid}`]: isTypingNow
    });
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      handleTyping(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      handleTyping(false);
    }, 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !user) return;

    let text = newMessage.trim();
    let isMasked = false;

    // Anti-bypass protection
    if (MASK_REGEX.test(text)) {
      text = text.replace(MASK_REGEX, '[REDACTED]');
      isMasked = true;
      setWarning("Sharing personal contact details is not allowed for safety reasons");
      setTimeout(() => setWarning(null), 5000);
    }

    // Intent detection
    const lowerText = text.toLowerCase();
    if (INTENT_KEYWORDS.some(k => lowerText.includes(k))) {
      setShowIntentCTA(true);
    }

    const messageData = {
      senderId: user.uid,
      text,
      isMasked,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'chatRooms', roomId, 'messages'), messageData);
      await updateDoc(doc(db, 'chatRooms', roomId), {
        lastMessage: text,
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            {expertName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-sm">{expertName}</h3>
            <div className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${isExpertOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-[10px] font-bold opacity-80">{isExpertOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-full transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 dark:bg-gray-950/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
              msg.senderId === user?.uid 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
            }`}>
              {msg.text}
              {msg.isMasked && (
                <div className="mt-1 flex items-center gap-1 text-[8px] opacity-70">
                  <ShieldAlert className="h-2 w-2" />
                  Contact info hidden
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Conversion Prompt */}
        <AnimatePresence>
          {showConversionPrompt && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-center"
            >
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-2">
                You can start a live session for faster resolution
              </p>
              <Button size="sm" className="h-7 text-[10px]" onClick={() => navigate(`/expert/${expertId}`)}>
                Start Live Session
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intent CTA */}
        <AnimatePresence>
          {showIntentCTA && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl space-y-3"
            >
              <p className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                <Zap className="h-4 w-4 fill-green-500" />
                Ready to get this fixed?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-[10px]" onClick={() => navigate(`/expert/${expertId}`)}>
                  Start Paid Session
                </Button>
                <Button size="sm" variant="outline" className="text-[10px]" onClick={() => navigate(`/expert/${expertId}`)}>
                  Schedule Session
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {otherTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl rounded-tl-none flex gap-1">
              <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" />
              <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Warning */}
      <AnimatePresence>
        {warning && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 bg-amber-50 dark:bg-amber-900/40 border-t border-amber-100 dark:border-amber-900/30 flex items-center gap-2 text-[10px] font-bold text-amber-700 dark:text-amber-400"
          >
            <ShieldAlert className="h-3 w-3" />
            {warning}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <input 
          type="text"
          value={newMessage}
          onChange={onInputChange}
          placeholder="Type a message..."
          className="flex-1 h-10 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 text-sm focus:outline-none focus:border-blue-500"
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </motion.div>
  );
}
