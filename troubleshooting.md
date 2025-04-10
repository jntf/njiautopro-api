# Guide de dépannage pour l'API NJI Auto Pro

## Problème de schéma GraphQL

Si vous rencontrez des erreurs comme "Cannot query field X on type Vehicle", c'est que le schéma GraphQL n'a pas été correctement régénéré après des modifications d'entités. Voici comment résoudre ce problème :

### 1. Nettoyer et reconstruire l'application

```bash
# Rendre le script exécutable
chmod +x restart.sh

# Exécuter le script de redémarrage
./restart.sh
```

Ce script va :
- Supprimer le dossier dist/
- Reconstruire l'application
- Redémarrer le serveur en mode développement

### 2. Vérifier manuellement le schéma

Si le problème persiste, vérifiez le contenu du fichier `src/schema.gql`. Il doit contenir tous les champs que vous avez définis dans vos entités. Si ce n'est pas le cas, vous pouvez :

1. Modifier les options de génération du schéma dans `app.module.ts` :
   ```typescript
   GraphQLModule.forRoot<ApolloDriverConfig>({
     driver: ApolloDriver,
     autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
     sortSchema: true,
     definitions: {
       skipCheck: true, // Skip checking field names
     },
   }),
   ```

2. Pour les types complexes comme `Expertise`, utilisez des propriétés spécifiques plutôt qu'un index de signature générique.

### 3. Problèmes avec les types dynamiques

GraphQL n'est pas très à l'aise avec les types dynamiques comme `[key: string]: string`. Pour les objets de type key-value, il est préférable de :

1. Définir des propriétés spécifiques pour les champs connus
2. Convertir les noms de propriétés pour qu'ils soient compatibles avec GraphQL (pas d'espaces, pas de caractères spéciaux)
3. Utiliser une approche plus structurée pour les données variables

## Problèmes avec les transformateurs

Si les données ne sont pas correctement transformées :

1. Vérifiez les fonctions de transformation dans `mc-automobiles.transformer.ts`
2. Utilisez des `console.log()` dans la méthode `refreshCache()` de `McAutomobilesSource` pour déboguer les données brutes
3. Assurez-vous que tous les champs sont correctement extraits et convertis au bon type

## Autres conseils

- Redémarrez toujours le serveur après avoir modifié des entités ou des transformateurs
- Videz le cache GraphQL du navigateur en faisant un hard refresh (Ctrl+F5)
- Vérifiez les logs du serveur pour des erreurs plus détaillées
- Si vous utilisez le playground GraphQL, utilisez l'explorateur de schéma pour voir les champs disponibles
