const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSellerList.tsx', 'utf8');

const importStr = "import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, addDoc } from 'firebase/firestore';\nimport { useAuthStore } from '../../store/authStore';";

code = code.replace(
  "import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';",
  importStr
);

code = code.replace(
  "export default function AdminSellerList() {",
  "export default function AdminSellerList() {\n  const { user } = useAuthStore();\n  \n  const addAuditLog = async (action, targetId, description) => {\n    if (!user) return;\n    try {\n      await addDoc(collection(db, 'audit_logs'), {\n        adminId: user.uid,\n        adminEmail: user.email,\n        action,\n        targetId,\n        targetType: 'seller',\n        description,\n        timestamp: new Date().toISOString()\n      });\n    } catch (e) { console.error('Failed to write audit log', e); }\n  };"
);

code = code.replace(
  "await updateDoc(doc(db, 'users', sellerId), { status: 'active', updatedAt: new Date().toISOString() });",
  "await updateDoc(doc(db, 'users', sellerId), { status: 'active', updatedAt: new Date().toISOString() });\n      await addAuditLog('Seller Approved', sellerId, 'Admin approved seller registration');"
);

code = code.replace(
  "await updateDoc(doc(db, 'users', sellerId), { status: 'banned', updatedAt: new Date().toISOString() });",
  "await updateDoc(doc(db, 'users', sellerId), { status: 'banned', updatedAt: new Date().toISOString() });\n      await addAuditLog('Seller Rejected/Banned', sellerId, 'Admin rejected/banned seller');"
);

code = code.replace(
  "console.error('Error reactivating seller:', error);",
  "// reactivate audit log\n        await addAuditLog('Seller Reactivated', sellerId, 'Admin reactivated seller');\n      } catch (error) {\n        console.error('Error reactivating seller:', error);"
);

// Wait, reactivate is inside the try block, let's fix that
code = code.replace(
  "await updateDoc(doc(db, 'users', sellerId), { status: 'active', updatedAt: new Date().toISOString() });\n      } catch (error) {\n        console.error('Error reactivating seller:', error);",
  "await updateDoc(doc(db, 'users', sellerId), { status: 'active', updatedAt: new Date().toISOString() });\n        await addAuditLog('Seller Reactivated', sellerId, 'Admin reactivated seller');\n      } catch (error) {\n        console.error('Error reactivating seller:', error);"
);

fs.writeFileSync('src/pages/admin/AdminSellerList.tsx', code);
console.log("Patched AdminSellerList with Audit Logs");
