import "dotenv/config";
import { eq } from "drizzle-orm";
import { createDatabase } from "../src/infrastructure/db/index.js";
import { user } from "../src/infrastructure/db/schema.js";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run make-admin -- <email>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL est requis. Avez-vous configuré votre .env ?");
  process.exit(1);
}

const db = createDatabase(process.env.DATABASE_URL, process.env.DATABASE_AUTH_TOKEN);

const [found] = await db.select({ id: user.id, email: user.email, role: user.role }).from(user).where(eq(user.email, email));

if (!found) {
  console.error(`Aucun utilisateur trouvé avec l'email ${email}`);
  process.exit(1);
}

if (found.role === "admin") {
  console.log(`L'utilisateur ${email} est déjà administrateur.`);
  process.exit(0);
}

await db.update(user).set({ role: "admin" }).where(eq(user.email, email));

console.log(`L'utilisateur ${email} a été promu administrateur.`);
