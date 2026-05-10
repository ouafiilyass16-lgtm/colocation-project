import { useState, useEffect } from "react";
import { useAuth } from "../App";

export default function Messages() {
  const { api, token, user, navigate } = useAuth();
  const [tab, setTab] = useState("recus");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({ open: false, to: null, toName: "", content: "" });
  const [replyStatus, setReplyStatus] = useState("");

  useEffect(() => { if (token) loadMessages(); }, [token, tab]);

  const loadMessages = async () => {
    setLoading(true);
    const data = await api.get(`/messages/${tab}`, token);
    setMessages(data.messages || []);
    setLoading(false);
  };

  const markAsRead = async (id) => {
    await api.patch(`/messages/${id}/lu`, {}, token);
    setMessages(prev => prev.map(m => m._id === id ? { ...m, lu: true } : m));
  };

  const deleteMessage = async (id) => {
    await api.delete(`/messages/${id}`, token);
    setMessages(prev => prev.filter(m => m._id !== id));
  };

  const sendReply = async () => {
    if (!reply.content.trim()) return;
    const res = await api.post("/messages", { destinataireId: reply.to, contenu: reply.content }, token);
    if (res.data) {
      setReplyStatus("✓ Message envoyé !");
      setTimeout(() => { setReply({ open: false, to: null, toName: "", content: "" }); setReplyStatus(""); }, 1500);
    }
  };

  const openReply = (msg) => {
    const other = tab === "recus" ? msg.expediteur : msg.destinataire;
    setReply({ open: true, to: other._id, toName: other.nom, content: "" });
  };

  if (!user) return (
    <div className="container empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-icon">🔒</div>
      <h3>Connexion requise</h3>
      <button className="btn btn-primary btn-pill" onClick={() => navigate("login")} style={{ marginTop: 20 }}>Se connecter</button>
    </div>
  );

  const unreadCount = messages.filter(m => !m.lu).length;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", marginBottom: 32 }}>Messages</h1>

        <div className="tabs">
          <button className={`tab ${tab === "recus" ? "active" : ""}`} onClick={() => setTab("recus")}>
            Reçus
            {tab === "recus" && unreadCount > 0 && (
              <span style={{
                background: "#FF385C", color: "#fff",
                borderRadius: 100, padding: "1px 8px", fontSize: 11, fontWeight: 700, marginLeft: 6,
              }}>
                {unreadCount}
              </span>
            )}
          </button>
          <button className={`tab ${tab === "envoyes" ? "active" : ""}`} onClick={() => setTab("envoyes")}>
            Envoyés
          </button>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>Aucun message</h3>
            <p>{tab === "recus" ? "Vous n'avez pas encore reçu de messages" : "Vous n'avez pas encore envoyé de messages"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map(m => {
              const isUnread = tab === "recus" && !m.lu;
              const other = tab === "recus" ? m.expediteur : m.destinataire;
              return (
                <div
                  key={m._id}
                  onClick={() => isUnread && markAsRead(m._id)}
                  style={{
                    background: "#fff",
                    border: `1px solid ${isUnread ? "rgba(255,56,92,0.3)" : "#DDDDDD"}`,
                    borderLeft: isUnread ? "3px solid #FF385C" : "1px solid #DDDDDD",
                    borderRadius: 16, padding: "18px 20px",
                    display: "grid", gridTemplateColumns: "1fr auto",
                    gap: 16, alignItems: "start",
                    cursor: isUnread ? "pointer" : "default",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"}
                  onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF385C, #E31C5F)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
                      }}>
                        {other?.nom?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontWeight: isUnread ? 700 : 500, fontSize: 15, color: "#222" }}>{other?.nom}</span>
                        {isUnread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF385C", display: "inline-block", marginLeft: 6 }} />}
                      </div>
                      {m.annonce && (
                        <span style={{
                          fontSize: 11, color: "#FF385C",
                          background: "rgba(255,56,92,0.08)",
                          padding: "2px 10px", borderRadius: 100, fontWeight: 600,
                        }}>
                          {m.annonce.titre}
                        </span>
                      )}
                    </div>
                    <p style={{ color: isUnread ? "#222" : "#717171", fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>
                      {m.contenu}
                    </p>
                    <div style={{ fontSize: 12, color: "#B0B0B0" }}>
                      {new Date(m.createdAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {tab === "recus" && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={e => { e.stopPropagation(); openReply(m); }}
                      >
                        Répondre
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={e => { e.stopPropagation(); deleteMessage(m._id); }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {reply.open && (
        <div className="modal-overlay" onClick={() => setReply(p => ({ ...p, open: false }))}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Fraunces', serif", marginBottom: 6 }}>Répondre à {reply.toName}</h3>
            <p style={{ color: "#717171", fontSize: 13, marginBottom: 20 }}>Votre message sera envoyé directement</p>
            {replyStatus ? (
              <div className="alert alert-success">{replyStatus}</div>
            ) : (
              <>
                <textarea
                  className="form-input"
                  placeholder="Votre message..."
                  value={reply.content}
                  onChange={e => setReply(p => ({ ...p, content: e.target.value }))}
                  style={{ marginBottom: 16, minHeight: 100 }}
                />
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-secondary" onClick={() => setReply(p => ({ ...p, open: false }))}>Annuler</button>
                  <button className="btn btn-primary" onClick={sendReply} disabled={!reply.content.trim()}>Envoyer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
