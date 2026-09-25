import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const revalidate = 0; // Fresh data dikhane ke liye

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 800, margin: "auto" }}>
      <h1>Available Files & Media</h1>
      <p>Click below to download uploaded files.</p>

      {posts.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
          {posts.map((post) => (
            <div key={post.id} style={{ border: "1px solid #ccc", padding: 15, borderRadius: 8 }}>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <a 
                href={post.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: "inline-block", 
                  padding: "8px 16px", 
                  background: "blue", 
                  color: "white", 
                  textDecoration: "none", 
                  borderRadius: 4 
                }}
              >
                Download File
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
