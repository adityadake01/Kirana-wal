import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection, query, where } from 'firebase/firestore';
import fs from 'fs';
const code = fs.readFileSync('src/lib/firebase.ts', 'utf8');
const match = code.match(/firebaseConfig\s*=\s*({[\s\S]*?});/);
if (match) {
  const config = eval('(' + match[1] + ')');
  const app = initializeApp(config);
  const db = getFirestore(app);
  
  async function test() {
    console.log("Checking sellers...");
    const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'shopkeeper')));
    snap.forEach(doc => {
      console.log('User ID:', doc.id, 'Status:', doc.data().status, 'Email:', doc.data().email);
    });
    const shopsSnap = await getDocs(collection(db, 'shops'));
    shopsSnap.forEach(doc => {
      console.log('Shop ID:', doc.id, 'Status:', doc.data().status, 'Owner:', doc.data().ownerEmail);
    });
    process.exit(0);
  }
  test().catch(e => { console.error(e); process.exit(1); });
}
