export async function decryptAesGcm({
  cipherText, 
  ivKey,
  authTagB64,
  userKey
}) {
  try {
    const ciphertext = Uint8Array.from(atob(cipherText), (c) =>
      c.charCodeAt(0)
    );
    const ivBytes = Uint8Array.from(atob(ivKey), (c) => c.charCodeAt(0));
    const authTag = Uint8Array.from(atob(authTagB64), (c) => c.charCodeAt(0));
    const keyBytes = Uint8Array.from(atob(userKey), (c) => c.charCodeAt(0));

    if (ivBytes.length !== 12) {
      throw new Error(`IV length is ${ivBytes.length}, expected 12 bytes.`);
    }

    const encryptedData = new Uint8Array([
      ...new Uint8Array(ciphertext),
      ...new Uint8Array(authTag),
    ]);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes,
        tagLength: 128,
      },
      cryptoKey,
      encryptedData
    );

    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    try {
      return JSON.parse(decryptedText);
    } catch (jsonError) {
      console.warn("JSON parse error after decryption:", jsonError);
      return {};
    }
  } catch (error) {
    console.error("Decryption failed:", error);
    return {};
  }
}
