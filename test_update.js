import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDocs, collection } from 'firebase/firestore';

// Need to read firebase.ts config
import fs from 'fs';
const code = fs.readFileSync('src/lib/firebase.ts', 'utf8');
const match = code.match(/firebaseConfig\s*=\s*({[\s\S]*?});/);
if (match) {
  const config = eval('(' + match[1] + ')');
  const app = initializeApp(config);
  const db = getFirestore(app);
  
  async function test() {
    const snap = await getDocs(collection(db, 'shops'));
    if (snap.empty) {
      console.log('No shops found');
      return;
    }
    const firstShop = snap.docs[0];
    console.log('Trying to update shop:', firstShop.id);
    try {
      await updateDoc(doc(db, 'shops', firstShop.id), { status: 'active' });
      console.log('Update successful!');
    } catch (e) {
      console.error('Update failed:', e.message);
    }
  }
  test();
}
