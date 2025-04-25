# Exemples de requêtes GraphQL pour le système de publications

Ce document présente des exemples pratiques de requêtes GraphQL pour interagir avec le système de publications de véhicules de l'API NJI Auto Pro.

## Requêtes pour la gestion des publications

### 1. Récupérer toutes les publications (admin uniquement)

Cette requête permet aux administrateurs de voir toutes les publications de véhicules, qu'elles soient actives ou non.

```graphql
query GetAllPublications {
  publications {
    id
    vehicle_id
    internal_id
    published
    price_override
    discount
    created_at
    updated_at
    source {
      id
      name
    }
    interest {
      view_count
      favorite_count
      contact_count
      last_view_at
    }
  }
}
```

### 2. Récupérer uniquement les véhicules publiés

Cette requête, accessible à tous, permet de récupérer uniquement les véhicules marqués comme publiés.

```graphql
query GetPublishedVehicles {
  publishedVehicles {
    id
    vehicle_id
    internal_id
    price_override
    discount
    source {
      id
      name
    }
    interest {
      view_count
      favorite_count
    }
  }
}
```

### 3. Récupérer une publication par son identifiant interne

```graphql
query GetPublicationByInternalId {
  publicationByInternalId(internalId: "550e8400-e29b-41d4-a716-446655440000") {
    id
    vehicle_id
    internal_id
    price_override
    discount
    price_history {
      price
      date
    }
    interest {
      view_count
      favorite_count
      contact_count
      last_view_at
    }
  }
}
```

### 4. Récupérer les identifiants des véhicules publiés

Cette requête est particulièrement utile pour filtrer les véhicules dans une interface utilisateur.

```graphql
query GetPublishedVehicleIds {
  publishedVehicleIds {
    vehicleIds
  }
}
```

## Mutations pour la gestion des publications

### 1. Publier un véhicule (admin uniquement)

```graphql
mutation PublishVehicle {
  publishVehicle(
    vehicleId: "mc-automobiles-12345",
    sourceId: 1,
    priceOverride: 25000,
    discount: 5.0
  ) {
    id
    internal_id
    published
    price_override
    discount
  }
}
```

### 2. Dépublier un véhicule (admin uniquement)

```graphql
mutation UnpublishVehicle {
  unpublishVehicle(publicationId: 1) {
    id
    vehicle_id
    published
  }
}
```

### 3. Mettre à jour le prix d'une publication (admin uniquement)

```graphql
mutation UpdatePublicationPrice {
  updatePublicationPrice(
    publicationId: 1,
    priceOverride: 24500
  ) {
    id
    price_override
    price_history {
      price
      date
    }
  }
}
```

### 4. Mettre à jour la remise d'une publication (admin uniquement)

```graphql
mutation UpdatePublicationDiscount {
  updatePublicationDiscount(
    publicationId: 1,
    discount: 7.5
  ) {
    id
    discount
  }
}
```

### 5. Suivre l'intérêt des utilisateurs

Ces mutations permettent de suivre les interactions des utilisateurs avec les véhicules publiés.

```graphql
# Enregistrer une vue
mutation TrackView {
  trackVehicleView(internalId: "550e8400-e29b-41d4-a716-446655440000")
}

# Enregistrer un ajout aux favoris
mutation TrackFavorite {
  trackVehicleFavorite(internalId: "550e8400-e29b-41d4-a716-446655440000")
}

# Enregistrer une demande de contact
mutation TrackContact {
  trackVehicleContact(internalId: "550e8400-e29b-41d4-a716-446655440000")
}
```

## Intégration du système de publications avec le frontend

### Exemple 1: Afficher uniquement les véhicules publiés

Cette approche permet de filtrer les véhicules pour n'afficher que ceux qui sont publiés.

```javascript
// Avec Apollo Client
import { useQuery, gql } from '@apollo/client';

// 1. D'abord, récupérer les IDs des véhicules publiés
const GET_PUBLISHED_IDS = gql`
  query {
    publishedVehicleIds {
      vehicleIds
    }
  }
`;

// 2. Ensuite, récupérer tous les véhicules
const GET_ALL_VEHICLES = gql`
  query {
    vehicles {
      id
      brand
      model
      price
      images
    }
  }
`;

function VehiclesList() {
  const { data: publishedIds } = useQuery(GET_PUBLISHED_IDS);
  const { data: allVehicles, loading, error } = useQuery(GET_ALL_VEHICLES);
  
  // Filtrer pour n'afficher que les véhicules publiés
  const vehicles = useMemo(() => {
    if (!allVehicles?.vehicles || !publishedIds?.publishedVehicleIds?.vehicleIds) {
      return [];
    }
    
    const ids = publishedIds.publishedVehicleIds.vehicleIds;
    return allVehicles.vehicles.filter(vehicle => ids.includes(vehicle.id));
  }, [allVehicles, publishedIds]);
  
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;
  
  return (
    <div>
      {vehicles.map(vehicle => (
        <div key={vehicle.id} className="vehicle-card">
          <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} />
          <h3>{vehicle.brand} {vehicle.model}</h3>
          <p>{vehicle.price} €</p>
        </div>
      ))}
    </div>
  );
}
```

### Exemple 2: Utiliser les prix personnalisés et remises

Cette approche permet d'afficher le prix personnalisé et la remise pour un véhicule publié.

```javascript
import { useQuery, gql } from '@apollo/client';

const GET_VEHICLE_WITH_PUBLICATION = gql`
  query GetVehicleWithPublication($id: ID!, $internalId: ID!) {
    vehicle(id: $id) {
      id
      brand
      model
      price
      images
    }
    publicationByInternalId(internalId: $internalId) {
      price_override
      discount
    }
  }
`;

function VehicleDetail({ id, internalId }) {
  const { data, loading, error } = useQuery(GET_VEHICLE_WITH_PUBLICATION, {
    variables: { id, internalId }
  });
  
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;
  
  const vehicle = data.vehicle;
  const publication = data.publicationByInternalId;
  
  // Calculer le prix final en tenant compte du prix personnalisé et de la remise
  const basePrice = publication?.price_override || vehicle.price;
  const finalPrice = publication?.discount 
    ? Math.round(basePrice * (1 - publication.discount / 100)) 
    : basePrice;
  
  // Afficher le prix barré si une remise est appliquée
  const showStrikePrice = publication?.discount && publication.discount > 0;
  
  return (
    <div className="vehicle-detail">
      <h1>{vehicle.brand} {vehicle.model}</h1>
      <div className="vehicle-images">
        {vehicle.images.map((img, index) => (
          <img key={index} src={img} alt={`Vue ${index+1} du véhicule`} />
        ))}
      </div>
      
      <div className="vehicle-price">
        {showStrikePrice && (
          <span className="original-price">{basePrice} €</span>
        )}
        <span className="final-price">{finalPrice} €</span>
        {showStrikePrice && (
          <span className="discount-badge">-{publication.discount}%</span>
        )}
      </div>
      
      {/* Autres détails du véhicule */}
    </div>
  );
}
```

### Exemple 3: Suivi des interactions utilisateurs

Ce composant montre comment suivre les vues, les favoris et les contacts.

```javascript
import { useMutation, gql } from '@apollo/client';
import { useEffect } from 'react';

const TRACK_VIEW = gql`
  mutation TrackVehicleView($internalId: ID!) {
    trackVehicleView(internalId: $internalId)
  }
`;

const TRACK_FAVORITE = gql`
  mutation TrackVehicleFavorite($internalId: ID!) {
    trackVehicleFavorite(internalId: $internalId)
  }
`;

const TRACK_CONTACT = gql`
  mutation TrackVehicleContact($internalId: ID!) {
    trackVehicleContact(internalId: $internalId)
  }
`;

function VehicleActions({ internalId }) {
  const [trackView] = useMutation(TRACK_VIEW);
  const [trackFavorite] = useMutation(TRACK_FAVORITE);
  const [trackContact] = useMutation(TRACK_CONTACT);
  
  // Suivre une vue lorsque le composant est monté
  useEffect(() => {
    trackView({ variables: { internalId } });
  }, [internalId, trackView]);
  
  const handleAddToFavorites = () => {
    trackFavorite({ variables: { internalId } });
    // Logique pour ajouter aux favoris
  };
  
  const handleContactSeller = () => {
    trackContact({ variables: { internalId } });
    // Logique pour afficher le formulaire de contact
  };
  
  return (
    <div className="vehicle-actions">
      <button onClick={handleAddToFavorites} className="favorite-btn">
        <i className="heart-icon"></i> Ajouter aux favoris
      </button>
      
      <button onClick={handleContactSeller} className="contact-btn">
        <i className="phone-icon"></i> Contacter le vendeur
      </button>
    </div>
  );
}
```

### Exemple 4: Tableau de bord administrateur pour les publications

Ce composant montre comment implémenter un tableau de bord simple pour gérer les publications.

```javascript
import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';

const GET_PUBLICATIONS = gql`
  query {
    publications {
      id
      vehicle_id
      internal_id
      published
      price_override
      discount
      interest {
        view_count
        favorite_count
        contact_count
      }
    }
  }
`;

const PUBLISH_VEHICLE = gql`
  mutation PublishVehicle($vehicleId: String!, $sourceId: ID!, $priceOverride: Int, $discount: Float) {
    publishVehicle(vehicleId: $vehicleId, sourceId: $sourceId, priceOverride: $priceOverride, discount: $discount) {
      id
      published
    }
  }
`;

const UNPUBLISH_VEHICLE = gql`
  mutation UnpublishVehicle($publicationId: ID!) {
    unpublishVehicle(publicationId: $publicationId) {
      id
      published
    }
  }
`;

function PublicationsAdmin() {
  const { data, loading, error, refetch } = useQuery(GET_PUBLICATIONS);
  const [publishVehicle] = useMutation(PUBLISH_VEHICLE);
  const [unpublishVehicle] = useMutation(UNPUBLISH_VEHICLE);
  
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [sourceId, setSourceId] = useState(1);
  const [priceOverride, setPriceOverride] = useState('');
  const [discount, setDiscount] = useState('');
  
  const handlePublish = async () => {
    if (!selectedVehicleId) return;
    
    await publishVehicle({
      variables: {
        vehicleId: selectedVehicleId,
        sourceId,
        priceOverride: priceOverride ? parseInt(priceOverride) : undefined,
        discount: discount ? parseFloat(discount) : undefined
      }
    });
    
    refetch();
  };
  
  const handleUnpublish = async (publicationId) => {
    await unpublishVehicle({
      variables: { publicationId }
    });
    
    refetch();
  };
  
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;
  
  return (
    <div className="admin-panel">
      <h1>Gestion des publications</h1>
      
      <div className="publish-form">
        <h2>Publier un véhicule</h2>
        <div>
          <label>ID du véhicule:</label>
          <input 
            type="text" 
            value={selectedVehicleId} 
            onChange={(e) => setSelectedVehicleId(e.target.value)} 
            placeholder="mc-automobiles-12345"
          />
        </div>
        <div>
          <label>Source ID:</label>
          <input 
            type="number" 
            value={sourceId} 
            onChange={(e) => setSourceId(parseInt(e.target.value))} 
          />
        </div>
        <div>
          <label>Prix personnalisé (optionnel):</label>
          <input 
            type="number" 
            value={priceOverride} 
            onChange={(e) => setPriceOverride(e.target.value)} 
            placeholder="25000"
          />
        </div>
        <div>
          <label>Remise en % (optionnel):</label>
          <input 
            type="number" 
            value={discount} 
            onChange={(e) => setDiscount(e.target.value)} 
            placeholder="5.0"
          />
        </div>
        <button onClick={handlePublish}>Publier</button>
      </div>
      
      <div className="publications-list">
        <h2>Publications existantes</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Véhicule ID</th>
              <th>Publié</th>
              <th>Prix</th>
              <th>Remise</th>
              <th>Vues</th>
              <th>Favoris</th>
              <th>Contacts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.publications.map(pub => (
              <tr key={pub.id}>
                <td>{pub.id}</td>
                <td>{pub.vehicle_id}</td>
                <td>{pub.published ? '✅' : '❌'}</td>
                <td>{pub.price_override || 'Default'}</td>
                <td>{pub.discount ? `${pub.discount}%` : '-'}</td>
                <td>{pub.interest?.view_count || 0}</td>
                <td>{pub.interest?.favorite_count || 0}</td>
                <td>{pub.interest?.contact_count || 0}</td>
                <td>
                  {pub.published ? (
                    <button onClick={() => handleUnpublish(pub.id)}>Dépublier</button>
                  ) : (
                    <button onClick={() => handlePublish(pub.vehicle_id, pub.id)}>Republier</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Exemples avec variables GraphQL

### Publication avec variables

```graphql
mutation PublishVehicleWithVariables($vehicleId: String!, $sourceId: ID!, $priceOverride: Int, $discount: Float) {
  publishVehicle(
    vehicleId: $vehicleId,
    sourceId: $sourceId,
    priceOverride: $priceOverride,
    discount: $discount
  ) {
    id
    internal_id
    published
    price_override
    discount
  }
}
```

Variables:
```json
{
  "vehicleId": "mc-automobiles-12345",
  "sourceId": 1,
  "priceOverride": 25000,
  "discount": 5.0
}
```

### Recherche de publication avec variables

```graphql
query GetPublicationWithVariables($internalId: ID!) {
  publicationByInternalId(internalId: $internalId) {
    id
    vehicle_id
    price_override
    discount
    interest {
      view_count
      favorite_count
      contact_count
    }
  }
}
```

Variables:
```json
{
  "internalId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Bonnes pratiques

1. **Utilisez les IDs internes** pour les références publiques aux véhicules (URLs, partages, etc.)
2. **Suivez systématiquement les vues** dès qu'un véhicule est affiché
3. **Traitez correctement les remises** en affichant à la fois le prix barré et le prix final
4. **Rafraîchissez la liste des publications** après chaque opération de publication/dépublication
5. **Pensez à gérer les erreurs** qui peuvent survenir lors des opérations de suivi

## Résolution de problèmes courants

### Publication non visible

Si une publication n'apparaît pas après avoir été créée, vérifiez:
- Que le champ `published` est bien à `true`
- Que vous utilisez le bon ID source
- Que le véhicule existe bien dans la source spécifiée

### Erreurs lors du suivi des interactions

Si les statistiques d'intérêt ne s'incrémentent pas:
- Vérifiez que vous utilisez le bon ID interne
- Assurez-vous que la publication existe
- Vérifiez que les mutations sont correctement exécutées (avec les bons paramètres)

### Prix incorrects

Si les prix affichés sont incorrects:
- Vérifiez la priorité d'application des prix (override > original)
- Assurez-vous que la remise est correctement appliquée (pourcentage)
- Vérifiez que les conversions de types sont correctes (string -> number)
