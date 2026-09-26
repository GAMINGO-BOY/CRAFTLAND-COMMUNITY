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

  const handlePollSelection = (containerEl: any, maxLimit: number, targetEl: any) => {
    const selectedCount = containerEl.querySelectorAll(".poll-selected").length;
    if (targetEl.classList.contains("poll-selected")) {
      targetEl.classList.remove("poll-selected");
    } else {
      if (selectedCount < maxLimit) {
        targetEl.classList.add("poll-selected");
      } else {
        alert(`You can select a maximum of ${maxLimit} option(s)!`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400 font-semibold animate-pulse">Loading Craftland Feed...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 flex justify-center">
      <div className="w-full max-w-2xl">
        <header className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Craftland Community
          </h1>
          <a
            href="/secret-owner-portal"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-md transition"
          >
            Admin Portal 🔐
          </a>
        </header>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <p className="text-center text-slate-500 py-10">No posts published yet.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className={`bg-slate-800/80 border ${
                  post.isPinned ? "border-indigo-500 shadow-indigo-500/10 shadow-lg" : "border-slate-700"
                } rounded-xl p-5 relative`}
              >
                {post.isPinned && (
                  <span className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    📌 Pinned
                  </span>
                )}

                <h2 className="text-xl font-bold text-white mb-4">{post.title}</h2>

                {/* Render Dynamic Content Blocks */}
                <div className="space-y-4">
                  {Array.isArray(post.blocks) &&
                    post.blocks.map((block: any, idx: number) => {
                      if (block.type === "text") {
                        return <p key={idx} className="text-slate-300 leading-relaxed">{block.content}</p>;
                      }
                      if (block.type === "image") {
                        return <img key={idx} src={block.content} alt="Post Attachment" className="w-full rounded-lg max-h-[400px] object-cover" />;
                      }
                      if (block.type === "video") {
                        return <video key={idx} controls src={block.content} className="w-full rounded-lg max-h-[400px]" />;
                      }
                      if (block.type === "audio") {
                        return <audio key={idx} controls src={block.content} className="w-full mt-2" />;
                      }
                      if (block.type === "link") {
                        return (
                          <a key={idx} href={block.content} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline break-all block">
                            🔗 {block.content}
                          </a>
                        );
                      }
                      if (block.type === "code") {
                        return (
                          <div key={idx} className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
                            <div className="bg-slate-800 px-3 py-1.5 flex justify-between items-center border-b border-slate-700">
                              <span className="text-xs font-bold text-slate-400">CODE SNIPPET</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(block.content);
                                  alert("Code copied to clipboard!");
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded transition"
                              >
                                📋 Copy Code
                              </button>
                            </div>
                            <pre className="p-3 text-sm text-indigo-300 font-mono overflow-x-auto whitespace-pre-wrap">
                              <code>{block.content}</code>
                            </pre>
                          </div>
                        );
                      }
                      if (block.type === "poll") {
                        return (
                          <div key={idx} className="bg-slate-950 border border-slate-700 p-4 rounded-lg">
                            <span className="text-xs font-bold text-slate-400 block mb-2">
                              POLL (Select up to {block.maxSelection || 1} option/s):
                            </span>
                            <div className="space-y-2">
                              {block.options?.map((opt: string, oIdx: number) => (
                                <div
                                  key={oIdx}
                                  onClick={(e) =>
                                    handlePollSelection(
                                      e.currentTarget.parentElement,
                                      block.maxSelection || 1,
                                      e.currentTarget
                                    )
                                  }
                                  className="bg-slate-800 border border-slate-700 p-2.5 rounded-md cursor-pointer hover:border-indigo-500 transition [&.poll-selected]:border-indigo-500 [&.poll-selected]:bg-indigo-950/40 font-medium text-sm"
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                </div>

                {/* View Comments Toggle */}
                <button
                  onClick={() => toggleComments(post.id)}
                  className="w-full mt-5 bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 font-semibold text-sm px-4 py-2.5 rounded-lg flex justify-between items-center transition"
                >
                  <span>💬 View Comments ({post.comments?.length || 0})</span>
                  <span>{openComments[post.id] ? "▲" : "▼"}</span>
                </button>

                {/* Comments Section */}
                {openComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments
                        .filter((c: any) => !c.parentId)
                        .map((comment: any) => (
                          <div key={comment.id} id={`comment-${comment.id}`} className="border-l-2 border-slate-700 pl-3">
                            <span className="text-xs font-bold text-slate-400">{comment.user}</span>
                            <p className="text-sm text-slate-200 mt-0.5">{comment.text}</p>

                            {/* Render Nested Replies */}
                            {post.comments
                              .filter((r: any) => r.parentId === comment.id)
                              .map((reply: any) => (
                                <div key={reply.id} className="ml-4 border-l-2 border-indigo-500/50 pl-2 mt-2">
                                  <span className="text-xs font-bold text-indigo-400">{reply.user}</span>
                                  <p className="text-xs text-slate-300">{reply.text}</p>
                                </div>
                              ))}

                            {/* Reply Action */}
                            <button
                              onClick={() => setShowReplyBox((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                              className="text-xs font-bold text-indigo-400 hover:underline mt-1 block"
                            >
                              Reply
                            </button>

                            {showReplyBox[comment.id] && (
                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  placeholder="Write a reply..."
                                  value={replyInputs[comment.id] || ""}
                                  onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                                  className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs px-3 py-1.5 rounded focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                  onClick={() => handleAddComment(post.id, comment.id)}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                                >
                                  Send
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-slate-500">No comments yet. Be the first to comment!</p>
                    )}

                    {/* Add Root Comment */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Write a public comment..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
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
