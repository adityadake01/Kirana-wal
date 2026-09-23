const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

if (!code.includes("import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';")) {
  code = code.replace(
    "import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';",
    "import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';\nimport { storage } from '../lib/firebase';"
  );
}

if (!code.includes('handleImageUpload')) {
  const uploadFunc = `
  const [imageUploading, setImageUploading] = useState(false);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageUploading(true);
    try {
      const storageRef = ref(storage, \`shop_images/\${Date.now()}_\${file.name}\`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setShopImage(url);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please check your storage rules.");
    } finally {
      setImageUploading(false);
    }
  };
  `;
  code = code.replace("const [error, setError] = useState('');", `${uploadFunc}\n  const [error, setError] = useState('');`);
}

// Replace the Shop Photo URL input with a file input
const newImageInput = `
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Photo (Upload)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {imageUploading && <p className="text-sm text-emerald-600 mt-1 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading image...</p>}
                {shopImage && !imageUploading && <img src={shopImage} alt="Preview" className="mt-2 h-24 rounded-lg object-cover" />}
              </div>
            </div>
`;

if (code.includes('Shop Photo URL')) {
  code = code.replace(
    /<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Shop Photo URL<\/label>[\s\S]*?<\/div>\s*<\/div>/,
    newImageInput
  );
}

fs.writeFileSync('src/pages/Register.tsx', code);
