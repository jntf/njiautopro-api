# Guide GraphQL pour NJI Auto Pro API

## Principes fondamentaux de GraphQL

Contrairement à REST, GraphQL vous permet de spécifier exactement quelles données vous souhaitez récupérer. Cette flexibilité est puissante, mais vient avec quelques règles importantes:

### 1. Les champs de type objet exigent une sélection de sous-champs

Pour tout champ qui retourne un objet (non scalaire), vous **devez** spécifier quels sous-champs vous souhaitez récupérer.

#### ✅ Correct:
```graphql
{
  vehicle(id: "123") {
    id
    brand
    expertise {  # Expertise est un objet, donc on doit spécifier les sous-champs
      date_expertise
      jantes_alu
    }
  }
}
```

#### ❌ Incorrect:
```graphql
{
  vehicle(id: "123") {
    id
    brand
    expertise  # ERREUR: Vous devez spécifier quels sous-champs vous voulez
  }
}
```

### 2. Gestion des champs null ou undefined

Dans notre API, plusieurs champs sont marqués comme "nullable" (avec `{ nullable: true }`). Cela signifie que vous pouvez toujours les inclure dans votre requête, mais ils peuvent retourner `null` si les données ne sont pas disponibles.

Par exemple, tous les véhicules n'ont pas d'expertise, donc `expertise` peut être `null`:

```graphql
{
  vehicle(id: "123") {
    id
    expertise {
      date_expertise
    }
    # expertise peut être null si le véhicule n'a pas d'expertise
  }
}
```

### 3. Requêtes avec filtres

Vous pouvez filtrer les véhicules avec l'opération `searchVehicles`:

```graphql
{
  searchVehicles(filters: {
    brand: "AUDI",
    minPrice: 20000,
    maxPrice: 30000
  }) {
    id
    brand
    price
    year
  }
}
```

## Exemples d'utilisation

### Récupérer tous les véhicules avec informations de base

```graphql
{
  vehicles {
    id
    brand
    model
    version
    year
    price
    fuel
    mileage
    images
  }
}
```

### Récupérer un véhicule avec toutes ses caractéristiques

```graphql
{
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
    fees
    totalPrice
    features
    options
    images
    location
    licensePlate
    vin
    origin
  }
}
```

### Récupérer un véhicule avec expertise détaillée

```graphql
{
  vehicle(id: "mc-automobiles-68587") {
    id
    brand
    model
    expertise {
      date_expertise
      boite_motorisation
      vitres_electriques
      jantes_alu
      bluetooth
      radar_recul
      gps
      phares
    }
    expertiseUrl
    damageImages
  }
}
```

## Conseils supplémentaires

1. **N'incluez que les champs dont vous avez besoin**: Une des forces de GraphQL est que vous pouvez ne demander que les données nécessaires.

2. **Utilisez des fragments pour réutiliser des sélections**: Si vous répétez souvent les mêmes sélections de champs.

3. **Utilisez les variables pour les requêtes dynamiques**: Au lieu de construire des chaînes de requête, utilisez des variables GraphQL.

4. **Explorez le schéma dans l'interface GraphQL**: Utilisez l'explorateur de schéma dans l'interface GraphQL pour découvrir tous les champs disponibles.
