const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf8');

if (!code.includes("import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';")) {
  code = code.replace(
    "import { doc, getDoc, setDoc } from 'firebase/firestore';",
    "import { doc, getDoc, setDoc } from 'firebase/firestore';\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';\nimport { storage } from '../../lib/firebase';"
  );
}

if (!code.includes('handleLogoUpload')) {
  const uploadFunc = `
  const [imageUploading, setImageUploading] = useState(false);
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageUploading(true);
    try {
      const storageRef = ref(storage, \`settings/\${Date.now()}_\${file.name}\`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setLogoUrl(url);
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Failed to upload logo. Please check Firebase Storage rules.");
    } finally {
      setImageUploading(false);
    }
  };
  `;
  code = code.replace("const [saving, setSaving] = useState(false);", "const [saving, setSaving] = useState(false);\n" + uploadFunc);
}

const newLogoInput = `
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">App Logo (Upload)</label>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleLogoUpload}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {imageUploading && <p className="text-sm text-emerald-600 mt-2 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</p>}
          {logoUrl && !imageUploading && (
             <div className="mt-4">
               <p className="text-xs text-gray-500 mb-2">Current Logo Preview:</p>
               <img src={logoUrl} alt="Logo Preview" className="h-12 object-contain bg-gray-50 rounded p-2 border" />
             </div>
          )}
        </div>
`;

if (code.includes('App Logo URL')) {
  code = code.replace(
    /<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">App Logo URL<\/label>[\s\S]*?<\/p>\s*<\/div>/,
    newLogoInput
  );
}

fs.writeFileSync('src/pages/admin/AdminSettings.tsx', code);
