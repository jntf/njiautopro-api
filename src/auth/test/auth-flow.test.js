/**
 * Test d'authentification complet pour l'API NJI Auto Pro
 * 
 * Ce script permet de tester l'ensemble du flux d'authentification:
 * 1. Enregistrement d'un nouvel utilisateur
 * 2. Connexion et récupération d'un token
 * 3. Utilisation du token pour accéder à la requête protégée 'me'
 * 4. Vérification que la requête 'me' échoue sans token
 * 
 * NOTE IMPORTANTE SUR LE TEST 4:
 * La version précédente du test ne détectait pas correctement l'erreur GraphQL
 * renvoyée par le serveur lorsque l'authentification échouait. Le test affichait
 * à tort "La requête a réussi sans token" et "Tous les tests ont réussi", 
 * alors qu'en réalité le backend refusait bien l'accès (erreur 401 Unauthorized).
 * Cette correction permet de capturer et interpréter correctement les erreurs
 * d'authentification GraphQL.
 * 
 * Pour exécuter ce script, utilisez:
 * node src/auth/test/auth-flow.test.js
 * 
 * Assurez-vous que votre API est en cours d'exécution sur localhost:3000
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/graphql';
const TEST_USER = {
  email: `test-user-${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

// Fonction utilitaire pour effectuer des requêtes GraphQL
async function executeGraphQL(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'apollo-require-preflight': 'true',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        query,
        variables,
      },
      { headers }
    );

    // Vérifier si la réponse GraphQL contient des erreurs
    if (response.data.errors) {
      const errorMessages = response.data.errors.map(err => {
        const code = err.extensions?.code || 'UNKNOWN';
        return `${err.message} (Code: ${code})`;
      }).join(', ');
      
      throw new Error(`GraphQL Errors: ${errorMessages}`);
    }

    return response.data;
  } catch (error) {
    // Déterminer si l'erreur vient d'une réponse HTTP (comme 401, 403)
    if (error.response) {
      console.error('Erreur HTTP:', error.response.status, error.response.statusText);
      console.error('Détails:', error.response.data);
      throw new Error(`Erreur HTTP ${error.response.status}: ${error.response.statusText}`);
    }
    
    // Erreur réseau ou autre
    console.error('GraphQL Error:', error.message);
    throw error;
  }
}

// Test du flux d'authentification complet
async function testAuthFlow() {
  console.log('🧪 Démarrage du test du flux d\'authentification');
  console.log('---------------------------------------------');

  try {
    // 1. Enregistrement d'un nouvel utilisateur
    console.log(`👤 Création d'un utilisateur de test: ${TEST_USER.email}`);
    const registerQuery = `
      mutation Register($input: CreateUserInput!) {
        register(registerInput: $input) {
          access_token
          user {
            id
            email
            role
          }
        }
      }
    `;

    const registerResult = await executeGraphQL(registerQuery, {
      input: TEST_USER,
    });

    if (registerResult.errors) {
      throw new Error(`Erreur lors de l'enregistrement: ${JSON.stringify(registerResult.errors)}`);
    }

    const registerData = registerResult.data.register;
    console.log('✅ Utilisateur créé avec succès');
    console.log(`📝 Détails: ID=${registerData.user.id}, Email=${registerData.user.email}, Role=${registerData.user.role}`);
    console.log(`🔑 Token JWT obtenu: ${registerData.access_token.substring(0, 15)}...`);
    console.log('---------------------------------------------');

    // 2. Connexion de l'utilisateur
    console.log('🔐 Test de connexion avec l\'utilisateur créé');
    const loginQuery = `
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
    `;

    const loginResult = await executeGraphQL(loginQuery, {
      input: {
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    });

    if (loginResult.errors) {
      throw new Error(`Erreur lors de la connexion: ${JSON.stringify(loginResult.errors)}`);
    }

    const loginData = loginResult.data.login;
    const token = loginData.access_token;
    console.log('✅ Connexion réussie');
    console.log(`🔑 Nouveau token JWT: ${token.substring(0, 15)}...`);
    console.log('---------------------------------------------');

    // 3. Requête protégée 'me'
    console.log('🛡️  Test de la requête protégée "me" avec le token JWT');
    const meQuery = `
      query {
        me {
          id
          email
          role
        }
      }
    `;

    const meResult = await executeGraphQL(meQuery, {}, token);

    if (meResult.errors) {
      throw new Error(`Erreur lors de la requête "me": ${JSON.stringify(meResult.errors)}`);
    }

    const meData = meResult.data.me;
    console.log('✅ Requête "me" réussie');
    console.log(`📝 Données utilisateur: ID=${meData.id}, Email=${meData.email}, Role=${meData.role}`);
    console.log('---------------------------------------------');

    // 4. Test sans token (devrait échouer)
    console.log('🔒 Test de la requête "me" sans token (doit échouer)');
    try {
      const meResultWithoutToken = await executeGraphQL(meQuery);
      
      // Si on arrive ici, la requête a réussi sans token - c'est une erreur
      console.log('❌ ERREUR: La requête a réussi sans token!');
      console.log(`Données reçues: ${JSON.stringify(meResultWithoutToken)}`);
      throw new Error('La requête protégée "me" a réussi sans token d\'authentification!');
    } catch (error) {
      // Vérifier si l'erreur est due à un problème d'authentification (401)
      if (error.message.includes('La requête protégée "me" a réussi sans token')) {
        throw error; // Relancer cette erreur spécifique
      } else if (error.message.includes('Erreur HTTP 401') || 
                 error.message.includes('Unauthorized') || 
                 error.message.includes('UNAUTHENTICATED')) {
        // C'est le comportement attendu - la requête doit échouer sans token
        console.log('✅ Correct! La requête a échoué sans token d\'authentification');
      } else {
        // Une autre erreur s'est produite
        console.log(`⚠️ La requête a échoué, mais pour une raison inattendue: ${error.message}`);
        throw new Error(`Test échoué pour une raison inattendue: ${error.message}`);
      }
    }
    console.log('---------------------------------------------');

    console.log('🎉 Tous les tests ont réussi!');
    return true;
  } catch (error) {
    console.error('❌ Erreur pendant les tests:', error.message);
    console.error('Détails:', error.response?.data || error);
    return false;
  }
}

// Exécuter le test
testAuthFlow()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Erreur inattendue:', error);
    process.exit(1);
  });
