// ================================================================
// run-migration-limite.js - Ajoute l'heure limite de pointage
// ================================================================
// Usage : node scripts/run-migration-limite.js
// ================================================================

const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  console.log("🚀 Début de la migration (heure limite de pointage)...");

  const sqlPath = path.join(__dirname, "..", "sql", "migration-limite-pointage.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  // Extrait uniquement les commandes ALTER TABLE (ignorer commentaires/SELECT)
  const alterSql = sql
    .split("\n")
    .filter((line) => line.trim().toUpperCase().startsWith("ALTER"))
    .join("\n");

  try {
    console.log("📦 Exécution :");
    console.log(alterSql);
    await pool.query(alterSql);
    console.log("✅ Colonnes 'limite_pointage' et 'heure_limite_pointage' ajoutées !");

    // Vérification
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'parametres'
        AND column_name IN ('limite_pointage', 'heure_limite_pointage')
      ORDER BY ordinal_position;
    `);
    console.log("\n📋 Vérification :");
    console.table(result.rows);

    console.log("\n✅ Migration terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la migration :", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
