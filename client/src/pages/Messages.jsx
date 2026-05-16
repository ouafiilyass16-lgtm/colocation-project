import { useState, useEffect, useRef } from "react";
import { useAuth } from "../App";
import "../styles/Messages.css";
import { socket } from "../socket";

export default function Messages() {
  const { api, token, user, navigate } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv,  setSelectedConv]  = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [newMessage,    setNewMessage]    = useState("");
  const [sending,       setSending]       = useState(false);

  const messagesContainerRef = useRef(null);

  // ── Helper : compare un ID MongoDB (ObjectId ou string) avec user.id ──
  // Le backend retourne parfois _id (ObjectId), parfois id (string)
  // user vient du JWT : { id: "...", nom: "...", role: "..." }
  const myId = user?.id || user?._id || "";

  const isSameId = (a, b) => {
    if (!a || !b) return false;
    return String(a) === String(b);
  };

  const isMyMessage = (msg) =>
    isSameId(msg.expediteur?._id, myId) ||
    isSameId(msg.expediteur?.id,  myId) ||
    isSameId(msg.expediteur,      myId);

  // ── Scroll vers le bas du container ──────────────────────
  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // ── Chargement et groupement des conversations ────────────
  const loadConversations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [resRecus, resEnvoyes] = await Promise.all([
        api.get("/messages/recus",   token),
        api.get("/messages/envoyes", token),
      ]);

      const allMessages = [
        ...(resRecus.messages   || []),
        ...(resEnvoyes.messages || []),
      ];

      // Grouper par interlocuteur + annonce
      const grouped = {};
      allMessages.forEach(msg => {
        const mine = isMyMessage(msg);

        // ── L'interlocuteur est l'AUTRE personne ──
        const interlocuteur = mine ? msg.destinataire : msg.expediteur;

        if (!interlocuteur) return; // sécurité : skip si undefined

        const interlocuteurId = interlocuteur._id || interlocuteur.id || interlocuteur;
        const annonceId       = msg.annonce?._id || "general";
        const key             = `${interlocuteurId}_${annonceId}`;

        if (!grouped[key]) {
          grouped[key] = { key, annonce: msg.annonce, interlocuteur, messages: [] };
        }

        // Éviter les doublons
        if (!grouped[key].messages.find(m => m._id === msg._id)) {
          grouped[key].messages.push(msg);
        }
      });

      const convList = Object.values(grouped)
        .map(c => ({
          ...c,
          messages: c.messages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          ),
          unread: c.messages.filter(m => {
            const destId = m.destinataire?._id || m.destinataire;
            return isSameId(destId, myId) && !m.lu;
          }).length,
        }))
        .sort((a, b) => {
          const aLast = a.messages.at(-1)?.createdAt || 0;
          const bLast = b.messages.at(-1)?.createdAt || 0;
          return new Date(bLast) - new Date(aLast);
        });

      setConversations(convList);

      // Mettre à jour la conv sélectionnée sans perdre le focus
      setSelectedConv(prev => {
        if (!prev) return convList[0] || null;
        return convList.find(c => c.key === prev.key) || prev;
      });

    } catch (err) {
      console.error("Erreur chargement messages :", err);
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    if (token) loadConversations();
  }, [token]);

  // Polling toutes les 4 secondes pour les "vus"
  useEffect(() => {
    const interval = setInterval(() => loadConversations(true), 4000);
    return () => clearInterval(interval);
  }, [token]);

  // Scroll + marquer comme lu à l'ouverture d'une conv
  useEffect(() => {
    if (!selectedConv) return;

    setTimeout(() => scrollToBottom(), 60);

    selectedConv.messages.forEach(m => {
      const destId = m.destinataire?._id || m.destinataire;
      if (isSameId(destId, myId) && !m.lu) {
        api.patch(`/messages/${m._id}/lu`, {}, token).catch(() => {});
      }
    });
  }, [selectedConv?.key]);

  // Scroll auto quand un nouveau message arrive
  const prevCount = useRef(0);
  useEffect(() => {
    const count = selectedConv?.messages?.length || 0;
    if (count > prevCount.current) scrollToBottom();
    prevCount.current = count;
  }, [selectedConv?.messages?.length]);

  // ── Envoi ────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConv || sending) return;

    // ── Récupérer l'ID de l'interlocuteur de façon robuste ──
    const interlocuteur  = selectedConv.interlocuteur;
    const destinataireId = interlocuteur?._id || interlocuteur?.id || interlocuteur;

    if (!destinataireId) {
      console.error("❌ destinataireId introuvable :", interlocuteur);
      return;
    }

    console.log("📤 Envoi vers :", destinataireId, "| message :", newMessage.trim());

    setSending(true);
    try {
      const res = await api.post("/messages", {
        destinataireId: String(destinataireId),
        annonceId:      selectedConv.annonce?._id || undefined,
        contenu:        newMessage.trim(),
      }, token);

      console.log("✅ Réponse :", res);

      setNewMessage("");
      await loadConversations(true);
      setTimeout(() => scrollToBottom(), 80);

    } catch (err) {
      console.error("Erreur envoi :", err);
    }
    setSending(false);
  };

  // ── Helpers ──────────────────────────────────────────────
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="chat-container-prestige">
      <div className="chat-window">

        {/* ══ SIDEBAR ════════════════════════════════════ */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <h3>
              Discussions
              {conversations.reduce((s, c) => s + c.unread, 0) > 0 && (
                <span style={{
                  marginLeft: 8, background: "#e8355a", color: "#fff",
                  borderRadius: 100, fontSize: 11, fontWeight: 700,
                  padding: "2px 8px",
                }}>
                  {conversations.reduce((s, c) => s + c.unread, 0)}
                </span>
              )}
            </h3>
          </div>

          <div className="conv-list">
            {conversations.length === 0 ? (
              <div style={{ padding: 20, color: "#94a3b8", fontSize: 13 }}>
                Aucune conversation
              </div>
            ) : conversations.map(conv => (
              <div
                key={conv.key}
                className={`conv-item ${selectedConv?.key === conv.key ? "active" : ""}`}
                onClick={() => setSelectedConv(conv)}
              >
                <div className="avatar-small" style={{ position: "relative" }}>
                  {conv.interlocuteur?.nom?.[0]?.toUpperCase() || "?"}
                  {conv.unread > 0 && (
                    <span style={{
                      position: "absolute", top: -3, right: -3,
                      background: "#e8355a", color: "#fff",
                      borderRadius: "50%", width: 18, height: 18,
                      fontSize: 10, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="conv-info">
                  <div className="name" style={{ fontWeight: conv.unread > 0 ? 800 : 600 }}>
                    {conv.interlocuteur?.nom || "Inconnu"}
                  </div>
                  <div className="last-msg">
                    {conv.annonce?.titre || conv.messages.at(-1)?.contenu?.slice(0, 32) + "..."}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ══ ZONE DE CHAT ═══════════════════════════════ */}
        <main className="chat-main">
          {!selectedConv ? (
            <div className="empty-chat">Sélectionnez une discussion</div>
          ) : (
            <>
              <header className="chat-header">
                <div className="header-info">
                  <span className="user-name">{selectedConv.interlocuteur?.nom}</span>
                  {selectedConv.annonce && (
                    <span className="annonce-ref">
                      📋 {selectedConv.annonce.titre}
                    </span>
                  )}
                </div>
              </header>

              {/* Zone scrollable */}
              <div className="chat-messages" ref={messagesContainerRef}>
                {selectedConv.messages.map((m, i) => {
                  const mine = isMyMessage(m);
                  return (
                    <div
                      key={m._id || i}
                      className={`message-bubble ${mine ? "sent" : "received"}`}
                    >
                      <p>{m.contenu}</p>
                      <div className="msg-status-row">
                        <span className="msg-time">{formatTime(m.createdAt)}</span>
                        {mine && (
                          <span
                            className={`read-status ${m.lu ? "is-read" : ""}`}
                            title={m.lu ? "Vu" : "Envoyé"}
                          >
                            {m.lu ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form className="chat-input-area" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend(e)}
                  disabled={sending}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="btn-chat-send"
                  disabled={!newMessage.trim() || sending}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}