const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

if (!code.includes('const [shopImage, setShopImage]')) {
  code = code.replace("const [shopName, setShopName] = useState('');", "const [shopName, setShopName] = useState('');\n  const [shopImage, setShopImage] = useState('');");
}

if (!code.includes('image: shopImage,')) {
  code = code.replace("name: shopName,", "name: shopName,\n            image: shopImage,");
}

const shopImageJSX = `
          {role === 'shopkeeper' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Photo URL</label>
              <div className="relative">
                <input
                  type="url"
                  value={shopImage}
                  onChange={(e) => setShopImage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://example.com/shop-image.jpg"
                />
              </div>
            </div>
          )}
`;

if (!code.includes('Shop Photo URL')) {
  code = code.replace(/<\/div>\s*<\/div>\s*\)\}\s*<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Email Address<\/label>/, 
    `</div>\n            </div>\n          )}\n${shopImageJSX}\n          <div>\n            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>`);
}

fs.writeFileSync('src/pages/Register.tsx', code);
