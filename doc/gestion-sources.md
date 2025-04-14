# Gestion des sources et commissions

Ce document détaille les fonctionnalités de gestion des sources de données et des commissions dans l'API NJI Auto Pro.

## Vue d'ensemble

L'API NJI Auto Pro permet de gérer différentes sources de données de véhicules et les paramètres financiers associés à chaque source, notamment:
- Les taux de commission
- Les frais de transport
- Les frais additionnels

Ces paramètres sont utilisés pour calculer les marges et les prix de vente des véhicules provenant de ces sources.

## Modèle de données

### Entité Source

```typescript
@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commission_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  transport_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  additional_fees: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
```

## Opérations GraphQL disponibles

### Requêtes

#### Liste des sources
Récupère la liste de toutes les sources configurées.

```graphql
query {
  sources {
    id
    name
    url
    commission_rate
    transport_fee
    additional_fees
    active
    created_at
  }
}
```

#### Détails d'une source
Récupère les détails d'une source spécifique.

```graphql
query {
  source(id: 1) {
    id
    name
    url
    commission_rate
    transport_fee
    additional_fees
    active
    created_at
  }
}
```

### Mutations

#### Création d'une source
Crée une nouvelle source de données.

```graphql
mutation {
  createSource(createSourceInput: {
    name: "MC Automobiles",
    url: "https://www.mcautomobiles.com/gestion/export/mca-stock.xml",
    commission_rate: 5.0,
    transport_fee: 150,
    additional_fees: 50,
    active: true
  }) {
    id
    name
    url
    commission_rate
  }
}
```

#### Mise à jour d'une source
Met à jour les paramètres d'une source existante.

```graphql
mutation {
  updateSource(updateSourceInput: {
    id: 1,
    commission_rate: 7.5,
    transport_fee: 200
  }) {
    id
    name
    commission_rate
    transport_fee
  }
}
```

#### Suppression d'une source
Supprime une source de données.

```graphql
mutation {
  removeSource(id: 1)
}
```

## Calculs financiers

Les paramètres financiers définis dans les sources sont utilisés pour calculer:

### Prix de vente
```
prix_vente = prix_base + (prix_base * taux_commission / 100) + frais_transport + frais_additionnels
```

### Marge brute
```
marge_brute = prix_vente - prix_base
```

### Marge nette
```
marge_nette = marge_brute - frais_transport - frais_additionnels
```

## Intégration avec le module des véhicules

Lorsqu'un véhicule est récupéré à partir d'une source, les paramètres financiers de la source sont utilisés pour:

1. Calculer automatiquement les marges
2. Proposer un prix de vente recommandé
3. Détailler les coûts associés à l'achat et la vente du véhicule

Exemple d'utilisation dans le service des véhicules:

```typescript
async calculatePricing(vehicle: Vehicle, sourceId: number): Promise<VehiclePricing> {
  const source = await this.sourcesService.findOne(sourceId);
  
  const basePrice = vehicle.price;
  const commission = basePrice * (source.commission_rate / 100);
  const transportFee = source.transport_fee;
  const additionalFees = source.additional_fees;
  
  const recommendedPrice = basePrice + commission + transportFee + additionalFees;
  const grossMargin = recommendedPrice - basePrice;
  
  return {
    basePrice,
    commission,
    transportFee,
    additionalFees,
    recommendedPrice,
    grossMargin
  };
}
```

## Accès et autorisations

Les opérations sur les sources sont protégées par l'authentification et l'autorisation:

- Tous les utilisateurs authentifiés peuvent **consulter** les sources
- Seuls les utilisateurs avec le rôle **admin** peuvent **créer**, **modifier** ou **supprimer** des sources

## Bonnes pratiques

### Mise à jour des sources

Lorsque vous modifiez les paramètres financiers d'une source, pensez à:

1. **Historisation**: Conserver un historique des changements pour comprendre l'évolution des marges
2. **Impact**: Analyser l'impact sur les véhicules déjà en stock
3. **Cohérence**: Maintenir une cohérence dans les paramètres entre sources similaires

### Ajout de nouvelles sources

Lors de l'ajout d'une nouvelle source:

1. Vérifiez la validité de l'URL et l'accessibilité de la source
2. Testez l'intégration avec quelques véhicules avant de déployer en production
3. Configurez les paramètres financiers en fonction de votre stratégie commerciale

## Exemples d'utilisation concrets

### Scénario 1: Ajustement saisonnier des commissions

```graphql
mutation {
  updateSource(updateSourceInput: {
    id: 1,
    commission_rate: 8.5,  # Augmentation temporaire
    name: "MC Automobiles (Promo Été)"
  }) {
    id
    name
    commission_rate
  }
}
```

### Scénario 2: Désactivation temporaire d'une source

```graphql
mutation {
  updateSource(updateSourceInput: {
    id: 2,
    active: false
  }) {
    id
    name
    active
  }
}
```

### Scénario 3: Calcul du prix optimal pour un lot de véhicules

```graphql
query {
  vehicles(sourceId: 1) {
    id
    brand
    model
    price
    calculatedPricing {
      recommendedPrice
      grossMargin
      marginPercentage
    }
  }
}
```

## Étendre le système

Pour étendre le système de gestion des sources et des commissions, vous pouvez:

1. Ajouter des paramètres financiers supplémentaires à l'entité Source
2. Implémenter des règles de calcul plus complexes (remises par volume, marges variables selon la catégorie)
3. Intégrer des mécanismes de synchronisation automatique avec les sources externes
4. Développer un système de rapports financiers basé sur les données des sources
