# Guide de déploiement sur Railway.app

## Résolution du problème CSRF

Si vous rencontrez l'erreur suivante lors de l'accès au playground GraphQL:

```
{
  "errors": [
    {
      "message": "This operation has been blocked as a potential Cross-Site Request Forgery (CSRF). Please either specify a 'content-type' header...",
      "extensions": {
        "code": "BAD_REQUEST"
      }
    }
  ]
}
```

C'est parce qu'Apollo Server (utilisé par NestJS GraphQL) implémente des protections CSRF qui bloquent certaines requêtes du playground. Voici comment résoudre ce problème:

### 1. Modifications apportées

Nous avons modifié les fichiers suivants:

1. **app.module.ts**:
   - Ajout de la configuration CSRF personnalisée
   - Activation explicite du playground et de l'introspection
   - Configuration CORS pour Apollo Server

2. **main.ts**:
   - Configuration CORS améliorée avec les en-têtes appropriés pour Apollo
   - Support de l'origine dynamique

3. **cors-test.controller.ts**:
   - Ajout d'un point de terminaison de test pour diagnostiquer les problèmes CORS/CSRF

### 2. Redéploiement sur Railway

Pour appliquer ces modifications:

1. Commiter les changements et les pousser sur votre dépôt Git
2. Railway détectera automatiquement les changements et redéploiera l'application
3. Une fois déployé, accédez à `https://votre-app.railway.app/graphql`

### 3. Test et vérification

1. Vérifiez que le playground GraphQL est accessible et fonctionne
2. Essayez d'exécuter une requête simple:
   ```graphql
   {
     vehicles {
       id
       brand
       model
     }
   }
   ```
3. Vous pouvez également accéder à `https://votre-app.railway.app/cors-test` pour diagnostiquer les problèmes CORS

### 4. Solution alternative si le problème persiste

Si les modifications ci-dessus ne résolvent pas le problème, vous pouvez désactiver complètement la protection CSRF:

1. Nous avons créé un fichier `railway.app.module.ts` avec la protection CSRF désactivée
2. Pour l'utiliser, vous pouvez soit:
   - Remplacer le contenu de votre fichier `app.module.ts` par celui de `railway.app.module.ts`
   - Ou simplement modifier la propriété dans votre `app.module.ts` actuel:

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  // ...autres options
  csrfPrevention: false, // Désactive complètement la protection CSRF
}),
```

**Remarque de sécurité**: Désactiver la protection CSRF rend votre API plus vulnérable aux attaques CSRF. 
C'est acceptable pendant le développement ou pour des API internes, mais pour une API publique en production, 
essayez d'abord les solutions qui maintiennent la protection CSRF avant de recourir à cette option.

### 5. Configuration pour les requêtes depuis votre frontend

Si vous prévoyez d'accéder à cette API depuis votre application frontend Nuxt, assurez-vous d'inclure ces en-têtes dans vos requêtes:

```typescript
// Dans votre code Nuxt
const client = new ApolloClient({
  uri: 'https://votre-app.railway.app/graphql',
  headers: {
    'apollo-require-preflight': 'true',
  },
});
```

Ou avec fetch/axios:

```typescript
await fetch('https://votre-app.railway.app/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apollo-require-preflight': 'true',
  },
  body: JSON.stringify({
    query: `{ vehicles { id brand model } }`
  }),
});
```
