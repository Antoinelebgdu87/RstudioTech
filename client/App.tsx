import { useState } from "react";

function App() {
  const [licenseKey, setLicenseKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const validateLicense = async () => {
    if (!licenseKey.trim()) {
      setError("Veuillez saisir votre clé de licence");
      return;
    }

    setIsValidating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/validate-license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ licenseKey: licenseKey.trim() }),
      });

      const data = await response.json();

      if (data.success && data.user && data.license) {
        setSuccess("✅ Licence validée avec succès !");
        localStorage.setItem("license_key", licenseKey.trim());
        localStorage.setItem("user_data", JSON.stringify(data.user));
        localStorage.setItem("license_data", JSON.stringify(data.license));

        setTimeout(() => {
          setIsAuthenticated(true);
        }, 1500);
      } else {
        setError(data.error || "Licence invalide");
      }
    } catch (error) {
      console.error("Erreur validation:", error);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateLicense();
  };

  if (isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>🎉</div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              marginBottom: "20px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Bienvenue dans RStudio Tech IA !
          </h1>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "30px" }}>
            Votre licence a été validée avec succès. Vous avez maintenant accès
            à toutes les fonctionnalités de l'IA.
          </p>
          <div
            style={{ display: "flex", gap: "15px", justifyContent: "center" }}
          >
            <button
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                color: "white",
                border: "none",
                padding: "15px 30px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              💬 Commencer à chatter
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("license_key");
                localStorage.removeItem("user_data");
                localStorage.removeItem("license_data");
                setIsAuthenticated(false);
                setLicenseKey("");
                setSuccess("");
              }}
              style={{
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                padding: "15px 30px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
            }}
          >
            🔐
          </div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "10px",
            }}
          >
            RStudio Tech IA
          </h1>
          <p style={{ color: "#666", fontSize: "18px" }}>
            Entrez votre clé de licence pour accéder à l'IA
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Clé de licence
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              disabled={isValidating}
              placeholder="Saisissez votre clé..."
              style={{
                width: "100%",
                padding: "15px",
                border: "2px solid #e1e5e9",
                borderRadius: "10px",
                fontSize: "16px",
                textAlign: "center",
                fontFamily: "monospace",
                backgroundColor: isValidating ? "#f5f5f5" : "white",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Messages */}
          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              ❌ {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "#dcfce7",
                border: "1px solid #bbf7d0",
                color: "#16a34a",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating || !licenseKey.trim()}
            style={{
              width: "100%",
              padding: "15px",
              background:
                isValidating || !licenseKey.trim()
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor:
                isValidating || !licenseKey.trim() ? "not-allowed" : "pointer",
              transition: "all 0.3s",
            }}
          >
            {isValidating
              ? "🔄 Validation..."
              : success
                ? "✅ Accès autorisé !"
                : "🚀 Accéder à l'IA"}
          </button>
        </form>

        {/* Clés de test */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "15px",
            }}
          >
            🔧 Clés de test disponibles
          </h3>
          {[
            { key: "test-trial-123", type: "Trial", desc: "100 messages" },
            { key: "test-basic-456", type: "Basic", desc: "1000 messages" },
            {
              key: "test-premium-789",
              type: "Premium",
              desc: "10000 messages",
            },
            { key: "test-unlimited-000", type: "Unlimited", desc: "Illimité" },
          ].map((license) => (
            <div
              key={license.key}
              onClick={() => setLicenseKey(license.key)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                margin: "5px 0",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.2s",
                background:
                  licenseKey === license.key ? "#e0e7ff" : "transparent",
              }}
            >
              <div>
                <span
                  style={{
                    background: "#4f46e5",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "500",
                    marginRight: "8px",
                  }}
                >
                  {license.type}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#475569",
                  }}
                >
                  {license.key}
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                {license.desc}
              </span>
            </div>
          ))}
          <p
            style={{
              fontSize: "12px",
              color: "#64748b",
              textAlign: "center",
              marginTop: "10px",
              fontStyle: "italic",
            }}
          >
            💡 Cliquez sur une clé pour la sélectionner
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
