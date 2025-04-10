# Déploiement de NJI Auto Pro API sur Vercel

Ce document explique comment déployer l'API NestJS GraphQL sur Vercel pour une utilisation en production.

## Préparation

1. Les fichiers suivants ont été ajoutés au projet pour faciliter le déploiement Vercel:
   - `vercel.json` - Configuration de déploiement pour Vercel
   - Mise à jour de `main.ts` avec CORS activé
   - Script `vercel-build` dans package.json

2. Assurez-vous que ces changements sont commités sur votre dépôt Git avant de déployer.

## Configuration sur Vercel

Lors de l'importation du projet sur Vercel, utilisez les paramètres suivants:

### Paramètres de base
- **Framework Preset**: Other
- **Root Directory**: (laisser vide)
- **Build Command**: npm run vercel-build
- **Output Directory**: dist
- **Install Command**: npm install

### Variables d'environnement
Ajoutez ces variables d'environnement dans le dashboard Vercel:

- `NODE_ENV`: `production`

### Considérations importantes

1. **Limitations Serverless**: Vercel utilise un modèle serverless qui a certaines limitations:
   - Temps d'exécution maximum de 10s par requête (plan Hobby)
   - Pas de connexions persistantes (WebSockets non supportés)
   - L'état n'est pas conservé entre les requêtes

2. **Accès GraphQL**: Une fois déployé, votre API GraphQL sera accessible à:
   - https://votre-projet.vercel.app/graphql

3. **Mise en cache**: Dans le plan Hobby, Vercel n'offre pas de cache persistant entre les invocations de fonctions. Notre code s'adaptera automatiquement en régénérant le cache si nécessaire.

## Monitoring et dépannage

### Vérification de l'état du déploiement
1. Après déploiement, vérifiez que le playground GraphQL est accessible
2. Exécutez une requête simple pour vérifier que l'API fonctionne:
   ```graphql
   {
     vehicles {
       id
       brand
       model
     }
   }
   ```

### Problèmes courants et solutions

1. **Erreurs 504 Gateway Timeout**
   - Cause: Les requêtes prennent plus de 10 secondes (limite Vercel Hobby)
   - Solution: Optimiser les requêtes ou envisager un autre hébergement

2. **Erreurs de CORS**
   - Cause: Configuration CORS incorrecte
   - Solution: Vérifiez les paramètres CORS dans main.ts

3. **Erreurs de construction**
   - Cause: Problèmes avec les dépendances ou la configuration
   - Solution: Vérifiez les logs de build dans le dashboard Vercel

## Alternatives à Vercel

Si vous rencontrez des limitations avec Vercel pour cette API, considérez ces alternatives:

1. **Railway** - Facile à utiliser, supporte les applications serveur traditionnelles
2. **Digital Ocean App Platform** - Bon équilibre entre simplicité et puissance
3. **Heroku** - Option classique, mais plus coûteuse pour les tiers supérieurs
4. **Google Cloud Run** - Bonne option pour les workloads serverless avec des requêtes plus longues

Ces plateformes pourraient mieux convenir à une API NestJS en production à long terme.
