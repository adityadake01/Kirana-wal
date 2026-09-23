const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');
code = code.replace("import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';", "import { doc, setDoc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';");
fs.writeFileSync('src/pages/Register.tsx', code);
