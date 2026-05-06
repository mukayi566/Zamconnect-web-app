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
            // ZamID tokens are stored as text records or URI records
            if (record.recordType === "text" || record.recordType === "url") {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              const data = textDecoder.decode(record.data);
              
              // If it's a URL (like https://zamid.gov.zm/v/TOKEN), extract the token
              if (record.recordType === "url" && data.includes('/v/')) {
                const token = data.split('/v/').pop();
                if (token) {
                  resolve(token.trim());
                  return;
                }
              }

              // Direct JWT token in text record
              if (data && data.trim().length > 20) { 
                resolve(data.trim());
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
