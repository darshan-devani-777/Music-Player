const crypto = require('crypto');

const ENCRYPTION_KEY = crypto.randomBytes(32); 
const IV = crypto.randomBytes(16); 

// ENCRYPT DATA
function encryptData(data) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: IV.toString('hex'),
    encryptedData: encrypted,
    key: ENCRYPTION_KEY.toString('hex'), 
  };
}

// DECRYPT DATA
function decryptData(encryptedData, ivHex) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

module.exports = { encryptData, decryptData };
