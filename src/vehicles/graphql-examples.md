# Exemples de Requêtes GraphQL pour l'API NJI Auto Pro

Voici quelques exemples de requêtes GraphQL pour explorer l'API NJI Auto Pro avec tous les champs disponibles:

## Requête de base pour récupérer tous les véhicules

```graphql
query {
  vehicles {
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
    location
    licensePlate
    vin
    weight
    tourUrl
    expertiseUrl
    origin
    sourceId
  }
}
```

## Requête pour récupérer un véhicule spécifique avec expertise

```graphql
query {
  vehicle(id: "mc-automobiles-68587") {
    id
    brand
    model
    version
    price
    totalPrice
    year
    mileage
    features
    images
    damageImages
    expertise
    tourUrl
    expertiseUrl
  }
}
```

## Recherche avancée avec filtres

```graphql
query {
  searchVehicles(filters: {
    brand: "AUDI"
    minPrice: 20000
    maxPrice: 30000
    minYear: 2020
    fuel: "DIESEL"
  }) {
    id
    brand
    model
    version
    fuel
    year
    mileage
    price
    totalPrice
    features
    options
    images
    color
    transmission
    co2Emission
    sourceId
  }
}
```

## Requête optimisée pour affichage en liste

```graphql
query {
  vehicles {
    id
    brand
    model
    version
    year
    mileage
    price
    totalPrice
    fuel
    images
  }
}
```

## Requête pour affichage détaillé

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
