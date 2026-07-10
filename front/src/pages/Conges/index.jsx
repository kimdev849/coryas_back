// ================================================================
// Page Conges - Demandes de conges
// ================================================================
// L'admin peut ajouter un conge pour n'importe quel employe.
// Les employes creent leurs propres demandes.
// Les admins/RH peuvent approuver ou rejeter.
// ================================================================

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import congesService from "../../services/congesService";
import employesService from "../../services/employesService";
import "./style.css";

function Conges() {
  const { user } = useAuth();
  // Si le role est Admin ou RH, on peut voir la liste des employes
  const estAdmin = user?.role === "Administrateur" || user?.role === "RH" || user?.role === "Directeur";

  const [formData, setFormData] = useState({
    employe_id: "",  // ID de l'employe (admin peut choisir)
    dateDebut: "",
    dateFin: "",
    raison: "",
  });

  const [employes, setEmployes] = useState([]); // Liste des employes (pour admin)
  const [listConges, setListConges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState("Tous");

  useEffect(() => {
    handleLoadConges();
    if (estAdmin) {
      loadEmployes();
    }
  }, []);

  // Charge la liste des employes (pour le select admin)
  const loadEmployes = async () => {
    try {
      const res = await employesService.getAll();
      setEmployes(res.data || []);
    } catch (err) {
      console.error("Erreur chargement employes:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Pour l'admin, l'employe doit etre selectionne
    if (estAdmin && !formData.employe_id) {
      setMessage("Veuillez selectionner un employe !");
      setMessageType("error");
      return;
    }

    if (!formData.dateDebut || !formData.dateFin || !formData.raison) {
      setMessage("Veuillez remplir tous les champs !");
      setMessageType("error");
      return;
    }

    if (new Date(formData.dateFin) < new Date(formData.dateDebut)) {
      setMessage("La date de fin doit etre apres la date de debut !");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      // Si l'admin a choisi un employe, on l'envoie
      // Sinon, le backend prendra l'employe_id du JWT
      const payload = {
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        raison: formData.raison,
      };
      if (estAdmin) {
        payload.employe_id = formData.employe_id;
      }

      const result = await congesService.creerDemande(payload);
      setMessage(result.message || "Demande creee avec succes !");
      setMessageType("success");

      setFormData({ employe_id: "", dateDebut: "", dateFin: "", raison: "" });
      setTimeout(() => setShowForm(false), 1500);
      await handleLoadConges();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Erreur : impossible de creer la demande");
      setMessageType("error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadConges = async () => {
    setIsLoading(true);
    try {
      const result = await congesService.getAllConges();
      const normalized = (result.data || []).map((c) => ({
        ...c,
        dateDebut: c.date_debut,
        dateFin: c.date_fin,
        raison: c.motif || c.raison,
        nombreJours: c.nombre_jours || calcJours(c.date_debut, c.date_fin),
      }));
      setListConges(normalized);
    } catch (error) {
      setMessage("Erreur lors du chargement des conges");
      setMessageType("error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calcJours = (debut, fin) => {
    if (!debut || !fin) return "-";
    const d1 = new Date(debut);
    const d2 = new Date(fin);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff + " jour(s)" : "-";
  };

  const handleAppouverConge = async (id) => {
    try {
      const result = await congesService.appouverConge(id);
      setMessage(result.message || "Demande approuvee !");
      setMessageType("success");
      await handleLoadConges();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Erreur lors de l'approbation");
      setMessageType("error");
    }
  };

  const handleRejeterConge = async (id) => {
    const commentaire = prompt("Motif du rejet :");
    if (commentaire !== null) {
      try {
        const result = await congesService.rejeterConge(id, commentaire);
        setMessage(result.message || "Demande rejetee !");
        setMessageType("success");
        await handleLoadConges();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("Erreur lors du rejet");
        setMessageType("error");
      }
    }
  };

  const handleSupprimerDemande = async (id) => {
    if (window.confirm("Etes-vous sur de vouloir supprimer cette demande ?")) {
      try {
        const result = await congesService.supprimerDemande(id);
        setMessage(result.message || "Demande supprimee !");
        setMessageType("success");
        await handleLoadConges();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("Erreur lors de la suppression");
        setMessageType("error");
      }
    }
  };

  const formatStatutClass = (statut) => {
    return statut === "En attente" ? "en-attente" : statut;
  };

  const filteredConges = filtreStatut === "Tous"
    ? listConges
    : listConges.filter((c) => c.statut === filtreStatut);

  return (
    <div>
      <h1 className="page-title">Gestion des Conges</h1>
      <p className="page-description">
        Demandez vos conges et suivez le statut de vos demandes.
      </p>

      {message && (
        <div className={"conges-message conges-message-" + messageType}>
          {message}
        </div>
      )}

      <div className="conges-header">
        <button
          className="conges-btn-new"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Fermer" : "+ Nouvelle demande"}
        </button>
        <button className="conges-btn-reload" onClick={handleLoadConges}>
          Recharger
        </button>
      </div>

      {showForm && (
        <div className="conges-form-container">
          <h2>Nouvelle demande de conge</h2>
          <form onSubmit={handleSubmitForm} className="conges-form">

            {/* Si l'utilisateur est admin, il peut choisir l'employe */}
            {estAdmin && (
              <div className="conges-form-group">
                <label htmlFor="employe_id">Employé *</label>
                <select
                  id="employe_id"
                  name="employe_id"
                  value={formData.employe_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Selectionner un employé --</option>
                  {employes.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.prenom} {emp.nom} — {emp.departement_nom || "—"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="conges-form-group">
              <label htmlFor="dateDebut">Date de debut *</label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="conges-form-group">
              <label htmlFor="dateFin">Date de fin *</label>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="conges-form-group">
              <label htmlFor="raison">Motif du conge *</label>
              <select
                id="raison"
                name="raison"
                value={formData.raison}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Selectionner un motif --</option>
                <option value="Conge annuel">Conge annuel</option>
                <option value="Maladie">Maladie</option>
                <option value="Mariage">Mariage</option>
                <option value="Naissance">Naissance</option>
                <option value="Deces">Deces</option>
                <option value="Conge sans solde">Conge sans solde</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="conges-form-actions">
              <button type="submit" className="conges-btn-submit" disabled={isLoading}>
                {isLoading ? "Envoi..." : "Envoyer la demande"}
              </button>
              <button type="button" className="conges-btn-cancel" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {estAdmin && (
        <div className="conges-filter">
          {["Tous", "En attente", "Approuve", "Rejete"].map((statut) => (
            <button
              key={statut}
              className={"conges-filter-btn " + (filtreStatut === statut ? "active" : "")}
              onClick={() => setFiltreStatut(statut)}
            >
              {statut}
            </button>
          ))}
        </div>
      )}

      <div className="conges-table-container">
        <table className="conges-table">
          <thead>
            <tr>
              {estAdmin && <th>Employé</th>}
              <th>Debut</th>
              <th>Fin</th>
              <th>Motif</th>
              <th>Jours</th>
              <th>Statut</th>
              {estAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={estAdmin ? 7 : 5} className="conges-loading">Chargement...</td>
              </tr>
            )}

            {!isLoading && filteredConges.length === 0 && (
              <tr>
                <td colSpan={estAdmin ? 7 : 5} className="conges-empty">
                  Aucune demande de conge.
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredConges.map((conge) => (
                <tr key={conge.id}>
                  {estAdmin && <td><strong>{conge.employe_nom || "-"}</strong></td>}
                  <td>{conge.dateDebut ? new Date(conge.dateDebut).toLocaleDateString("fr-FR") : "-"}</td>
                  <td>{conge.dateFin ? new Date(conge.dateFin).toLocaleDateString("fr-FR") : "-"}</td>
                  <td>{conge.raison}</td>
                  <td className="conges-jours">{conge.nombreJours || "-"}</td>
                  <td>
                    <span className={"conges-statut conges-statut-" + formatStatutClass(conge.statut)}>
                      {conge.statut}
                    </span>
                  </td>
                  {estAdmin && (
                    <td className="conges-actions">
                      {conge.statut === "En attente" && (
                        <>
                          <button
                            className="conges-btn-action conges-btn-approve"
                            onClick={() => handleAppouverConge(conge.id)}
                            title="Approuver"
                          >Approuver</button>
                          <button
                            className="conges-btn-action conges-btn-reject"
                            onClick={() => handleRejeterConge(conge.id)}
                            title="Rejeter"
                          >Rejeter</button>
                          <button
                            className="conges-btn-action conges-btn-delete"
                            onClick={() => handleSupprimerDemande(conge.id)}
                            title="Supprimer"
                          >Supprimer</button>
                        </>
                      )}
                      {conge.statut !== "En attente" && (
                        <span className="conges-no-action">--</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Conges;
