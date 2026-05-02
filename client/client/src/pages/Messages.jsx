import { useState, useEffect, useRef } from "react";
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
    const res = await api.post("/messages", {
      destinataireId: reply.to,
      contenu: reply.content,
    }, token);
    if (res.data) {
      setReplyStatus("✓ Message envoyé !");
      setTimeout(() => {
        setReply({ open: false, to: null, toName: "", content: "" });
        setReplyStatus("");
      }, 1500);
    }
  };

  const openReply = (msg) => {
    const other = tab === "recus" ? msg.expediteur : msg.destinataire;
    setReply({ open: true, to: other._id, toName: other.nom, content: "" });
  };

  if (!user) return (
    <div className="page container empty-state">
      <div className="empty-icon">🔒</div>
      <h3>Connexion requise</h3>
      <button className="btn btn-primary" onClick={() => navigate("login")} style={{ marginTop: 20 }}>Se connecter</button>
    </div>
  );

  const unreadCount = messages.filter(m => !m.lu).length;

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: 32 }}>Messagerie</h1>

        <div className="tabs">
          <button className={`tab ${tab === "recus" ? "active" : ""}`} onClick={() => setTab("recus")}>
            📥 Reçus {tab === "recus" && unreadCount > 0 && (
              <span style={{ background: "var(--accent)", color: "white", borderRadius: 100, padding: "1px 7px", fontSize: 11, marginLeft: 4 }}>
                {unreadCount}
              </span>
            )}
          </button>
          <button className={`tab ${tab === "envoyes" ? "active" : ""}`} onClick={() => setTab("envoyes")}>
            📤 Envoyés
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
            {messages.map((m) => {
              const isUnread = tab === "recus" && !m.lu;
              const other = tab === "recus" ? m.expediteur : m.destinataire;
              return (
                <div key={m._id}
                  onClick={() => isUnread && markAsRead(m._id)}
                  style={{
                    background: isUnread ? "rgba(79,142,247,0.06)" : "var(--card)",
                    border: `1px solid ${isUnread ? "rgba(79,142,247,0.2)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    padding: "18px 20px",
                    display: "grid", gridTemplateColumns: "1fr auto",
                    gap: 16, alignItems: "start",
                    backdropFilter: "blur(20px)",
                    cursor: isUnread ? "pointer" : "default",
                    transition: "var(--transition)",
                  }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0,
                      }}>
                        {other?.nom?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: isUnread ? 700 : 500, fontSize: 14 }}>{other?.nom}</span>
                      {isUnread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />}
                      {m.annonce && (
                        <span style={{ fontSize: 11, color: "var(--accent)", background: "rgba(79,142,247,0.1)", padding: "2px 8px", borderRadius: 100 }}>
                          re: {m.annonce.titre}
                        </span>
                      )}
                    </div>
                    <p style={{ color: isUnread ? "var(--text)" : "var(--text2)", fontSize: 14, lineHeight: 1.5 }}>{m.contenu}</p>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>
                      {new Date(m.createdAt).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {tab === "recus" && (
                      <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); openReply(m); }}>↩ Répondre</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); deleteMessage(m._id); }}>🗑️</button>
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
            <h3 style={{ marginBottom: 4 }}>Répondre à {reply.toName}</h3>
            <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: 20 }}>Votre réponse sera envoyée directement</p>
            {replyStatus ? (
              <div className="alert alert-success">{replyStatus}</div>
            ) : (
              <>
                <textarea className="form-input" placeholder="Votre message..." value={reply.content}
                  onChange={e => setReply(p => ({ ...p, content: e.target.value }))}
                  style={{ marginBottom: 16 }} />
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
