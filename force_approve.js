import { initializeApp } from 'firebase/app';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';
const code = fs.readFileSync('src/lib/firebase.ts', 'utf8');
const match = code.match(/firebaseConfig\s*=\s*({[\s\S]*?});/);
if (match) {
  const config = eval('(' + match[1] + ')');
  const app = initializeApp(config);
  const db = getFirestore(app);
  
  async function test() {
    console.log("Fixing seller...");
    await updateDoc(doc(db, 'users', 'mt033UexC1cG4AuaA0w60JTUMel1'), { status: 'active' });
    console.log("Done");
    process.exit(0);
  }
  test().catch(e => { console.error(e); process.exit(1); });
}
