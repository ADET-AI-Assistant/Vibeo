/**
 * vibeyChatService.js
 * ═══════════════════════════════════════════════════════════════
 * Firestore CRUD for Vibey chat sessions.
 * Collection: users/{uid}/vibey_chats
 * ═══════════════════════════════════════════════════════════════
 */

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    orderBy,
    query,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Get the chats subcollection ref for a user.
 */
const chatsRef = (uid) => collection(db, 'users', uid, 'vibey_chats');

/**
 * Auto-generate a short title from the first user message.
 */
export const autoTitleChat = (firstMessage) => {
    if (!firstMessage) return 'New Chat';
    const cleaned = firstMessage.replace(/\n/g, ' ').trim();
    if (cleaned.length <= 40) return cleaned;
    return cleaned.substring(0, 40).trim() + '…';
};

/**
 * Fetch all chats for a user, sorted by most recently updated.
 */
export const getUserChats = async (uid) => {
    if (!uid) return [];
    try {
        const q = query(chatsRef(uid), orderBy('updatedAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
    } catch (err) {
        console.error('[VibeyChatService] Error fetching chats:', err);
        return [];
    }
};

/**
 * Fetch a single chat by ID.
 */
export const getChatById = async (uid, chatId) => {
    if (!uid || !chatId) return null;
    try {
        const snap = await getDoc(doc(db, 'users', uid, 'vibey_chats', chatId));
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() };
    } catch (err) {
        console.error('[VibeyChatService] Error fetching chat:', err);
        return null;
    }
};

/**
 * Create a new chat document. Returns the new document ID.
 */
export const createChat = async (uid, title = 'New Chat') => {
    if (!uid) return null;
    try {
        const docRef = await addDoc(chatsRef(uid), {
            title,
            messages: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (err) {
        console.error('[VibeyChatService] Error creating chat:', err);
        return null;
    }
};

/**
 * Save messages to a chat and bump updatedAt.
 * Messages are stored as a serializable array (no Firestore-specific types).
 */
export const updateChatMessages = async (uid, chatId, messages, title) => {
    if (!uid || !chatId) return;
    try {
        const updateData = {
            messages,
            updatedAt: serverTimestamp(),
        };
        if (title !== undefined) {
            updateData.title = title;
        }
        await updateDoc(doc(db, 'users', uid, 'vibey_chats', chatId), updateData);
    } catch (err) {
        console.error('[VibeyChatService] Error updating messages:', err);
    }
};

/**
 * Rename a chat.
 */
export const renameChat = async (uid, chatId, newTitle) => {
    if (!uid || !chatId) return;
    try {
        await updateDoc(doc(db, 'users', uid, 'vibey_chats', chatId), {
            title: newTitle,
            updatedAt: serverTimestamp(),
        });
    } catch (err) {
        console.error('[VibeyChatService] Error renaming chat:', err);
    }
};

/**
 * Delete a chat.
 */
export const deleteChatById = async (uid, chatId) => {
    if (!uid || !chatId) return;
    try {
        await deleteDoc(doc(db, 'users', uid, 'vibey_chats', chatId));
    } catch (err) {
        console.error('[VibeyChatService] Error deleting chat:', err);
    }
};
