import { db } from "./firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    orderBy,
    deleteDoc
} from "firebase/firestore";

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatSession {
    id: string;
    workspaceId: string;
    userId: string;
    title: string;
    messages: ChatMessage[];
    createdAt?: any;
    updatedAt?: any;
}

const getChatsCollection = (workspaceId: string) =>
    collection(db, "workspaces", workspaceId, "chats");

export async function createChat(workspaceId: string, userId: string, initialMessage?: ChatMessage): Promise<ChatSession> {
    const title = initialMessage ? initialMessage.content.slice(0, 30) + (initialMessage.content.length > 30 ? "..." : "") : "New Chat";

    const docRef = await addDoc(getChatsCollection(workspaceId), {
        workspaceId,
        userId,
        title,
        messages: initialMessage ? [initialMessage] : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    return {
        id: docRef.id,
        workspaceId,
        userId,
        title,
        messages: initialMessage ? [initialMessage] : []
    };
}

export async function updateChatMessages(workspaceId: string, chatId: string, messages: ChatMessage[]) {
    const docRef = doc(db, "workspaces", workspaceId, "chats", chatId);
    await updateDoc(docRef, {
        messages,
        updatedAt: serverTimestamp()
    });
}

export async function getWorkspaceChats(workspaceId: string): Promise<ChatSession[]> {
    const q = query(
        getChatsCollection(workspaceId),
        orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ChatSession));
}

export async function getChat(workspaceId: string, chatId: string): Promise<ChatSession | null> {
    const docRef = doc(db, "workspaces", workspaceId, "chats", chatId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as ChatSession;
    }
    return null;
}

export async function deleteChat(workspaceId: string, chatId: string) {
    await deleteDoc(doc(db, "workspaces", workspaceId, "chats", chatId));
}
