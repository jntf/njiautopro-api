# Instructions pour l'API NJI Auto Pro

J'ai implémenté la source de données MC Automobiles dans votre projet NestJS avec GraphQL. Voici les étapes pour la mettre en marche:

## 1. Installation des dépendances supplémentaires

Exécutez les commandes suivantes pour installer les dépendances nécessaires:

```bash
# Rendre le script d'installation exécutable
chmod +x install-dependencies.sh

# Exécuter le script
./install-dependencies.sh
```

Ou installez les dépendances manuellement:

```bash
npm install axios xml2js
npm install @types/xml2js --save-dev
```

## 2. Démarrage de l'API

```bash
# Démarrer en mode développement
npm run start:dev
```

## 3. Tester l'API GraphQL

Ouvrez votre navigateur et accédez à:
http://localhost:3000/graphql

Vous pourrez y tester les requêtes suivantes:

### Récupérer tous les véhicules avec leurs champs principaux
```graphql
query {
  vehicles {
    id
    brand
    model
    version
    year
    price
    totalPrice
    mileage
    fuel
    images
    features
    color
    transmission
    sourceId
  }
}
```

### Rechercher un véhicule par ID avec tous les détails
```graphql
query {
  vehicle(id: "mc-automobiles-68587") {
    id
    reference
    type
    bodyType
    brand
    model
    version
    fuel
    year
    registrationDate
    mileage
    doors
    seats
    color
    transmission
    power
    fiscalPower
    price
    vatRate
    fees
    totalPrice
    features
    missingFeatures
    options
    co2Emission
    images
    damageImages
    location
    licensePlate
    vin
    weight
    tourUrl
    expertiseUrl
    expertise
    origin
    sourceId
  }
}
```

### Rechercher des véhicules avec filtres
```graphql
query {
  searchVehicles(filters: {
    brand: "AUDI",
    minPrice: 20000,
    maxPrice: 30000
  }) {
    id
    brand
    model
    price
    year
    features
  }
}
```

## Architecture et fonctionnement

- L'API récupère les données depuis le flux XML de MC Automobiles
- Les données sont mises en cache pendant 30 minutes
- Les véhicules sont transformés en format standardisé
- L'architecture est modulaire et permet d'ajouter facilement d'autres sources

Si vous souhaitez ajouter d'autres sources de données, créez un dossier similaire dans `src/vehicles/sources/` en suivant le même modèle.

## Points d'amélioration possibles

1. Ajouter une pagination pour les grandes listes de véhicules
2. Implémenter des abonnements GraphQL pour les mises à jour en temps réel
3. Ajouter une authentification JWT avec Supabase
4. Créer d'autres sources de données

N'hésitez pas à explorer le code et à l'adapter selon vos besoins!
