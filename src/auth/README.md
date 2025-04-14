# Module d'Authentification NJI Auto Pro API

Ce module implémente un système d'authentification basé sur JWT (JSON Web Tokens) pour l'API NJI Auto Pro.

## Fonctionnalités

1. **Enregistrement d'utilisateurs** - Création de nouveaux utilisateurs dans le système
2. **Authentification** - Connexion et génération de tokens JWT
3. **Autorisation** - Protection des routes via gardes JWT et vérification des rôles
4. **Requête 'me'** - Endpoint protégé pour récupérer les informations de l'utilisateur connecté

## Structure du Module

```
auth/
├── decorators/               # Décorateurs personnalisés
│   ├── current-user.decorator.ts  # Décorateur pour extraire l'utilisateur courant
│   └── roles.decorator.ts    # Décorateur pour définir les rôles requis
├── dto/                      # Objets de transfert de données
│   ├── auth.response.ts      # DTO pour la réponse d'authentification
│   └── login.input.ts        # DTO pour les informations de connexion
├── guards/                   # Gardes d'authentification et d'autorisation
│   ├── jwt-auth.guard.ts     # Garde pour vérifier les tokens JWT
│   └── roles.guard.ts        # Garde pour vérifier les rôles utilisateur
├── strategies/               # Stratégies d'authentification
│   └── jwt.strategy.ts       # Stratégie JWT pour Passport
├── test/                     # Tests d'authentification
│   └── auth-flow.test.js     # Test du flux d'authentification complet
├── auth.module.ts            # Module d'authentification
├── auth.resolver.ts          # Résolveur GraphQL pour l'authentification
└── auth.service.ts           # Service d'authentification
```

## Requêtes GraphQL

### 1. Enregistrement d'un nouvel utilisateur

```graphql
mutation {
  register(registerInput: {
    email: "user@example.com",
    password: "user123",
    role: "user"  # Optionnel, défaut: "user"
  }) {
    access_token
    user {
      id
      email
      role
    }
  }
}
```

### 2. Connexion

```graphql
mutation {
  login(loginInput: {
    email: "user@example.com",
    password: "user123"
  }) {
    access_token
    user {
      id
      email
      role
    }
  }
}
```

### 3. Requête protégée "me"

```graphql
query {
  me {
    id
    email
    role
  }
}
```

**Note**: Cette requête nécessite un token JWT valide dans l'en-tête Authorization.

## Utilisation avec des clients HTTP

### Exemple avec fetch

```javascript
// Connexion et récupération du token
async function login(email, password) {
  const response = await fetch('https://api.njiautopro.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apollo-require-preflight': 'true'
    },
    body: JSON.stringify({
      query: `
        mutation Login($input: LoginInput!) {
          login(loginInput: $input) {
            access_token
            user {
              id
              email
              role
            }
          }
        }
      `,
      variables: {
        input: { email, password }
      }
    })
  });
  
  const data = await response.json();
  return data.data.login.access_token;
}

// Utilisation du token pour une requête protégée
async function getMyInfo(token) {
  const response = await fetch('https://api.njiautopro.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apollo-require-preflight': 'true',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        query {
          me {
            id
            email
            role
          }
        }
      `
    })
  });
  
  const data = await response.json();
  return data.data.me;
}
```

## Test du système d'authentification

Un script de test est disponible pour vérifier le bon fonctionnement du système d'authentification:

```bash
npm run test:auth
```

Ce script teste l'ensemble du flux d'authentification:
1. Enregistrement d'un nouvel utilisateur
2. Connexion et récupération d'un token
3. Utilisation du token pour accéder à la requête protégée 'me'
4. Vérification que la requête 'me' échoue sans token

## Configuration

Le système d'authentification est configuré via les variables d'environnement:

```
JWT_SECRET=votre_clé_secrète_jwt
JWT_EXPIRATION=1d  # 1 jour
```

## Sécurité

- Les mots de passe sont hachés avec bcrypt avant d'être stockés en base de données
- Les tokens JWT ont une durée de validité limitée (défaut: 1 jour)
- Les routes sensibles sont protégées par le garde JwtAuthGuard
- Les routes administratives sont protégées par le garde RolesGuard
