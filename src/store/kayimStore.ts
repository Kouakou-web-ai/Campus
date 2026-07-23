// ============================================
// STORE ZUSTAND POUR L'AGENT IA KAYIM
// ============================================

import { create } from 'zustand';
import type { KayimChatMessage } from '../types/kayim';
import { generateKayimResponse } from '../services/kayimEngine';
import type { UserRole } from './authStore';

interface KayimStoreState {
  isOpen: boolean;
  messages: KayimChatMessage[];
  isTyping: boolean;
  suggestedQuestions: string[];
  toggleChat: () => void;
  openChatWithPrompt: (promptText: string, userRole?: UserRole, userName?: string) => void;
  sendMessage: (text: string, userRole: UserRole, userName?: string) => Promise<void>;
  clearHistory: () => void;
  initSuggestions: (userRole: UserRole) => void;
}

export const useKayimStore = create<KayimStoreState>((set, get) => ({
  isOpen: false,
  isTyping: false,
  messages: [
    {
      id: 'welcome-msg',
      sender: 'kayim',
      text: "Bonjour 👋, je suis KAYIM, l’assistant intelligent de la plateforme de gestion universitaire. Je peux vous aider à créer un compte, vous connecter, gérer les étudiants, les enseignants, les paiements, les notes et toutes les fonctionnalités de l’application. Que souhaitez-vous faire ?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  suggestedQuestions: [
    "Comment créer un compte étudiant ?",
    "J'ai oublié mon mot de passe.",
    "Comment saisir les notes d'une classe ?",
    "Où effectuer un paiement de scolarité ?"
  ],

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  openChatWithPrompt: (promptText: string, userRole: UserRole = 'STUDENT', userName?: string) => {
    set({ isOpen: true });
    get().sendMessage(promptText, userRole, userName);
  },

  initSuggestions: (userRole: UserRole) => {
    let suggestions: string[] = [];
    switch (userRole) {
      case 'SUPER_ADMIN':
      case 'UNIVERSITY_ADMIN':
        suggestions = [
          "Comment créer un compte étudiant ?",
          "Comment créer un compte enseignant ?",
          "Que se passe-t-il après la création du compte ?"
        ];
        break;
      case 'STUDENT_MANAGER':
        suggestions = [
          "Comment valider une demande d'inscription ?",
          "Comment éditer une carte étudiante ?",
          "Quels sont les statuts d'un étudiant ?"
        ];
        break;
      case 'FINANCE_MANAGER':
        suggestions = [
          "Comment enregistrer un paiement de scolarité ?",
          "Où trouver mes reçus de paiement ?"
        ];
        break;
      case 'TEACHER':
        suggestions = [
          "Comment saisir les notes d'une classe ?",
          "Comment faire l'appel en classe ?",
          "Qui doit signer les bulletins ?"
        ];
        break;
      case 'STUDENT':
      case 'PARENT':
        suggestions = [
          "J'ai oublié mon mot de passe.",
          "Comment consulter mon bulletin de notes ?",
          "Comment effectuer un paiement de scolarité ?"
        ];
        break;
      default:
        suggestions = [
          "Comment créer un compte ?",
          "J'ai oublié mon mot de passe."
        ];
    }
    set({ suggestedQuestions: suggestions });
  },

  sendMessage: async (text: string, userRole: UserRole, userName?: string) => {
    if (!text.trim()) return;

    const userMsg: KayimChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleContext: userRole
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isTyping: true
    }));

    // Simuler le délai de réflexion naturel de l'agent
    await new Promise((resolve) => setTimeout(resolve, 600));

    const responsePartial = await generateKayimResponse(text, userRole, userName);

    const kayimMsg: KayimChatMessage = {
      id: `kayim-${Date.now()}`,
      sender: 'kayim',
      text: responsePartial.text || "Je reste à votre entière disposition.",
      timestamp: responsePartial.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionButtons: responsePartial.actionButtons,
      steps: responsePartial.steps,
      isError: responsePartial.isError
    };

    set((state) => ({
      messages: [...state.messages, kayimMsg],
      isTyping: false
    }));
  },

  clearHistory: () => set({
    messages: [
      {
        id: 'welcome-msg-reset',
        sender: 'kayim',
        text: "Conversation réinitialisée. Comment puis-je vous aider ?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  })
}));
