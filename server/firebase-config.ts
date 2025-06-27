import * as admin from "firebase-admin";

// Configuration Firebase avec les credentials fournis
const firebaseConfig = {
  type: "service_account",
  project_id: "keysystem-d0b86",
  private_key_id: "891f16479fdfc3bb953c563f244ad5bac7f5ff7f",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzbA+AcxbU7Gma\nsD069BYt3LsUujoKv5DF43UZHeNPa/5HgymsV1zufuulxkHDooVd7PF/6ERtCF9O\ngc2XUNdTUxqFST33AfeHkFwqsONMjsInu6JPdbe8LaIlmmjmprwQR03DLc3fnt8b\nidsLW1MA3YVGfS+OTHGXF5VtNp+TFlLEwUwDw9KqHoIRXrCU0k5iO4bm/HzqtzMq\nA3fLkzPl5L/QJLAV4rKUu3RCEwWacv7ygcqDsOjPmZCj3r+FCSaPmYQifiOu4iXx\ny5hTDpkscmMOobTYxscT2i5ya9+XB0T0/mYYw/rlbcuVlAg9EtLUeQprEqEnk07J\nEBFmkFRtAgMBAAECggEABsstLRZug2JuPzq0HtLWMidc+BRzFSwavbt2mBxfGodC\nyg9n2Qw3yxoILy86Fz/EoAFURZ0UVjKOdUkJ8VRQyulnJCvZSkyLRFlNfBpViPUQ\n2fNLWonhCqGJtbXKig0/Krigc6b82B5KYV8PabcsBejdXoVn8xHm7Ssp78g1M5sA\n2F80PJBMBXjK/DZyjq/4LHkeci21oYMdUMw5ZInzIHtSARYVtcVK/EwUD8kMyj8P\n7YGxedODdyRd3tEt3qGjhl57bVU1Vy5c2wYzQKp9XceN7e9IoPK8yRsLa2zN3PGy\n8QCyJvBK19+rHDFR3AvY7CtbSMZKs3IU2y62W7+GqwKBgQD7Zcmoupt1pWvnHXaZ\ngDXNTlnnPzb6BrMyhwwfACI9Rv9mA/IHzUvms/nNrNa7lohhD87JZAL3YV9JyBAW\n0pqM6wqxHkt+Yl1/vKiMeSGXGf/LmhSFvv7xOB7Mf+pRH8GQT/Amb/wM/POzsSZo\n3oBV9XgSj+CQ8vYOOdDfBVe8gwKBgQC2tPLuxhXJALGGyKLxXEFs3RJGBvmuF+Gq\nteR/+Dr95pmUJWzPmo1UnJxEvxu7uO6SEPSePVcMplB0pOtRsr2bcoXevpmi8ALd\nq2hyW6D5LBeHQn7JQSa4uxkn0V4XFInbXJ7rXGTqOorOtlJHYoXNSQbnpWNTi/br\n8DahSNW4TwKBgB6iTqqC4sK5P6bQDk2yM9wqugXVzCs3ecqkbjOw3ns9FY4m2O1e\ndOtN7xjDAP+m3kOFm5sq1rmyYdwpxtwhGbgmRA1FNcnWzrHsGVXUxOUWw/bZdbq+\nhW57ejVNOQ5dokallwv4BWzHviKdaaLJyjWvTcxlP+Yp1RXysaMbkY9lAoGADXCw\nMjpmHdwsMwMNYX3s3ipBDt+yfEkLc7hfr7498LGG+KvsHjV7Ug8XO8NnMd7/xcTz\nibRvc+HEJ2B+YwsoAYhiKqmQubi4LUBPtaHh7JJ+xJdypjFhvNMenZw8NKxxG67r\njdrFHaniziQBV3j66MgHdwDmlp3EM0T/b8vg1OcCgYEAmhyrKzpHhISuEXR7yHGK\n3PMyFmr8vpgzY8xWRWbTdfNhR42A1hhYnQpXBFopOK7I95YI7WS6i05GT9+CdsPx\nD+DUHKCCGbH9o07kbMOLeIuboiw71gGBvcz0sn4Ygfxhl5NMujVLASvLZaeMi1tq\ndOVg552MIJFsrH4l7UktSoI=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-fbsvc@keysystem-d0b86.iam.gserviceaccount.com",
  client_id: "103545005750398754258",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40keysystem-d0b86.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
} as admin.ServiceAccount;

// Initialiser Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: `https://${firebaseConfig.project_id}-default-rtdb.firebaseio.com`,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

// Collections Firestore
export const COLLECTIONS = {
  USERS: "users",
  LICENSES: "licenses",
  CONVERSATIONS: "conversations",
  USAGE_STATS: "usage_stats",
} as const;

// Utilitaires Firebase
export class FirebaseService {
  static async validateLicense(licenseKey: string) {
    try {
      const licenseRef = db.collection(COLLECTIONS.LICENSES).doc(licenseKey);
      const licenseDoc = await licenseRef.get();

      if (!licenseDoc.exists) {
        return { valid: false, error: "Licence introuvable" };
      }

      const license = licenseDoc.data();

      if (!license?.isActive) {
        return { valid: false, error: "Licence désactivée" };
      }

      if (license.expiresAt && license.expiresAt < Date.now()) {
        return { valid: false, error: "Licence expirée" };
      }

      if (license.usageCount >= license.maxUsage) {
        return { valid: false, error: "Limite d'utilisation atteinte" };
      }

      return { valid: true, license: { id: licenseDoc.id, ...license } };
    } catch (error) {
      console.error("Erreur validation licence:", error);
      return { valid: false, error: "Erreur serveur" };
    }
  }

  static async incrementUsage(licenseKey: string) {
    try {
      const licenseRef = db.collection(COLLECTIONS.LICENSES).doc(licenseKey);
      await licenseRef.update({
        usageCount: admin.firestore.FieldValue.increment(1),
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Erreur incrémentation usage:", error);
    }
  }

  static async saveConversation(userId: string, conversation: any) {
    try {
      const conversationRef = db
        .collection(COLLECTIONS.CONVERSATIONS)
        .doc(conversation.id);
      await conversationRef.set({
        ...conversation,
        userId,
        isPrivate: true,
        savedAt: Date.now(),
      });
    } catch (error) {
      console.error("Erreur sauvegarde conversation:", error);
      throw error;
    }
  }

  static async getUserConversations(userId: string) {
    try {
      const conversationsRef = db
        .collection(COLLECTIONS.CONVERSATIONS)
        .where("userId", "==", userId)
        .orderBy("updatedAt", "desc");

      const snapshot = await conversationsRef.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erreur récupération conversations:", error);
      return [];
    }
  }

  static async getUsageStats() {
    try {
      const [usersSnapshot, licensesSnapshot, conversationsSnapshot] =
        await Promise.all([
          db.collection(COLLECTIONS.USERS).get(),
          db.collection(COLLECTIONS.LICENSES).get(),
          db.collection(COLLECTIONS.CONVERSATIONS).get(),
        ]);

      const users = usersSnapshot.docs.map((doc) => doc.data());
      const licenses = licensesSnapshot.docs.map((doc) => doc.data());
      const conversations = conversationsSnapshot.docs.map((doc) => doc.data());

      // Calculer les statistiques
      const licenseTypes = {
        trial: licenses.filter((l) => l.type === "trial").length,
        basic: licenses.filter((l) => l.type === "basic").length,
        premium: licenses.filter((l) => l.type === "premium").length,
        unlimited: licenses.filter((l) => l.type === "unlimited").length,
      };

      const totalMessages = conversations.reduce(
        (sum, conv) => sum + (conv.messages?.length || 0),
        0,
      );

      return {
        totalUsers: users.length,
        activeUsers: users.filter(
          (u) => u.lastLogin > Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).length,
        totalConversations: conversations.length,
        totalMessages,
        licenseTypes,
        dailyUsage: [], // À implémenter selon les besoins
      };
    } catch (error) {
      console.error("Erreur récupération stats:", error);
      throw error;
    }
  }
}
