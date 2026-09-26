const handlePasswordSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  const envPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  if (envPassword && passwordInput === envPassword) {
    setIsAuthenticated(true);
  } else {
    alert("Invalid Password!");
  }
};
