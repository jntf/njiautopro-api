# Guide d'authentification et d'autorisation

Ce document explique en détail le système d'authentification et d'autorisation implémenté dans l'API NJI Auto Pro.

## Vue d'ensemble

L'API NJI Auto Pro utilise un système d'authentification basé sur JWT (JSON Web Tokens) pour sécuriser l'accès à ses ressources. Certaines routes sont protégées et ne sont accessibles qu'aux utilisateurs authentifiés, tandis que d'autres nécessitent des droits d'administrateur.

## Configuration

Le système d'authentification est configuré via les variables d'environnement suivantes:

```
JWT_SECRET=votre_clé_secrète
JWT_EXPIRATION=1d
```

- `JWT_SECRET`: Clé utilisée pour signer et vérifier les tokens JWT
- `JWT_EXPIRATION`: Durée de validité des tokens (1d = 1 jour, 1h = 1 heure, etc.)

## Enregistrement et connexion

L'API expose deux mutations GraphQL pour l'enregistrement et la connexion des utilisateurs:

### Enregistrement d'un nouvel utilisateur

```graphql
mutation {
  register(registerInput: {
    email: "user@example.com",
    password: "password123"
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

Remarque: Seul un utilisateur administrateur peut créer un nouvel utilisateur de type "admin".

### Connexion

```graphql
mutation {
  login(loginInput: {
    email: "user@example.com",
    password: "password123"
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

Les deux mutations retournent:
- `access_token`: Token JWT à utiliser pour les requêtes authentifiées
- `user`: Informations sur l'utilisateur (id, email, rôle)

## Utilisation du token JWT

Une fois obtenu, le token JWT doit être inclus dans l'en-tête `Authorization` de chaque requête nécessitant une authentification:

```
Authorization: Bearer votre_token_jwt
```

### Dans le playground GraphQL

Pour tester une requête authentifiée dans le playground GraphQL:

1. Cliquez sur l'onglet "HTTP HEADERS" en bas du playground
2. Ajoutez l'en-tête:
   ```json
   {
     "Authorization": "Bearer votre_token_jwt"
   }
   ```

### Dans une application cliente

```javascript
// Exemple avec fetch
fetch('https://votre-api.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: `
      query {
        sources {
          id
          name
        }
      }
    `
  })
})
```

## Accès à la documentation

La documentation de l'API est protégée par l'authentification JWT. Pour y accéder:

1. Obtenez un token JWT via la mutation `login`
2. Accédez à `/documentation` avec l'en-tête `Authorization: Bearer votre_token_jwt`

Endpoints documentation disponibles:
- `/documentation`: Documentation principale (README)
- `/documentation/list`: Liste des documents disponibles
- `/documentation/:filename`: Document spécifique par nom de fichier

## Gestion des rôles

L'API implémente un système de rôles avec deux niveaux principaux:
- `user`: Accès de base aux ressources de l'API
- `admin`: Accès complet y compris les fonctions administratives

Certaines routes et requêtes GraphQL sont protégées avec le décorateur `@Roles`:

```typescript
@Mutation(() => Source)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
createSource(@Args('createSourceInput') createSourceInput: CreateSourceInput) {
  return this.sourcesService.create(createSourceInput);
}
```

## Créer un utilisateur administrateur

Un script est fourni pour créer facilement un utilisateur administrateur:

```bash
npm run create:admin
```

Ce script crée un utilisateur avec:
- Email: `admin@njiautopro.com`
- Mot de passe: `admin123`
- Rôle: `admin`

## Endpoints restreints

Voici la liste des opérations qui nécessitent une authentification et/ou des privilèges administrateur:

### Gestion des utilisateurs (admin uniquement)
- `createUser`: Créer un nouvel utilisateur
- `users`: Liste des utilisateurs
- `user`: Détails d'un utilisateur

### Gestion des sources (admin uniquement)
- `createSource`: Créer une nouvelle source
- `updateSource`: Mettre à jour une source
- `removeSource`: Supprimer une source

### Gestion des sources (authentification requise)
- `sources`: Liste des sources
- `source`: Détails d'une source

### Documentation (authentification requise)
- `GET /documentation`: Documentation principale
- `GET /documentation/list`: Liste des documents
- `GET /documentation/:filename`: Document spécifique

## Déboguer les problèmes d'authentification

Si vous rencontrez des problèmes d'authentification:

1. Vérifiez que le token JWT est valide et n'a pas expiré
2. Assurez-vous que l'en-tête `Authorization` est correctement formaté (`Bearer votre_token`)
3. Vérifiez que l'utilisateur a les droits nécessaires pour l'opération demandée
4. Consultez les logs du serveur pour plus d'informations sur l'erreur spécifique

Pour les besoins de développement, vous pouvez temporairement désactiver l'authentification en commentant les décorateurs `@UseGuards` et `@Roles` dans les contrôleurs et résolveurs concernés.
