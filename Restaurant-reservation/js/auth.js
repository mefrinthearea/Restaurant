// js/auth.js
class AuthManager {
  static users = {
    user:  { password: "1234", role: "visitor", name: "Mario Rossi" },
    admin: { password: "admin", role: "admin",   name: "Admin Trattoria" }
  };

  static login(username, password) {
    const user = this.users[username];
    if (user && user.password === password) {
      sessionStorage.setItem("currentUser", JSON.stringify({ username, ...user }));
      return true;
    }
    return false;
  }

  static logout() {
    sessionStorage.removeItem("currentUser");
  }

  static getCurrentUser() {
    const data = sessionStorage.getItem("currentUser");
    return data ? JSON.parse(data) : null;
  }

  static isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === "admin";
  }

  static isLoggedIn() {
    return !!this.getCurrentUser();
  }
}