// ================================================================
// run-migration.js - Exécute la migration SQL commentaire dans conges
// ================================================================
// Usage : node scripts/run-migration.js
// ================================================================

const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  console.log("🚀 Début de la migration...");

  const sqlPath = path.join(__dirname, "..", "sql", "migration-commentaire.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  // Extrait uniquement la commande ALTER TABLE (ignorer SELECT de vérification)
  const alterSql = sql
    .split("--")[0] // Prend la première partie avant le premier commentaire
    .trim() || sql
      .split("\n")
      .filter((line) => line.trim().toUpperCase().startsWith("ALTER"))
      .join("\n");

  try {
    console.log("📦 Exécution : ALTER TABLE conges ADD COLUMN IF NOT EXISTS commentaire TEXT;");
    await pool.query("ALTER TABLE conges ADD COLUMN IF NOT EXISTS commentaire TEXT;");
    console.log("✅ Colonne 'commentaire' ajoutée avec succès !");

    // Vérification
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'conges'
      ORDER BY ordinal_position;
    `);
    console.log("\n📋 Structure de la table conges :");
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
