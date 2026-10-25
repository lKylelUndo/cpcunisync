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

import {
  authService,
  type AuthUser,
  type LoginInput,
} from "@/services/auth.service";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
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

    const hydrate = async () => {
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
          setUser(response.data);
          window.localStorage.setItem("user", JSON.stringify(response.data));
        } else {
          clearAuthStorage();
          setUser(null);
        }
      } catch (error) {
        if (!active) {
          return;
        }

        const status = isAxiosError(error) ? error.response?.status : undefined;

        if (status === 401 || status === 403) {
          clearAuthStorage();
          setUser(null);
        } else if (!storedUser) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (data: LoginInput) => {
      try {
        const response = await authService.login(data);

        if (response.status !== "success" || !response.data) {
          const message = response.message || "Unable to sign in.";

          toast.error(
            response.source === "accountRejected"
              ? withRejectionNote(message, rejectionNote(response))
              : message,
          );
          return false;
        }

        const { token, user } = response.data;

        if (user.status && user.status !== "verified") {
          toast.error(
            "Your account is not verified yet. Contact an administrator for approval.",
          );
          return false;
        }

        window.localStorage.setItem("accessToken", token);
        window.localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        toast.success(response.message || "Signed in successfully.");
        router.push(user.role === "admin" ? "/admin" : "/");

        return true;
      } catch (error) {
        toast.error(errorMessage(error));
        throw error;
      }
    },
    [router],
  );

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
      login,
      logout,
      isAuthenticated: user !== null,
      isAdmin: user?.role === "admin",
      canWrite: user?.role === "admin" || user?.role === "registrar",
    }),
    [user, isLoading, login, logout],
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
