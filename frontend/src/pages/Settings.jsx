import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Key, Database, GitBranch, Check, Save, User } from "lucide-react";

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "#1F2937",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "white",
  fontSize: "14px",
  outline: "none",
};

const labelStyle = {
  display: "block",
  color: "#D1D5DB",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: 500,
};

const hintStyle = {
  fontSize: "12px",
  color: "#6B7280",
  marginTop: "5px",
};

const Settings = () => {
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [githubUsername, setGithubUsername] = useState("");
  const [jiraUsername, setJiraUsername]     = useState("");
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  // Load existing linked usernames from backend on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setGithubUsername(data.user.githubUsername || "");
          setJiraUsername(data.user.jiraUsername || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/me/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUsername, jiraUsername }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Could not save. Make sure the backend is running.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", background: "#0B1220", minHeight: "calc(100vh - 72px)" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "30px" }}>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>⚙️ Platform Settings</h1>
          <p style={{ color: "#9CA3AF", marginBottom: "30px" }}>
            Configure your AI model, integrations, and link your developer accounts so ImpactIQ
            routes webhook notifications directly to you.
          </p>

          <form onSubmit={handleSave} style={{ maxWidth: "800px", display: "flex", flexDirection: "column", gap: "25px" }}>

            {/* ── AI Engine ── */}
            <div className="card" style={{ padding: "25px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <Key size={22} color="#818CF8" />
                <h2 style={{ margin: 0, fontSize: "20px" }}>Gemini AI Configuration</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>AI Model Engine</label>
                  <select value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} style={inputStyle}>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Ultra Fast)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Code Reasoning)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>API Endpoint</label>
                  <input type="text" defaultValue="http://localhost:5000/api" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* ── Integration Usernames ── */}
            <div className="card" style={{ padding: "25px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <GitBranch size={22} color="#F59E0B" />
                <h2 style={{ margin: 0, fontSize: "20px" }}>Integration Usernames</h2>
              </div>
              <p style={{ color: "#6B7280", fontSize: "13px", marginBottom: "20px" }}>
                Link your GitHub and Jira accounts. When a webhook fires with your username,
                ImpactIQ looks you up in the database and sends the notification to
                <strong style={{ color: "#818CF8" }}> your registered email only</strong>.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                {/* GitHub Username */}
                <div>
                  <label style={labelStyle}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <GitBranch size={15} color="#9CA3AF" /> GitHub Username
                    </span>
                  </label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="e.g. john-doe"
                    style={inputStyle}
                  />
                  <p style={hintStyle}>
                    When you push code or open a PR on GitHub, ImpactIQ matches this username
                    and emails the analysis to your account email.
                  </p>
                </div>

                {/* Jira Username */}
                <div>
                  <label style={labelStyle}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <User size={15} color="#9CA3AF" /> Jira Username / Account ID
                    </span>
                  </label>
                  <input
                    type="text"
                    value={jiraUsername}
                    onChange={(e) => setJiraUsername(e.target.value)}
                    placeholder="e.g. john.doe or your Jira Account ID"
                    style={inputStyle}
                  />
                  <p style={hintStyle}>
                    When a Jira ticket is assigned to you or transitions to review, ImpactIQ
                    matches this username to send the notification to your email.
                  </p>
                </div>

                {/* Info box */}
                <div style={{
                  background: "rgba(129,140,248,0.07)",
                  border: "1px solid rgba(129,140,248,0.2)",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  fontSize: "13px",
                  color: "#94A3B8",
                  lineHeight: "1.8",
                }}>
                  <strong style={{ color: "#818CF8" }}>💡 How it works:</strong><br />
                  GitHub push by <code style={{ color: "#a5b4fc" }}>john-doe</code> →
                  DB lookup by <code style={{ color: "#a5b4fc" }}>githubUsername</code> →
                  email sent to <code style={{ color: "#22c55e" }}>john@yourcompany.com</code> ✅<br />
                  If not set → <strong style={{ color: "#ef4444" }}>no email is sent</strong>. No shared inbox. No default address.
                </div>
              </div>
            </div>

            {/* ── Database Status ── */}
            <div className="card" style={{ padding: "25px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <Database size={22} color="#22C55E" />
                <h2 style={{ margin: 0, fontSize: "20px" }}>Database & Code Indexing</h2>
              </div>
              <div>
                <label style={labelStyle}>MongoDB Atlas Status</label>
                <div style={{
                  padding: "14px 18px",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: "10px",
                  color: "#22C55E",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <span>● MongoDB Atlas Connected</span>
                  <span style={{ fontWeight: 600 }}>Connected</span>
                </div>
              </div>
            </div>

            {/* ── Save Button ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 28px", fontSize: "15px" }}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Settings"}
              </button>

              {saved && (
                <span style={{ color: "#22C55E", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                  <Check size={18} /> Saved! Webhooks will now notify you directly.
                </span>
              )}
              {error && (
                <span style={{ color: "#EF4444", fontSize: "14px" }}>{error}</span>
              )}
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default Settings;
