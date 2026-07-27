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

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    employe_id: "",  // ID de l'employe (admin peut choisir)
    dateDebut: today,
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
  const [modalInfo, setModalInfo] = useState(null); // { type: 'approve'|'reject', id, nom }
  const [modalComment, setModalComment] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

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

    if (new Date(formData.dateDebut) < new Date(today)) {
      setMessage("La date de debut ne peut pas etre avant aujourd'hui !");
      setMessageType("error");
      return;
    }

    if (new Date(formData.dateFin) < new Date(today)) {
      setMessage("La date de fin ne peut pas etre avant aujourd'hui !");
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

      setFormData({ employe_id: "", dateDebut: today, dateFin: "", raison: "" });
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
        commentaireRh: c.commentaire_rh || "",
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

  // Ouvre la modale d'approbation/réjection
  const openModal = (type, id, nom) => {
    setModalInfo({ type, id, nom });
    setModalComment("");
  };

  // Ferme la modale
  const closeModal = () => {
    setModalInfo(null);
    setModalComment("");
  };

  // Confirme l'action (approuver ou rejeter)
  const handleModalConfirm = async () => {
    if (!modalInfo) return;
    setModalLoading(true);
    try {
      const { type, id } = modalInfo;
      if (type === "approve") {
        const result = await congesService.appouverConge(id, modalComment || null);
        setMessage(result.message || "Demande approuvée !");
      } else {
        if (!modalComment.trim()) {
          setMessage("Veuillez saisir un motif de rejet.");
          setMessageType("error");
          setModalLoading(false);
          return;
        }
        const result = await congesService.rejeterConge(id, modalComment);
        setMessage(result.message || "Demande rejetée !");
      }
      setMessageType("success");
      closeModal();
      await handleLoadConges();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Erreur lors de l'opération");
      setMessageType("error");
    } finally {
      setModalLoading(false);
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
      <h1 className="page-title">Congés</h1>
      <p className="page-description">
        Consultez et gérez vos demandes de congés
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
          {showForm ? "Fermer" : "+ Nouveau congé"}
        </button>
        <button className="conges-btn-reload" onClick={handleLoadConges}>
          Recharger
        </button>
      </div>

      {showForm && (
        <div className="conges-form-container">
          <h2>Nouveau congé</h2>
          <form onSubmit={handleSubmitForm} className="conges-form">

            {/* Si l'utilisateur est admin, il peut choisir l'employe */}
            {estAdmin && (
              <div className="conges-form-group">
                <label htmlFor="employe_id">Employé *</label>
                <select
                  id="employe_id"
                  name="employe_id"
                  value={formData.employe_id}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Stocker le téléphone de l'employé sélectionné
                    const emp = employes.find(el => String(el.id) === e.target.value);
                    setFormData(prev => ({ ...prev, employe_id: e.target.value, telephone: emp?.telephone || "" }));
                  }}
                  required
                >
                  <option value="">-- Selectionner un employé --</option>
                  {employes.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.prenom} {emp.nom} — {emp.departement_nom || "—"} {emp.telephone ? `📞 ${emp.telephone}` : ""}
                    </option>
                  ))}
                </select>
                {formData.telephone && (
                  <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
                    📞 Tél: {formData.telephone}
                  </p>
                )}
              </div>
            )}

            <div className="conges-form-group">
              <label htmlFor="dateDebut">Date de début *</label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleInputChange}
                min={today}
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
                min={today}
                required
              />
            </div>

            <div className="conges-form-group">
              <label htmlFor="raison">Motif *</label>
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
                {isLoading ? "Envoi..." : "Envoyer"}
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
                <td colSpan={estAdmin ? 7 : 5}>
                <div className="loading-spinner" style={{ padding: "30px" }}>
                  <span className="loading-spinner-text">Chargement...</span>
                </div>
              </td>
              </tr>
            )}

            {!isLoading && filteredConges.length === 0 && (
              <tr>
                <td colSpan={estAdmin ? 7 : 5} className="conges-empty">
                  Aucun congé pour le moment.
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
                    {conge.commentaireRh && (conge.statut === "Rejete" || conge.statut === "Approuve") && (
                      <div className="conges-commentaire-rh">
                        <small>💬 {conge.commentaireRh}</small>
                      </div>
                    )}
                  </td>
                  {estAdmin && (
                    <td className="conges-actions">
                      {conge.statut === "En attente" && (
                        <>
                          <button
                            className="conges-btn-action conges-btn-approve"
                            onClick={() => openModal("approve", conge.id, conge.employe_nom)}
                            title="Approuver"
                          >✓ Approuver</button>
                          <button
                            className="conges-btn-action conges-btn-reject"
                            onClick={() => openModal("reject", conge.id, conge.employe_nom)}
                            title="Rejeter"
                          >✗ Rejeter</button>
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

      {/* ===== MODALE D'APPROBATION / RÉJECTION ===== */}
      {modalInfo && (
        <div className="conges-modal-overlay" onClick={closeModal}>
          <div className="conges-modal" onClick={(e) => e.stopPropagation()}>
            <div className="conges-modal-header">
              <span className="conges-modal-icon">
                {modalInfo.type === "approve" ? "✅" : "❌"}
              </span>
              <h3>
                {modalInfo.type === "approve" ? "Approuver la demande" : "Rejeter la demande"}
              </h3>
            </div>

            <p className="conges-modal-desc">
              {modalInfo.type === "approve"
                ? `Vous êtes sur le point d'approuver la demande de ${modalInfo.nom}.`
                : `Vous êtes sur le point de rejeter la demande de ${modalInfo.nom}.`}
            </p>

            <div className="conges-modal-field">
              <label htmlFor="modalComment">
                {modalInfo.type === "approve" ? "Message (optionnel)" : "Motif du rejet *"}
              </label>
              <textarea
                id="modalComment"
                className="conges-modal-textarea"
                value={modalComment}
                onChange={(e) => setModalComment(e.target.value)}
                placeholder={modalInfo.type === "approve"
                  ? "Félicitations ! Votre congé a été approuvé."
                  : "Expliquez le motif du rejet..."}
                rows={3}
                autoFocus
              />
            </div>

            <div className="conges-modal-actions">
              <button
                className="conges-btn-submit"
                onClick={handleModalConfirm}
                disabled={modalLoading}
                style={{ background: modalInfo.type === "approve" ? "#28a745" : "#dc3545" }}
              >
                {modalLoading ? "Traitement..." : modalInfo.type === "approve" ? "✓ Approuver" : "✗ Rejeter"}
              </button>
              <button
                className="conges-btn-cancel"
                onClick={closeModal}
                disabled={modalLoading}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Conges;
