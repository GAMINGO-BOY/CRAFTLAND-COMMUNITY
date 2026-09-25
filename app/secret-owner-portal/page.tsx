"use client";
import { useState } from "react";

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [auth, setAuth] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!auth) {
    return (
      <div style={{ padding: 40, maxWidth: 400, margin: "auto" }}>
        <h2>Owner Login</h2>
        <input 
          type="password" 
          placeholder="Password Enter Karein" 
          onChange={(e) => setPass(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <button 
          onClick={() => pass === "SECRET_PASS" ? setAuth(true) : alert("Wrong Password")}
          style={{ width: "100%", padding: 10, background: "black", color: "white" }}
        >
          Login
        </button>
      </div>
    );
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    // Post save logic
    alert("Uploaded successfully!");
    setLoading(false);
  };

  return (
    <form onSubmit={handleUpload} style={{ padding: 40, maxWidth: 500, margin: "auto" }}>
      <h2>Upload New File</h2>
      <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
      <textarea placeholder="Description" onChange={(e) => setDesc(e.target.value)} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required style={{ marginBottom: 10 }} />
      <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, background: "green", color: "white" }}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
