"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { workspacePath } from "@/lib/workspace";
import {
  authService,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "@/services/auth.service";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (data: LoginInput) => Promise<void>;
  signup: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  canWrite: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function clearAuthStorage() {
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("user");
}

interface AuthErrorBody {
  message?: unknown;
  source?: unknown;
  note?: unknown;
  data?: unknown;
}

function rejectionNote(payload: {
  note?: unknown;
  data?: unknown;
}): string | null {
  if (typeof payload.note === "string" && payload.note.trim().length > 0) {
    return payload.note.trim();
  }

  if (
    payload.data !== null &&
    typeof payload.data === "object" &&
    "note" in payload.data
  ) {
    const nestedNote = (payload.data as { note?: unknown }).note;

    if (typeof nestedNote === "string" && nestedNote.trim().length > 0) {
      return nestedNote.trim();
    }
  }

  return null;
}

function withRejectionNote(message: string, note: unknown): string {
  return typeof note === "string" && note.trim().length > 0
    ? `${message} Reason: ${note.trim()}`
    : message;
}

function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as AuthErrorBody | undefined;

    if (typeof body?.message === "string" && body.message.length > 0) {
      return body.source === "accountRejected"
        ? withRejectionNote(body.message, rejectionNote(body))
        : body.message;
    }
  }

  return "Unable to reach the server. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      // Token semantics are project-specific: only hydrate when a bearer
      // token exists (alumnai relies on cookie sessions instead).
      const token = window.localStorage.getItem("accessToken");

      if (!token) {
        if (active) {
          setIsLoading(false);
        }
        return;
      }

      let storedUser: AuthUser | null = null;
      const rawUser = window.localStorage.getItem("user");

      if (rawUser) {
        try {
          storedUser = JSON.parse(rawUser) as AuthUser;
          if (active) {
            setUser(storedUser);
          }
        } catch {
          window.localStorage.removeItem("user");
        }
      }

      try {
        const response = await authService.getMe();

        if (!active) {
          return;
        }

        if (response.status === "success" && response.data) {
          // Update the cached user with the latest server data.
          setUser(response.data);
          window.localStorage.setItem("user", JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Session verification failed", error);

        if (!active) {
          return;
        }

        // Only clear the session on a definitive auth failure (401/403).
        // Network/offline errors keep the stored user, matching alumnai.
        const status = isAxiosError(error) ? error.response?.status : undefined;

        if (status === 401 || status === 403) {
          clearAuthStorage();
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (data: LoginInput) => {
      let response: Awaited<ReturnType<typeof authService.login>>;

      try {
        response = await authService.login(data);
      } catch (error) {
        toast.error(errorMessage(error));
        throw error;
      }

      if (response.status !== "success" || !response.data) {
        const message = response.message || "Unable to sign in.";

        toast.error(
          response.source === "accountRejected"
            ? withRejectionNote(message, rejectionNote(response))
            : message,
        );

        throw new Error(message);
      }

      const { token, user } = response.data;

      if (user.status && user.status !== "verified") {
        toast.error(
          "Your account is not verified yet. Contact an administrator for approval.",
        );

        throw new Error("Your account is not verified yet.");
      }

      window.localStorage.setItem("accessToken", token);
      window.localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      toast.success(response.message || "Signed in successfully.");

      // Deliberate deviation from the alumnai reference: that project uses
      // cookie sessions and needs a full document navigation, while this app
      // persists bearer tokens in localStorage, so a client-side push works.
      router.push(workspacePath(user));
    },
    [router],
  );

  const signup = useCallback(async (data: RegisterInput) => {
    const normalized: RegisterInput = {
      ...data,
      department_id:
        data.role === "department_head" ? (data.department_id ?? null) : null,
    };

    // Axios errors (including 422 validation bodies) propagate raw so their
    // callers can map field-level errors.
    const response = await authService.register(normalized);

    if (response.status === "success") {
      toast.success(response.message || "Registration submitted.");
      return;
    }

    if (response.source === "emailExists") {
      toast.error("Email already registered.");
      throw new Error("emailExists");
    }

    toast.error(response.message || "Unable to submit registration.");
    throw new Error(response.message || "Unable to submit registration.");
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await authService.logout();

      if (response.status === "success") {
        toast.success(response.message || "Signed out successfully.");
      } else {
        toast.error(response.message || "Unable to sign out.");
      }
    } catch {
      toast.error(
        "The server could not be reached. Your local session was cleared.",
      );
    } finally {
      clearAuthStorage();
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      setUser,
      login,
      signup,
      logout,
      isAdmin: user?.role === "admin",
      canWrite: user?.role === "admin" || user?.role === "registrar",
    }),
    [user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
