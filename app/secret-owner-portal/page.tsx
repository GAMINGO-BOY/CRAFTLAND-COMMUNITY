"use client";

import { useState, useEffect } from "react";

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [tempBlocks, setTempBlocks] = useState<any[]>([]);
  const [fileAttachments, setFileAttachments] = useState<{ [key: number]: File }>({});

  useEffect(() => {
    if (isAuthenticated) fetchAdminPosts();
  }, [isAuthenticated]);

  const fetchAdminPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "SECRET_PASS" || passwordInput === "12345" || passwordInput === "admin") {
      setIsAuthenticated(true);
    } else {
      alert("Wrong Owner Password!");
    }
  };

  const addBlock = (type: string) => {
    if (type === "poll") {
      setTempBlocks([...tempBlocks, { type: "poll", maxSelection: 1, options: ["Option 1", "Option 2"] }]);
    } else {
      setTempBlocks([...tempBlocks, { type, content: "" }]);
    }
  };

  const moveBlock = (index: number, direction: number) => {
    if ((direction === -1 && index > 0) || (direction === 1 && index < tempBlocks.length - 1)) {
      const updated = [...tempBlocks];
      const target = updated[index + direction];
      updated[index + direction] = updated[index];
      updated[index] = target;
      setTempBlocks(updated);
    }
  };

  const removeBlock = (index: number) => {
    setTempBlocks(tempBlocks.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!postTitle.trim()) return alert("Post Title is required");

    const formData = new FormData();
    formData.append("title", postTitle);
    formData.append("blocks", JSON.stringify(tempBlocks));

    // Append attached raw media files
    Object.keys(fileAttachments).forEach((keyIdx) => {
      formData.append(`file_${keyIdx}`, fileAttachments[parseInt(keyIdx)]);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setIsEditorOpen(false);
        setPostTitle("");
        setTempBlocks([]);
        setFileAttachments({});
        fetchAdminPosts();
      } else {
        alert("Upload Failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePin = async (id: string, currentPinned: boolean) => {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !currentPinned }),
    });
    fetchAdminPosts();
  };

  const deletePost = async (id: string) => {
    if (confirm("Delete this post permanently?")) {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      fetchAdminPosts();
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <form onSubmit={handlePasswordSubmit} className="bg-slate-800 border border-slate-700 p-6 rounded-xl w-full max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2">Owner Verification</h2>
          <p className="text-xs text-slate-400 mb-4">Enter secret owner password to unlock admin controls.</p>
          <input
            type="password"
            placeholder="Enter Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg mb-4 text-center outline-none focus:border-indigo-500"
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition">
            Verify & Unlock
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 flex justify-center">
      <div className="w-full max-w-2xl">
        <header className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-indigo-400">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Full Content & Notification Controls</p>
          </div>
          <a href="/" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-md">
            View Public Feed 🌐
          </a>
        </header>

        {/* Comment Notification Center */}
        <section className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6">
          <h3 className="text-sm font-bold text-indigo-400 mb-3">🔔 Notification Center (Recent User Interactions)</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {posts.flatMap((p) => p.comments || []).length === 0 ? (
              <p className="text-xs text-slate-500">No comments received yet.</p>
            ) : (
              posts.flatMap((p) =>
                (p.comments || []).map((c: any) => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs">
                    <span className="font-bold text-slate-200">{c.user}:</span> "{c.text}"
                    <div className="text-[10px] text-slate-500 mt-1">On Post Title: "{p.title}"</div>
                  </div>
                ))
              )
            )}
          </div>
        </section>

        {/* Action Header with Plus Icon */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-200">Manage Posts</h2>
          <button
            onClick={() => {
              setEditingPostId(null);
              setPostTitle("");
              setTempBlocks([]);
              setIsEditorOpen(true);
            }}
            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-2xl font-bold flex items-center justify-center shadow-lg shadow-indigo-600/30 transition"
          >
            +
          </button>
        </div>

        {/* Posts Control Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">{post.title}</span>
                <span className="text-xs text-slate-400">
                  {post.isPinned ? "📌 Pinned Post" : "Standard Feed Post"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePin(post.id, post.isPinned)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                >
                  {post.isPinned ? "Unpin" : "Pin"}
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Post Builder Modal */}
        {isEditorOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-white">Create New Post</h3>

              <input
                type="text"
                placeholder="Post Title..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg outline-none focus:border-indigo-500"
              />

              <div>
                <label className="text-xs text-slate-400 block mb-2">Add Content Components:</label>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => addBlock("text")} className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">+ Text</button>
                  <button onClick={() => addBlock("image")} className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">📷 Image</button>
                  <button onClick={() => addBlock("video")} className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">🎥 Video</button>
                  <button onClick={() => addBlock("audio")} className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">🎵 Audio</button>
                  <button onClick={() => addBlock("link")} className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">+ Link</button>
                  <button onClick={() => addBlock("poll")} className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">+ Poll</button>
                  <button onClick={() => addBlock("code")} className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">+ Code</button>
                </div>
              </div>

              {/* Dynamic Reorderable Block Items */}
              <div className="space-y-3">
                {tempBlocks.map((block, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-700 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-400 uppercase">{block.type} BLOCK</span>
                      <div className="flex gap-1">
                        <button onClick={() => moveBlock(idx, -1)} className="bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded">▲ Up</button>
                        <button onClick={() => moveBlock(idx, 1)} className="bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded">▼ Down</button>
                        <button onClick={() => removeBlock(idx)} className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded">✕</button>
                      </div>
                    </div>

                    {(block.type === "text" || block.type === "code") && (
                      <textarea
                        rows={2}
                        placeholder={`Enter ${block.type}...`}
                        value={block.content}
                        onChange={(e) => {
                          const updated = [...tempBlocks];
                          updated[idx].content = e.target.value;
                          setTempBlocks(updated);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded outline-none"
                      />
                    )}

                    {["image", "video", "audio"].includes(block.type) && (
                      <input
                        type="file"
                        accept={`${block.type}/*`}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFileAttachments({ ...fileAttachments, [idx]: e.target.files[0] });
                          }
                        }}
                        className="text-xs text-slate-400"
                      />
                    )}

                    {block.type === "link" && (
                      <input
                        type="text"
                        placeholder="Enter URL Link..."
                        value={block.content}
                        onChange={(e) => {
                          const updated = [...tempBlocks];
                          updated[idx].content = e.target.value;
                          setTempBlocks(updated);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded outline-none"
                      />
                    )}

                    {block.type === "poll" && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Options (comma separated)"
                          value={block.options?.join(", ")}
                          onChange={(e) => {
                            const updated = [...tempBlocks];
                            updated[idx].options = e.target.value.split(",").map((s) => s.trim());
                            setTempBlocks(updated);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">Max Choices Allowed:</span>
                          <input
                            type="number"
                            value={block.maxSelection || 1}
                            min={1}
                            onChange={(e) => {
                              const updated = [...tempBlocks];
                              updated[idx].maxSelection = parseInt(e.target.value) || 1;
                              setTempBlocks(updated);
                            }}
                            className="w-16 bg-slate-800 border border-slate-700 text-white text-xs p-1 rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsEditorOpen(false)} className="bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg">
                  Cancel
                </button>
                <button onClick={handlePublish} className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg">
                  Publish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
