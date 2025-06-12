interface User {
  email: string;
  name: string;  
  createdAt: string;
  updatedAt: string;
}

interface State {
    user: User;
    token: string;
    isAuthenticated: boolean;
}

interface JWTAuthState {
    state: State;
}