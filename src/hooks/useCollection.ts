import { useState, useEffect, useCallback } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, setDoc,
  type OrderByDirection,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface WithId { id: string }

/**
 * Real-time Firestore collection bound to the current user.
 * Path: users/{uid}/{collectionName}
 */
export function useCollection<T extends WithId>(
  collectionName: string,
  orderByField?: string,
  direction: OrderByDirection = 'asc',
) {
  const { user } = useAuth();
  const [items,   setItems]   = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return; }
    const ref = collection(db, 'users', user.uid, collectionName);
    const q   = orderByField ? query(ref, orderBy(orderByField, direction)) : ref;
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }) as T));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user, collectionName, orderByField, direction]);

  const add = useCallback(async (data: Omit<T, 'id'>) => {
    if (!user) return '';
    const ref = await addDoc(
      collection(db, 'users', user.uid, collectionName),
      { ...data, _createdAt: serverTimestamp() },
    );
    return ref.id;
  }, [user, collectionName]);

  const update = useCallback(async (id: string, data: Partial<Omit<T, 'id'>>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, collectionName, id), data as Record<string, unknown>);
  }, [user, collectionName]);

  const remove = useCallback(async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, collectionName, id));
  }, [user, collectionName]);

  const set = useCallback(async (id: string, data: Omit<T, 'id'>) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, collectionName, id), data as Record<string, unknown>);
  }, [user, collectionName]);

  return { items, loading, add, update, remove, set };
}
