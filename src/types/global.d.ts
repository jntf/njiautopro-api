// types/global.d.ts
import * as nodeCrypto from 'crypto';

declare global {
  interface Crypto {
    randomUUID(): string;
  }

  var crypto: Crypto;
}
