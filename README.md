# NJI Auto Pro API

API GraphQL pour NJI Auto Pro, permettant d'accéder aux données véhicules provenant de différentes sources.

## Démarrage

```bash
# Installation des dépendances
$ npm install

# Démarrage en mode développement
$ npm run start:dev

# Démarrage en mode production
$ npm run start:prod
```

## Fonctionnalités

### Sources de données implémentées

- **MC Automobiles** - Récupération des véhicules depuis le flux XML de MC Automobiles

### Requêtes GraphQL disponibles

- `vehicles` - Récupérer tous les véhicules
- `vehicle(id: ID!)` - Récupérer un véhicule par son ID
- `searchVehicles(filters: VehicleFilterInput)` - Rechercher des véhicules avec filtres

### Exemple de requête complète

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

## Structure du projet

Le projet suit une architecture modulaire permettant d'ajouter facilement de nouvelles sources de données:

- `src/vehicles/sources` - Contient les différentes sources de données
  - `vehicle-source.interface.ts` - Interface commune pour toutes les sources
  - `mc-automobiles/` - Implémentation de la source MC Automobiles
- `src/vehicles/entities` - Définitions des entités GraphQL
- `src/vehicles/dto` - Objets de transfert de données (inputs, filtres)

## Ajout d'une nouvelle source de données

1. Créer un dossier pour la nouvelle source dans `src/vehicles/sources/`
2. Implémenter l'interface `VehicleSource`
3. Créer un module pour la source et l'exporter
4. Ajouter la source au service `VehiclesService`

## Déploiement

L'API peut être déployée sur diverses plateformes:

- Vercel (serverless)
- Render
- Digital Ocean App Platform
- Heroku
