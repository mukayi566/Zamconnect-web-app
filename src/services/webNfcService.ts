/**
 * webNfcService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Web NFC read helpers for the ZamID physical card.
 * 
 * Note: This API is currently experimental and primarily supported in Chrome 
 * on Android. It requires HTTPS and user interaction to initiate.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const webNfcService = {
  /** Check if Web NFC is supported by the browser. */
  isSupported(): boolean {
    return 'NDEFReader' in window;
  },

  /** 
   * Starts an NFC scan session.
   * Returns a promise that resolves with the JWT token when a card is scanned.
   */
  async scanCard(): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Web NFC is not supported by this browser. Please use Chrome on Android.');
    }

    try {
      // @ts-ignore - NDEFReader is experimental
      const reader = new NDEFReader();
      await reader.scan();

      return new Promise((resolve, reject) => {
        reader.onreadingerror = () => {
          reject(new Error('Cannot read data from the NFC tag. Try another one?'));
        };

        reader.onreading = (event: any) => {
          const { message } = event;
          
          for (const record of message.records) {
            // ZamID tokens are stored as text records
            if (record.recordType === "text") {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              const token = textDecoder.decode(record.data);
              if (token && token.trim().length > 0) {
                resolve(token.trim());
                return;
              }
            }
          }
          
          reject(new Error('No valid identity token found on this card.'));
        };
      });
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error('NFC permission was denied.');
      }
      throw new Error(error.message || 'NFC scan failed.');
    }
  }
};
