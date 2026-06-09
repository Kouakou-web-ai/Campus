import { create } from 'zustand';
import { db } from '../../firebase-config';
import { ref, onValue, push, set, update, off } from 'firebase/database';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  chatId: string;
  recipientId: string;
  recipientName: string;
  recipientRole: 'STUDENT' | 'TEACHER';
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

interface ChatState {
  conversations: ChatConversation[];
  activeChatId: string | null;
  activeMessages: ChatMessage[];
  loading: boolean;
  totalUnreadCount: number;
  
  sendMessage: (chatId: string, senderId: string, senderName: string, text: string) => Promise<void>;
  subscribeToChat: (chatId: string) => () => void;
  subscribeToAllUserChats: (userId: string, userRole: 'STUDENT' | 'TEACHER', universityId: string, allUsers: any[]) => () => void;
  markChatAsRead: (chatId: string, userId: string) => Promise<void>;
  setActiveChat: (chatId: string | null) => void;
}

export const useChatStore = create<ChatState>((setStore, getStore) => ({
  conversations: [],
  activeChatId: null,
  activeMessages: [],
  loading: false,
  totalUnreadCount: 0,

  setActiveChat: (chatId) => {
    setStore({ activeChatId: chatId });
  },

  sendMessage: async (chatId, senderId, senderName, text) => {
    if (!text.trim()) return;
    const msgRef = push(ref(db, `chats/${chatId}/messages`));
    const msgId = msgRef.key;
    if (!msgId) return;

    await set(msgRef, {
      id: msgId,
      senderId,
      senderName,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: false
    });
  },

  subscribeToChat: (chatId) => {
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const list: ChatMessage[] = [];
      if (data) {
        Object.entries(data).forEach(([id, m]: [string, any]) => {
          if (m) {
            list.push({
              id,
              senderId: m.senderId,
              senderName: m.senderName,
              text: m.text,
              timestamp: m.timestamp,
              read: !!m.read
            });
          }
        });
      }
      
      // Sort by timestamp
      list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      setStore({ activeMessages: list });
    });

    return () => {
      off(messagesRef, 'value', unsubscribe);
    };
  },

  subscribeToAllUserChats: (userId, userRole, universityId, allUsers) => {
    const chatsRef = ref(db, `chats`);

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      const conversationMap: Record<string, ChatConversation> = {};
      let globalUnread = 0;

      // Filter all users to match potential conversation partners
      // If student: partners are university teachers
      // If teacher: partners are university students
      const partners = allUsers.filter(u => 
        u && 
        u.universityId === universityId && 
        (u.status === 'active' || u.status === 'actif') && 
        u.uid !== userId && 
        (userRole === 'STUDENT' ? u.role === 'TEACHER' : u.role === 'STUDENT')
      );

      // Initialize conversation placeholders for all potential partners
      partners.forEach(partner => {
        const studentId = userRole === 'STUDENT' ? userId : partner.uid;
        const teacherId = userRole === 'STUDENT' ? partner.uid : userId;
        const chatId = `chat_${studentId}_${teacherId}`;

        conversationMap[chatId] = {
          chatId,
          recipientId: partner.uid,
          recipientName: `${partner.prenom || ''} ${partner.nom || ''}`.trim() || partner.name || partner.email,
          recipientRole: partner.role,
          messages: [],
          unreadCount: 0
        };
      });

      if (data) {
        Object.entries(data).forEach(([chatId, chatVal]: [string, any]) => {
          if (chatVal && chatVal.messages && conversationMap[chatId]) {
            const messages: ChatMessage[] = [];
            let unread = 0;

            Object.entries(chatVal.messages).forEach(([msgId, m]: [string, any]) => {
              if (m) {
                const messageObj = {
                  id: msgId,
                  senderId: m.senderId,
                  senderName: m.senderName,
                  text: m.text,
                  timestamp: m.timestamp,
                  read: !!m.read
                };
                messages.push(messageObj);

                // Count unread if received from partner
                if (m.senderId !== userId && !m.read) {
                  unread++;
                }
              }
            });

            // Sort messages
            messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            conversationMap[chatId].messages = messages;
            conversationMap[chatId].lastMessage = messages[messages.length - 1];
            conversationMap[chatId].unreadCount = unread;
            
            globalUnread += unread;
          }
        });
      }

      const conversationList = Object.values(conversationMap);
      
      // Sort conversations so the ones with active/recent messages are first
      conversationList.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
      });

      setStore({ 
        conversations: conversationList,
        totalUnreadCount: globalUnread
      });
    });

    return () => {
      off(chatsRef, 'value', unsubscribe);
    };
  },

  markChatAsRead: async (chatId, userId) => {
    const chatRef = ref(db, `chats/${chatId}/messages`);
    
    // Find unread messages received from the other user and update them to read
    const messages = getStore().conversations.find(c => c.chatId === chatId)?.messages || [];
    const updates: Record<string, any> = {};
    
    messages.forEach(m => {
      if (m.senderId !== userId && !m.read) {
        updates[`${m.id}/read`] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(chatRef, updates);
    }
  }
}));
