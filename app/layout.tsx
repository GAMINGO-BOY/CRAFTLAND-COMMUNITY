export const metadata = {
  title: 'File Sharing App',
  description: 'Download and upload files',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
