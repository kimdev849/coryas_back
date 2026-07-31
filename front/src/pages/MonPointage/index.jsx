import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import presencesService from "../../services/presencesService";
import heuresSupService from "../../services/heuresSupService";
import parametresService from "../../services/parametresService";
import { Clock, Coffee, Zap, Play, AlertCircle, CheckCircle2 } from "lucide-react";
import "./style.css";

function MonPointage() {
  const { user } = useAuth();
  const [activePresence, setActivePresence] = useState(null);
  const [todayPresences, setTodayPresences] = useState([]);
  const [settings, setSettings] = useState({
    heure_ouverture: "08:00", heure_fermeture: "17:00",
    duree_pause: 60, pause_debut: "12:00"
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Popup de refus (message lisible + bouton OK)
  const [popup, setPopup] = useState({ visible: false, titre: "", message: "" });

  // Pause state
  const [pauseTimer, setPauseTimer] = useState(null); // seconds remaining
  const [pauseInterval, setPauseInterval] = useState(null);

  // Heures sup state (après checkout)
  const [todayHs, setTodayHs] = useState(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const cleanupPauseTimer = useCallback(() => {
    if (pauseInterval) {
      clearInterval(pauseInterval);
      setPauseInterval(null);
    }
  }, [pauseInterval]);

  useEffect(() => {
    return () => cleanupPauseTimer();
  }, [cleanupPauseTimer]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!user?.employe_id) return;

      const [activeRes, todayRes, settingsRes] = await Promise.all([
        presencesService.getActivePresence(user.employe_id),
        presencesService.getAll({ employe_id: user.employe_id, date_debut: todayStr, date_fin: todayStr }),
        parametresService.get(),
      ]);

      const active = activeRes.data || null;
      setActivePresence(active);
      setTodayPresences(todayRes.data || []);

      if (settingsRes.data) {
        setSettings({
          heure_ouverture: settingsRes.data.heure_ouverture || "08:00",
          heure_fermeture: settingsRes.data.heure_fermeture || "17:00",
          duree_pause: settingsRes.data.duree_pause || 60,
          pause_debut: settingsRes.data.pause_debut?.slice(0, 5) || "12:00",
        });
      }

      // Si en pause, démarrer le timer
      if (active?.pause_statut === "En pause" && active?.pause_entree) {
        startPauseTimer(active.pause_entree, settingsRes.data?.duree_pause || 60);
      } else {
        cleanupPauseTimer();
        setPauseTimer(null);
      }
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const startPauseTimer = (pauseEntree, dureePause) => {
    cleanupPauseTimer();
    const [h, m] = pauseEntree.split(":").map(Number);
    const pauseStartMin = h * 60 + m;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const elapsed = nowMin - pauseStartMin;
    const remaining = Math.max(0, dureePause - elapsed);

    setPauseTimer(remaining);

    const interval = setInterval(() => {
      setPauseTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setPauseInterval(interval);
  };

  const nowTime = () => {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  };

  const alreadyCheckedInToday = todayPresences.length > 0 && !activePresence;

  // Récupère la position avec un délai maximum garanti.
  // ⚠️ Sans ce garde-fou, si le navigateur n'appelle jamais les callbacks
  // (permission ignorée, etc.), le bouton restait bloqué sur "Patientez..."
  // et l'employé ne voyait AUCUN message. Désormais on retombe toujours
  // sur une réponse en 8s max → le serveur renvoie alors son message clair.
  const getPosition = () => {
    return new Promise((resolve) => {
      let settled = false;
      const done = (value) => {
        if (!settled) {
          settled = true;
          resolve(value);
        }
      };

      if (!navigator.geolocation) {
        done({ latitude: null, longitude: null });
        return;
      }

      // Sécurité : on libère le bouton après 8s quoi qu'il arrive
      const timeout = setTimeout(() => done({ latitude: null, longitude: null }), 8000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          done({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        () => {
          clearTimeout(timeout);
          done({ latitude: null, longitude: null });
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 }
      );
    });
  };

  // Affiche un popup professionnel avec bouton OK
  const showPopup = (titre, message) => {
    setPopup({ visible: true, titre, message });
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const { latitude, longitude } = await getPosition();
      await presencesService.checkIn(user.employe_id, nowTime(), latitude, longitude);
      showMessage("Arrivée enregistrée avec succès");
      loadData();
    } catch (err) {
      showPopup("Pointage refusé", err.message || "Erreur lors du pointage");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activePresence?.id) return;
    setActionLoading(true);
    try {
      await presencesService.checkOut(activePresence.id, nowTime());
      showMessage("Départ enregistré. Bonne fin de journée !");

      // Charger les heures sup du jour après checkout
      try {
        const hsRes = await heuresSupService.getAll({ employe_id: user.employe_id, date_debut: todayStr, date_fin: todayStr });
        if (hsRes.data && hsRes.data.length > 0) {
          setTodayHs(hsRes.data);
        }
      } catch { /* silencieux */ }

      loadData();
    } catch (err) {
      showPopup("Pointage refusé", err.message || "Erreur lors du pointage");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartPause = async () => {
    if (!activePresence?.id) return;
    setActionLoading(true);
    try {
      const res = await presencesService.startPause(activePresence.id);
      if (res.data) {
        showMessage("☕ Pause débutée ! Profitez-en bien.");
        startPauseTimer(res.data.pause_entree, settings.duree_pause);
        setActivePresence(res.data);
      }
    } catch (err) {
      showPopup("Erreur", err.message || "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndPause = async () => {
    if (!activePresence?.id) return;
    setActionLoading(true);
    try {
      const res = await presencesService.endPause(activePresence.id);
      if (res.data) {
        showMessage("Pause terminée ! Au travail !");
        cleanupPauseTimer();
        setPauseTimer(null);
        setActivePresence(res.data);
      }
    } catch (err) {
      showPopup("Erreur", err.message || "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (str) => str || "--:--";

  const getStatus = () => {
    if (activePresence?.pause_statut === "En pause") return "En pause ☕";
    if (activePresence) return "Présent";
    if (todayPresences.length > 0) return "Départ enregistré";
    return "Absent";
  };

  const getStatusClass = () => {
    if (activePresence?.pause_statut === "En pause") return "pause";
    if (activePresence) return "present";
    if (todayPresences.length > 0) return "depart";
    return "absent";
  };

  // Calcul du temps restant de pause
  const pauseTimerDisplay = () => {
    if (pauseTimer === null) return null;
    const mins = Math.floor(pauseTimer / 60);
    const secs = pauseTimer % 60;
    const isOver = pauseTimer <= 0;
    return {
      display: isOver
        ? "⏰ Temps de pause terminé !"
        : `${String(mins).padStart(2, "0")}min ${String(secs).padStart(2, "0")}s`,
      isOver,
    };
  };

  const pauseInfo = pauseTimerDisplay();

  return (
    <div className="mp-container">
      <div className="mp-header">
        <h1>Mon Pointage</h1>
        <p className="mp-date">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {message.text && (
        <div className={`mp-message mp-message-${message.type}`}>
          {message.type === "error" ? (
            <AlertCircle size={18} className="mp-message-icon" />
          ) : (
            <CheckCircle2 size={18} className="mp-message-icon" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* ===== POPUP DE REFUS (message pro + bouton OK) ===== */}
      {popup.visible && (
        <div className="mp-popup-overlay">
          <div className="mp-popup-card">
            <div className="mp-popup-icon">
              <AlertCircle size={28} />
            </div>
            <h3 className="mp-popup-title">{popup.titre}</h3>
            <p className="mp-popup-message">{popup.message}</p>
            {/* L'employé lit le message puis clique sur OK pour l'enlever */}
            <button
              className="mp-popup-ok"
              onClick={() => setPopup(p => ({ ...p, visible: false }))}
            >
              OK
            </button>
          </div>
        </div>
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
              <span className={`mp-status-dot ${getStatusClass()}`} />
            </div>
            <div className="mp-status-value">{getStatus()}</div>
            {activePresence ? (
              <div className="mp-status-sub">depuis {activePresence.heure_entree}</div>
            ) : todayPresences.length > 0 ? (
              <div className="mp-status-sub">
                {todayPresences[0]?.heure_entree} → {todayPresences[0]?.heure_sortie}
              </div>
            ) : null}

            {/* Infos horaires + pause */}
            <div className="mp-config-info">
              <div className="mp-config-item">
                <Clock size={14} />
                <span>Horaires : {settings.heure_ouverture} - {settings.heure_fermeture}</span>
              </div>
              <div className="mp-config-item">
                <Coffee size={14} />
                <span>
                  {activePresence?.pause_statut === "En pause" ? (
                    <>Pause en cours : début à {activePresence.pause_entree || settings.pause_debut}</>
                  ) : activePresence?.pause_statut === "Terminee" ? (
                    <>Pause : {activePresence.pause_entree} → {activePresence.pause_sortie}</>
                  ) : (
                    <>Pause prévue : {settings.pause_debut} → {(() => {
                      const [h, m] = settings.pause_debut.split(":").map(Number);
                      const totalMin = h * 60 + m + settings.duree_pause;
                      const finH = Math.floor(totalMin / 60) % 24;
                      const finM = totalMin % 60;
                      return String(finH).padStart(2, "0") + ":" + String(finM).padStart(2, "0");
                    })()} ({settings.duree_pause} min)</>
                  )}
                </span>
              </div>
            </div>

            {/* Zone pause tracker - seulement si présent */}
            {activePresence && (
              <div className="mp-pause-zone">
                {activePresence.pause_statut === "En pause" ? (
                  /* En pause - timer + bouton retour */
                  <div className="mp-pause-active">
                    <div className="mp-pause-icon">☕</div>
                    <div className="mp-pause-timer">
                      {pauseInfo?.isOver ? (
                        <span className="mp-pause-over">⏰ Pause terminée !</span>
                      ) : (
                        <span className="mp-pause-countdown">{pauseInfo?.display}</span>
                      )}
                    </div>
                    <div className="mp-pause-sub">
                      Début pause : {activePresence.pause_entree}
                    </div>
                    <button
                      className="mp-pause-btn end"
                      onClick={handleEndPause}
                      disabled={actionLoading}
                    >
                      <Play size={18} /> Je reprends le travail
                    </button>
                  </div>
                ) : activePresence.pause_statut === "Terminee" ? (
                  /* Pause déjà prise */
                  <div className="mp-pause-done">
                    <div className="mp-pause-done-row">
                      <Coffee size={16} />
                      <span>Pause : {activePresence.pause_entree} → {activePresence.pause_sortie}</span>
                    </div>
                  </div>
                ) : (
                  /* Pas encore en pause - bouton pause */
                  <button
                    className="mp-pause-btn start"
                    onClick={handleStartPause}
                    disabled={actionLoading}
                  >
                    <Coffee size={20} /> Je vais en pause
                  </button>
                )}
              </div>
            )}

            {/* Calcul du temps travaillé */}
            {todayPresences.length > 0 && todayPresences[0]?.heure_entree && todayPresences[0]?.heure_sortie && (
              <div className="mp-worked-time">
                {(() => {
                  const [ah, am] = todayPresences[0].heure_entree.split(":").map(Number);
                  const [dh, dm] = todayPresences[0].heure_sortie.split(":").map(Number);
                  const totalMin = (dh * 60 + dm) - (ah * 60 + am);
                  const heures = Math.floor(totalMin / 60);
                  const minutes = totalMin % 60;
                  const pause = settings.duree_pause || 0;
                  const travailMin = totalMin - pause;
                  const tHeures = Math.floor(travailMin / 60);
                  const tMinutes = travailMin % 60;

                  // Heures sup
                  const [oh, om] = settings.heure_fermeture.split(":").map(Number);
                  const fermetureMin = oh * 60 + om;
                  const tempsNormal = fermetureMin - pause;
                  const hsMinutes = Math.max(0, travailMin - tempsNormal);
                  const hsHeures = Math.floor(hsMinutes / 60);
                  const hsMinRest = hsMinutes % 60;

                  return (
                    <>
                      <div className="mp-worked-row">
                        <span>Temps à l'entreprise</span>
                        <strong>{heures}h{String(minutes).padStart(2, "0")}</strong>
                      </div>
                      <div className="mp-worked-row">
                        <span>Pause déjeuner</span>
                        <strong>-{settings.duree_pause} min</strong>
                      </div>
                      <div className="mp-worked-row mp-worked-total">
                        <span>Temps travaillé</span>
                        <strong>{tHeures}h{String(tMinutes).padStart(2, "0")}</strong>
                      </div>
                      {hsMinutes > 0 && (
                        <div className="mp-worked-row mp-worked-hs">
                          <span><Zap size={14} /> Heures supplémentaires</span>
                          <strong className="mp-hs-strong">
                            +{hsHeures}h{String(hsMinRest).padStart(2, "0")}
                          </strong>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Heures sup auto du jour */}
          {todayHs && todayHs.length > 0 && !activePresence && (
            <div className="mp-hs-card">
              <div className="mp-hs-header">
                <Zap size={18} />
                <span>Heures supplémentaires aujourd'hui</span>
              </div>
              {todayHs.map((hs, i) => (
                <div key={i} className="mp-hs-row">
                  <span>+{hs.nb_heures}h</span>
                  <span className="mp-hs-statut">{hs.statut}</span>
                </div>
              ))}
            </div>
          )}

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
                disabled={actionLoading || activePresence?.pause_statut === 'En pause'}
              >
                {actionLoading ? (
                  "Patientez..."
                ) : activePresence?.pause_statut === 'En pause' ? (
                  <>
                    <span className="mp-btn-icon">☕</span>
                    Terminez d'abord votre pause
                  </>
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
                <div key={p.id || idx} className="mp-day-block">
                  <div className="mp-timeline-item">
                    <div className="mp-timeline-dot" />
                    <div className="mp-timeline-content">
                      <span className="mp-timeline-label">Arrivée</span>
                      <span className="mp-timeline-time">{p.heure_entree || "--:--"}</span>
                    </div>
                  </div>
                  {/* Ligne pause si prise */}
                  {p.pause_entree && (
                    <div className="mp-timeline-item">
                      <div className="mp-timeline-dot pause" />
                      <div className="mp-timeline-content">
                        <span className="mp-timeline-label">
                          <Coffee size={12} /> Pause
                        </span>
                        <span className="mp-timeline-time">
                          {p.pause_entree} → {p.pause_sortie || "..."}
                        </span>
                      </div>
                    </div>
                  )}
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
