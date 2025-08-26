// Helper: Convert an ArrayBuffer to a Base64 string
function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  
  // Helper: Convert a Base64 string to an ArrayBuffer
  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  /**
   * Encrypt data using AES-256-CBC in the browser.
   * @param {Object} params
   * @param {string} params.encryptionKey - The secret key as a string.
   * @param {string} params.data - The plaintext data to encrypt.
   * @returns {Promise<{encryptedData: string, iv: string}>} The encrypted data and IV in base64 format.
   */
  export async function encryptData({ encryptionKey, data }) {
    const encoder = new TextEncoder();
  
    // Derive a 256-bit key by hashing the encryptionKey with SHA-256
    const keyBuffer = encoder.encode(encryptionKey);
    const hash = await crypto.subtle.digest("SHA-256", keyBuffer);
  
    // Import the hashed key for AES-CBC encryption
    const aesKey = await crypto.subtle.importKey(
      "raw",
      hash,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );
  
    // Generate a random 16-byte IV
    const iv = crypto.getRandomValues(new Uint8Array(16));
  
    // Encrypt the data
    const dataBuffer = encoder.encode(data);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      aesKey,
      dataBuffer
    );
  
    // Return encrypted data and IV as Base64 strings
    return {
      encryptedData: arrayBufferToBase64(encryptedBuffer),
      iv: arrayBufferToBase64(iv)
    };
  }
  
  /**
   * Decrypt data using AES-256-CBC in the browser.
   * @param {Object} params
   * @param {string} params.encryptionKey - The secret key as a string.
   * @param {string} params.encryptedData - The encrypted data in base64 format.
   * @param {string} params.iv - The initialization vector in base64 format.
   * @returns {Promise<string>} The decrypted plaintext.
   */
  export async function decryptData({ encryptionKey, encryptedData, iv }) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
  
    // Derive the key just like in the encryption
    const keyBuffer = encoder.encode(encryptionKey);
    const hash = await crypto.subtle.digest("SHA-256", keyBuffer);
    const aesKey = await crypto.subtle.importKey(
      "raw",
      hash,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
  
    // Convert Base64 strings back to ArrayBuffers
    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    const ivBuffer = new Uint8Array(base64ToArrayBuffer(iv));
  
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: ivBuffer },
      aesKey,
      encryptedBuffer
    );
  
    // Return the plaintext as a string
    return decoder.decode(decryptedBuffer);
  }
  