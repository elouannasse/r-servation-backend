/**
 * Script de test pour vérifier la protection contre les race conditions
 * 
 * Ce script simule plusieurs utilisateurs essayant de réserver
 * le même événement en même temps
 */

const API_URL = 'http://localhost:3001';

// Tokens de test (à remplacer par de vrais tokens)
const TOKENS = [
  'token_user_1',
  'token_user_2',
  'token_user_3',
  'token_user_4',
  'token_user_5',
];

const EVENT_ID = '507f1f77bcf86cd799439011'; // ID de l'événement à tester

async function makeReservation(token: string, userId: number) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId: EVENT_ID }),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (response.ok) {
      console.log(`✅ User ${userId}: Réservation réussie (${duration}ms)`);
      return { success: true, userId, duration };
    } else {
      console.log(`❌ User ${userId}: ${data.message} (${duration}ms)`);
      return { success: false, userId, duration, error: data.message };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 User ${userId}: Erreur réseau (${duration}ms)`, error);
    return { success: false, userId, duration, error: 'Network error' };
  }
}

async function testConcurrentReservations() {
  console.log('🚀 Démarrage du test de réservations concurrentes...\n');
  console.log(`📅 Événement: ${EVENT_ID}`);
  console.log(`👥 Nombre d'utilisateurs: ${TOKENS.length}\n`);

  // Lancer toutes les réservations EN MÊME TEMPS
  const promises = TOKENS.map((token, index) => 
    makeReservation(token, index + 1)
  );

  const results = await Promise.all(promises);

  // Analyser les résultats
  console.log('\n📊 RÉSULTATS:');
  console.log('─'.repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Réussies: ${successful}`);
  console.log(`❌ Échouées: ${failed}`);
  
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  console.log(`⏱️  Durée moyenne: ${avgDuration.toFixed(0)}ms`);
  
  console.log('\n📝 Détails:');
  results.forEach(r => {
    if (r.success) {
      console.log(`  User ${r.userId}: ✅ OK`);
    } else {
      console.log(`  User ${r.userId}: ❌ ${r.error}`);
    }
  });

  // Vérifier qu'il n'y a pas de surbooking
  if (successful > 1) {
    console.log('\n⚠️  ATTENTION: Plusieurs réservations ont réussi!');
    console.log('   Cela pourrait indiquer un problème de race condition.');
  } else if (successful === 1) {
    console.log('\n✅ TEST RÉUSSI: Une seule réservation a été acceptée.');
    console.log('   La protection contre les race conditions fonctionne!');
  } else {
    console.log('\n❓ Aucune réservation réussie. Vérifiez la configuration.');
  }
}

// Fonction pour tester avec un délai aléatoire
async function testWithRandomDelay() {
  console.log('🎲 Test avec délais aléatoires...\n');
  
  const promises = TOKENS.map((token, index) => {
    const delay = Math.random() * 100; // 0-100ms de délai
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(makeReservation(token, index + 1));
      }, delay);
    });
  });

  await Promise.all(promises);
}

// Exécuter les tests
if (require.main === module) {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   TEST DE RACE CONDITIONS - RÉSERVATIONS      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  testConcurrentReservations()
    .then(() => {
      console.log('\n✨ Tests terminés!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Erreur lors des tests:', error);
      process.exit(1);
    });
}

export { testConcurrentReservations, testWithRandomDelay };
