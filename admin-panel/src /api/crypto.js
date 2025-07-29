import CryptoJS from "crypto-js";

// DECRYPT DATA
export function decryptData(encryptedData, iv, key) {
  try {
    const keyParsed = CryptoJS.enc.Hex.parse(key);
    const ivParsed = CryptoJS.enc.Hex.parse(iv);
    const encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedData);

    const encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64Str, keyParsed, {
      iv: ivParsed,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    console.log("🔐 Encrypted (hex):", encryptedData);
    console.log("🧊 IV (hex):", iv);
    console.log("🔑 Key (hex):", key);
    console.log("📤 Decrypted text:", decryptedText);

    if (decryptedText) {
      return JSON.parse(decryptedText);
    }
    return null;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}
