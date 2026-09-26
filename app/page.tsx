"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [showReplyBox, setShowReplyBox] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = (postId: string) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = async (postId: string, parentId?: string) => {
    const text = parentId ? replyInputs[parentId] : commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, user: "Public User", text, parentId }),
      });

      if (res.ok) {
        if (parentId) {
          setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
          setShowReplyBox((prev) => ({ ...prev, [parentId]: false }));
        } else {
          setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        }
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400 font-medium animate-pulse">Loading Feed...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <header className="pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Craftland Community
          </h1>
        </header>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No posts available.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className={`bg-slate-900 border ${
                  post.isPinned ? "border-indigo-500/80 shadow-indigo-500/10 shadow-lg" : "border-slate-800"
                } rounded-xl p-5 relative space-y-4`}
              >
                {post.isPinned && (
                  <span className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    📌 Pinned
                  </span>
                )}

                <h2 className="text-xl font-bold text-white">{post.title}</h2>

                <div className="space-y-3">
                  {Array.isArray(post.blocks) &&
                    post.blocks.map((block: any, idx: number) => {
                      if (block.type === "text") {
                        return <p key={idx} className="text-slate-300 text-sm leading-relaxed">{block.content}</p>;
                      }
                      if (block.type === "image") {
                        return <img key={idx} src={block.content} alt="Attachment" className="w-full rounded-lg max-h-[400px] object-cover" />;
                      }
                      if (block.type === "video") {
                        return <video key={idx} controls src={block.content} className="w-full rounded-lg max-h-[400px]" />;
                      }
                      if (block.type === "audio") {
                        return <audio key={idx} controls src={block.content} className="w-full mt-2" />;
                      }
                      if (block.type === "file") {
                        return (
                          <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex justify-between items-center">
                            <span className="text-xs text-slate-300 truncate font-mono">📁 Attached File</span>
                            <a href={block.content} target="_blank" rel="noreferrer" download className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded transition">
                              Download File ⬇️
                            </a>
                          </div>
                        );
                      }
                      if (block.type === "link") {
                        return (
                          <a key={idx} href={block.content} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline text-xs break-all block">
                            🔗 {block.content}
                          </a>
                        );
                      }
                      if (block.type === "code") {
                        return (
                          <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                            <div className="bg-slate-800/60 px-3 py-1.5 flex justify-between items-center border-b border-slate-800">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">CODE SNIPPET</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(block.content);
                                  alert("Copied code!");
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded transition"
                              >
                                📋 Copy
                              </button>
                            </div>
                            <pre className="p-3 text-xs text-indigo-300 font-mono overflow-x-auto whitespace-pre-wrap">
                              <code>{block.content}</code>
                            </pre>
                          </div>
                        );
                      }
                      return null;
                    })}
                </div>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs px-4 py-2.5 rounded-lg flex justify-between items-center transition"
                >
                  <span>💬 Comments ({post.comments?.length || 0})</span>
                  <span className="text-base font-bold text-indigo-400">{openComments[post.id] ? "−" : "+"}</span>
                </button>

                {openComments[post.id] && (
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments
                        .filter((c: any) => !c.parentId)
                        .map((comment: any) => (
                          <div key={comment.id} className="border-l-2 border-slate-700 pl-3 space-y-1">
                            <span className="text-[11px] font-bold text-slate-400">{comment.user}</span>
                            <p className="text-xs text-slate-200">{comment.text}</p>

                            {post.comments
                              .filter((r: any) => r.parentId === comment.id)
                              .map((reply: any) => (
                                <div key={reply.id} className="ml-3 border-l-2 border-indigo-500/40 pl-2 mt-1">
                                  <span className="text-[10px] font-bold text-indigo-400">{reply.user}</span>
                                  <p className="text-[11px] text-slate-300">{reply.text}</p>
                                </div>
                              ))}

                            <button
                              onClick={() => setShowReplyBox((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                              className="text-[10px] font-bold text-indigo-400 hover:underline block"
                            >
                              Reply
                            </button>

                            {showReplyBox[comment.id] && (
                              <div className="flex gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Reply..."
                                  value={replyInputs[comment.id] || ""}
                                  onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                                  className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs px-2.5 py-1 rounded outline-none focus:border-indigo-500"
                                />
                                <button
                                  onClick={() => handleAddComment(post.id, comment.id)}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded"
                                >
                                  Send
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-[11px] text-slate-500">No comments yet.</p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
