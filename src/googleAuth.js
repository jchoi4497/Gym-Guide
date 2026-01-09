import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth'; // Added persistence imports
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const loginWithGoogle = async () => {
  // 1. Tell Firebase to remember the user
  await setPersistence(auth, browserLocalPersistence);

  // 2. Run the login
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      createdAt: new Date(),
    });
  }
  return user;
};

export const logout = () => signOut(auth);
