import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the types for the state
interface AuthState {
  loading: boolean;
  token: string | null;
  user: Record<string, any> | null;
}

// Initial state with type
const initialState: AuthState = {
  loading: false,
  token: localStorage.getItem("token") || null,
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ Type for setLoading
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    // ✅ Type for setToken
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
    },
    // ✅ Type for setUser
    setUser(state, action: PayloadAction<Record<string, any> | null>) {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.loading = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

// Export actions
export const { setLoading, setToken, setUser, logout } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
