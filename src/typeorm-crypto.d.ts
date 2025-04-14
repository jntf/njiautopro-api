// typeorm-crypto.d.ts
// Ce fichier aide à résoudre les problèmes de typings avec crypto dans TypeORM

// Déclaration pour permettre l'accès à crypto.randomUUID
declare module '@nestjs/typeorm/dist/common/typeorm.utils' {
  const generateString: () => string;
  export { generateString };
}

// Déclaration pour éviter les erreurs liées à crypto
declare namespace NodeJS {
  interface Global {
    crypto: {
      randomUUID: () => string;
      [key: string]: any;
    };
  }
}
