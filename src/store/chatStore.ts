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
  isAudio?: boolean;
  audioDuration?: string;
  edited?: boolean;
  deletedFor?: Record<string, boolean>; // userId -> true
  deletedForEveryone?: boolean;
  reactions?: Record<string, string>; // userId -> emoji
  replyTo?: {
    messageId: string;
    senderName: string;
    text: string;
    isAudio?: boolean;
  };
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
  
  sendMessage: (chatId: string, senderId: string, senderName: string, text: string, replyTo?: any) => Promise<void>;
  sendAudioMessage: (chatId: string, senderId: string, senderName: string, audioData: string, duration: string) => Promise<void>;
  editMessage: (chatId: string, messageId: string, newText: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string, forEveryone: boolean, userId: string) => Promise<void>;
  addReaction: (chatId: string, messageId: string, userId: string, emoji: string) => Promise<void>;
  deleteConversations: (chatIds: string[], userId: string) => Promise<void>;
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

  sendMessage: async (chatId, senderId, senderName, text, replyTo) => {
    if (!text.trim()) return;
    const msgRef = push(ref(db, `chats/${chatId}/messages`));
    const msgId = msgRef.key;
    if (!msgId) return;

    const msgData: any = {
      id: msgId,
      senderId,
      senderName,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    if (replyTo) {
      msgData.replyTo = replyTo;
    }

    await set(msgRef, msgData);
  },

  sendAudioMessage: async (chatId, senderId, senderName, audioData, duration) => {
    const msgRef = push(ref(db, `chats/${chatId}/messages`));
    const msgId = msgRef.key;
    if (!msgId) return;

    await set(msgRef, {
      id: msgId,
      senderId,
      senderName,
      text: audioData,
      timestamp: new Date().toISOString(),
      read: false,
      isAudio: true,
      audioDuration: duration
    });
  },

  editMessage: async (chatId, messageId, newText) => {
    if (!newText.trim()) return;
    const msgRef = ref(db, `chats/${chatId}/messages/${messageId}`);
    await update(msgRef, {
      text: newText.trim(),
      edited: true
    });
  },

  deleteMessage: async (chatId, messageId, forEveryone, userId) => {
    const msgRef = ref(db, `chats/${chatId}/messages/${messageId}`);
    if (forEveryone) {
      await update(msgRef, {
        text: 'Ce message a été supprimé',
        deletedForEveryone: true
      });
    } else {
      await set(ref(db, `chats/${chatId}/messages/${messageId}/deletedFor/${userId}`), true);
    }
  },

  addReaction: async (chatId, messageId, userId, emoji) => {
    const reactionRef = ref(db, `chats/${chatId}/messages/${messageId}/reactions/${userId}`);
    await set(reactionRef, emoji);
  },

  deleteConversations: async (chatIds, userId) => {
    const updates: Record<string, any> = {};
    const conversations = getStore().conversations;
    
    chatIds.forEach(chatId => {
      const conv = conversations.find(c => c.chatId === chatId);
      if (conv) {
        conv.messages.forEach(msg => {
          updates[`chats/${chatId}/messages/${msg.id}/deletedFor/${userId}`] = true;
        });
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }
  },

  subscribeToChat: (chatId) => {
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const list: ChatMessage[] = [];
      if (data) {
        Object.entries(data).forEach(([id, m]: [string, any]) => {
          if (m) {
            // Check if deleted for me
            const isDeletedForMe = m.deletedFor && m.deletedFor[getStore().activeChatId || ''] === true; // wait, let's use the local list filter to exclude deleted messages
            list.push({
              id,
              senderId: m.senderId,
              senderName: m.senderName,
              text: m.text,
              timestamp: m.timestamp,
              read: !!m.read,
              isAudio: !!m.isAudio,
              audioDuration: m.audioDuration,
              edited: !!m.edited,
              deletedFor: m.deletedFor || undefined,
              deletedForEveryone: !!m.deletedForEveryone,
              reactions: m.reactions || undefined,
              replyTo: m.replyTo || undefined
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
    const conversationMap: Record<string, ChatConversation> = {};
    const unsubscribers: (() => void)[] = [];

    const partners = allUsers.filter(u => 
      u && 
      u.universityId === universityId && 
      (u.status === 'active' || u.status === 'actif') && 
      u.uid !== userId && 
      (userRole === 'STUDENT' ? u.role === 'TEACHER' : u.role === 'STUDENT')
    );

    // Initialize all conversations in the map
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

    const updateStoreState = () => {
      let globalUnread = 0;
      const conversationList = Object.values(conversationMap);
      
      conversationList.forEach(c => {
        globalUnread += c.unreadCount;
      });

      conversationList.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
      });

      setStore({ 
        conversations: conversationList,
        totalUnreadCount: globalUnread
      });
    };

    // Set up a listener for each chatId
    Object.keys(conversationMap).forEach(chatId => {
      const chatMessagesRef = ref(db, `chats/${chatId}/messages`);
      const unsub = onValue(chatMessagesRef, (snapshot) => {
        const val = snapshot.val();
        const messages: ChatMessage[] = [];
        let unread = 0;

        if (val) {
          Object.entries(val).forEach(([msgId, m]: [string, any]) => {
            if (m) {
              const isDeletedForMe = m.deletedFor && m.deletedFor[userId];
              if (!isDeletedForMe) {
                messages.push({
                  id: msgId,
                  senderId: m.senderId,
                  senderName: m.senderName,
                  text: m.text,
                  timestamp: m.timestamp,
                  read: !!m.read,
                  isAudio: !!m.isAudio,
                  audioDuration: m.audioDuration,
                  edited: !!m.edited,
                  deletedFor: m.deletedFor || undefined,
                  deletedForEveryone: !!m.deletedForEveryone,
                  reactions: m.reactions || undefined,
                  replyTo: m.replyTo || undefined
                });

                if (m.senderId !== userId && !m.read) {
                  unread++;
                }
              }
            }
          });
        }

        // Sort messages
        messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        conversationMap[chatId].messages = messages;
        conversationMap[chatId].lastMessage = messages[messages.length - 1];
        conversationMap[chatId].unreadCount = unread;

        updateStoreState();
      });

      unsubscribers.push(unsub);
    });

    // Handle empty partners case
    if (Object.keys(conversationMap).length === 0) {
      updateStoreState();
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  },

  markChatAsRead: async (chatId, userId) => {
    const chatRef = ref(db, `chats/${chatId}/messages`);
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
