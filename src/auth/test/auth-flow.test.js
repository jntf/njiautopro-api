/**
 * Test d'authentification complet pour l'API NJI Auto Pro
 * 
 * Ce script permet de tester l'ensemble du flux d'authentification:
 * 1. Enregistrement d'un nouvel utilisateur
 * 2. Connexion et récupération d'un token
 * 3. Utilisation du token pour accéder à la requête protégée 'me'
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

    return response.data;
  } catch (error) {
    console.error('GraphQL Error:', error.response?.data || error.message);
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
      await executeGraphQL(meQuery);
      console.log('❌ ERREUR: La requête a réussi sans token!');
    } catch (error) {
      console.log('✅ Correct! La requête a échoué sans token d\'authentification');
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
