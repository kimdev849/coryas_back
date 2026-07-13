import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import presencesService from "../../services/presencesService";
import "./style.css";

function MonPointage() {
  const { user } = useAuth();
  const [activePresence, setActivePresence] = useState(null);
  const [todayPresences, setTodayPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const todayStr = new Date().toISOString().split("T")[0];

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (!user?.employe_id) return;

      const [activeRes, todayRes] = await Promise.all([
        presencesService.getActivePresence(user.employe_id),
        presencesService.getAll({ employe_id: user.employe_id, date_debut: todayStr, date_fin: todayStr }),
      ]);

      setActivePresence(activeRes.data || null);
      setTodayPresences(todayRes.data || []);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const nowTime = () => {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  };

  // Vérifier si l'employé a déjà pointé aujourd'hui (même après départ)
  const alreadyCheckedInToday = todayPresences.length > 0 && !activePresence;

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await presencesService.checkIn(user.employe_id, nowTime());
      const autoClosed = res.autoClosed;
      if (autoClosed && autoClosed.length > 0) {
        showMessage(`✅ Arrivée enregistrée — ${autoClosed.length} présence(s) précédente(s) fermée(s) automatiquement`);
      } else {
        showMessage("✅ Arrivée enregistrée avec succès");
      }
      loadData();
    } catch (err) {
      showMessage("❌ " + (err.message || "Erreur lors du pointage"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activePresence?.id) return;
    setActionLoading(true);
    try {
      await presencesService.checkOut(activePresence.id, nowTime());
      showMessage("✅ Départ enregistré avec succès");
      loadData();
    } catch (err) {
      showMessage("❌ " + (err.message || "Erreur lors du pointage"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (str) => str || "--:--";
  const getStatus = () => {
    if (activePresence) return "Présent";
    if (todayPresences.length > 0) return "Départ enregistré";
    return "Absent";
  };

  return (
    <div className="mp-container">
      <div className="mp-header">
        <h1>Mon Pointage</h1>
        <p className="mp-date">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {message.text && (
        <div className={`mp-message mp-message-${message.type}`}>{message.text}</div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <span className="loading-spinner-text">Chargement...</span>
        </div>
      ) : (
        <>
          {/* Carte statut */}
          <div className="mp-status-card">
            <div className="mp-status-header">
              <span>Statut actuel</span>
              <span className={`mp-status-dot ${activePresence ? "present" : todayPresences.length > 0 ? "depart" : "absent"}`} />
            </div>
            <div className="mp-status-value">{getStatus()}</div>
            {activePresence ? (
              <div className="mp-status-sub">depuis {activePresence.heure_entree}</div>
            ) : todayPresences.length > 0 ? (
              <div className="mp-status-sub">
                {todayPresences[0]?.heure_entree} → {todayPresences[0]?.heure_sortie}
              </div>
            ) : null}
          </div>

          {/* Bouton pointer */}
          <div className="mp-pointer-area">
            {alreadyCheckedInToday ? (
              <div className="mp-already-done">
                <span className="mp-already-icon">✅</span>
                <p className="mp-already-text">Pointage déjà effectué aujourd'hui</p>
                <p className="mp-already-sub">Un seul pointage par jour est autorisé</p>
              </div>
            ) : (
              <button
                className={`mp-pointer-btn ${activePresence ? "checkout" : "checkin"}`}
                onClick={activePresence ? handleCheckOut : handleCheckIn}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  "Patientez..."
                ) : activePresence ? (
                  <>
                    <span className="mp-btn-icon">⏱</span>
                    Pointer le départ
                  </>
                ) : (
                  <>
                    <span className="mp-btn-icon">⏱</span>
                    Pointer l'arrivée
                  </>
                )}
              </button>
            )}
          </div>

          {/* Timeline du jour */}
          <div className="mp-timeline">
            <h3>Aujourd'hui</h3>
            {todayPresences.length === 0 ? (
              <p className="mp-empty">Aucun pointage aujourd'hui</p>
            ) : (
              todayPresences.map((p, idx) => (
                <div key={p.id || idx} className="mp-timeline-item">
                  <div className="mp-timeline-dot" />
                  <div className="mp-timeline-content">
                    <span className="mp-timeline-label">Arrivée</span>
                    <span className="mp-timeline-time">{p.heure_entree || "--:--"}</span>
                  </div>
                  {p.heure_sortie && (
                    <div className="mp-timeline-item">
                      <div className="mp-timeline-dot depart" />
                      <div className="mp-timeline-content">
                        <span className="mp-timeline-label">Départ</span>
                        <span className="mp-timeline-time">{p.heure_sortie}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default MonPointage;
