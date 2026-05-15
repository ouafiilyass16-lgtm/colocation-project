import { useState, useEffect, useRef } from "react";
import { useAuth } from "../App";
import "../styles/Messages.css";

export default function Messages() {
  const { api, token, user, navigate } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => { if (token) loadConversations(); }, [token]);

  // Scroll auto vers le bas
  useEffect(() => {
  if (scrollRef.current) {
    // block: "end" force l'alignement sur le bas du conteneur
    scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }
}, [selectedConv?.messages]);
  const loadConversations = async () => {
    setLoading(true);
    try {
      const resRecus = await api.get("/messages/recus", token);
      const resEnvoyes = await api.get("/messages/envoyes", token);
      
      const allMessages = [...(resRecus.messages || []), ...(resEnvoyes.messages || [])];
      
      const grouped = allMessages.reduce((acc, msg) => {
        const convId = msg.annonce?._id || "general";
        if (!acc[convId]) acc[convId] = { 
          annonce: msg.annonce, 
          messages: [], 
          interlocuteur: msg.expediteur._id === user._id ? msg.destinataire : msg.expediteur 
        };
        acc[convId].messages.push(msg);
        return acc;
      }, {});

      const sortedConv = Object.values(grouped).map(c => ({
        ...c,
        messages: c.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      }));

      setConversations(sortedConv);
      if (sortedConv.length > 0 && !selectedConv) setSelectedConv(sortedConv[0]);
    } catch (err) {
      console.error("Erreur chargement");
    }
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post("/messages", {
        destinataireId: selectedConv.interlocuteur._id,
        annonceId: selectedConv.annonce?._id,
        contenu: newMessage
      }, token);

      if (res) {
        setNewMessage("");
        loadConversations(); // Rafraîchit pour voir son propre message envoyé (✓)
      }
    } catch (err) {
      console.error("Erreur envoi");
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="chat-container-prestige">
      <div className="chat-window">
        
        {/* SIDEBAR */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <h3>Discussions</h3>
          </div>
          <div className="conv-list">
            {conversations.map((conv, idx) => (
              <div 
                key={idx} 
                className={`conv-item ${selectedConv?.annonce?._id === conv.annonce?._id ? "active" : ""}`}
                onClick={() => setSelectedConv(conv)}
              >
                <div className="avatar-small">{conv.interlocuteur?.nom[0]}</div>
                <div className="conv-info">
                  <div className="name">{conv.interlocuteur?.nom}</div>
                  <div className="last-msg">{conv.annonce?.titre || "Discussion"}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ZONE DE CHAT */}
        <main className="chat-main">
          {selectedConv ? (
            <>
              <header className="chat-header">
                <div className="header-info">
                  <span className="user-name">{selectedConv.interlocuteur.nom}</span>
                  <span className="annonce-ref">Objet : {selectedConv.annonce?.titre}</span>
                </div>
              </header>

             <div className="chat-messages">
  {selectedConv.messages.map((m, i) => {
    const isMe = m.expediteur._id === user._id;
    return (
      <div key={i} className={`message-bubble ${isMe ? "sent" : "received"}`}>
        <p>{m.contenu}</p>
        <div className="msg-status-row">
          <span className="msg-time">
            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && (
            <span className={`read-status ${m.lu ? "is-read" : ""}`}>
              {m.lu ? " ✓✓" : " ✓"}
            </span>
                        )}
                        
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSend}>
                <input 
                  type="text" 
                  placeholder="Écrivez votre message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn-chat-send">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat">Sélectionnez une discussion</div>
          )}
        </main>
      </div>
    </div>
  );
}