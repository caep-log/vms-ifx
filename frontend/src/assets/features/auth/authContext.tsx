import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { apiClient } from '../../infrastructure/http/apiClient';

export type UserRole = 'Admin' | 'Client';

export interface AuthUser {
    id?: string;
    name?: string;
    email?: string;
    role: UserRole;
}

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
    status: AuthStatus;
    user: AuthUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const toAuthUser = (payload: unknown): AuthUser | null => {
    if (!isRecord(payload)) {
        return null;
    }

    const candidate = isRecord(payload.user)
        ? payload.user
        : isRecord(payload.data)
            ? payload.data
            : payload;
    const role = candidate.role;

    if (role !== 'Admin' && role !== 'Client') {
        return null;
    }

    return {
        id: typeof candidate.id === 'string' ? candidate.id : undefined,
        name: typeof candidate.name === 'string' ? candidate.name : undefined,
        email: typeof candidate.email === 'string' ? candidate.email : undefined,
        role,
    };
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('checking');
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        let cancelled = false;
        const sessionPath = import.meta.env.VITE_API_SESSION_URL?.trim() || '/api/users/session';

        apiClient
            .get<unknown>(sessionPath, {
                requiresAuth: false,
                skipAuthRefresh: true,
            })
            .then((payload) => {
                if (cancelled) {
                    return;
                }

                const nextUser = toAuthUser(payload);
                setUser(nextUser);
                setStatus(nextUser ? 'authenticated' : 'unauthenticated');
            })
            .catch(() => {
                if (!cancelled) {
                    setUser(null);
                    setStatus('unauthenticated');
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const login = async (email: string, password: string) => {
        const payload = await apiClient.post<unknown, { email: string; password: string }>(
            import.meta.env.VITE_API_LOGIN_URL?.trim() || '/api/users/login',
            { email, password },
            { requiresAuth: false, skipAuthRefresh: true },
        );
        const nextUser = toAuthUser(payload);

        if (!nextUser) {
            throw new Error('La respuesta de autenticación no contiene un usuario válido');
        }

        setUser(nextUser);
        setStatus('authenticated');
    };

    const value = useMemo<AuthContextValue>(() => ({
        status,
        user,
        isAuthenticated: status === 'authenticated',
        isAdmin: user?.role === 'Admin',
        login,
    }), [status, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}
