const LogOut = () => {
  const handleLogOut = () => {
    localStorage.removeItem("userName");
    window.location.reload();
  };

  return <button onClick={handleLogOut}>Log Out</button>;
};

export default LogOut;
