import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { apiClient } from '../../infrastructure/http/apiClient';
import type { AuthStatus, UserRole, ApiRole } from '../../shared/types/types';

export interface AuthUser {
    id?: string;
    name?: string;
    email?: string;
    role: UserRole;
}

interface AuthContextValue {
    status: AuthStatus;
    user: AuthUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, profile?: string) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
}

interface AuthResponse {
    user: Omit<AuthUser, 'role'>;
    role: ApiRole;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const toAuthUser = ({ user, role }: AuthResponse): AuthUser => ({
    ...user,
    role: role === 'Administrador' ? 'Admin' : 'Client',
});

const getSession = async (): Promise<AuthUser | null> => {
    try {
        const response = await apiClient.get<AuthResponse>('/api/users/session', {
            requiresAuth: false,
            skipAuthRefresh: true,
        });

        return toAuthUser(response);
    } catch {
        return null;
    }
};

const signupRequest = async (
    email: string,
    password: string,
    profile: string,
): Promise<AuthUser> => {
    const response = await apiClient.post<AuthResponse, {
        email: string;
        password: string;
        role: string;
    }>(
        '/api/users/sign-up',
        { email, password, role: profile },
        { requiresAuth: false, skipAuthRefresh: true },
    );

    return toAuthUser(response);
};

const loginRequest = async (email: string, password: string): Promise<AuthUser> => {
    const response = await apiClient.post<AuthResponse, { email: string; password: string }>(
        '/api/users/login',
        { email, password },
        { requiresAuth: false, skipAuthRefresh: true },
    );

    return toAuthUser(response);
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('checking');
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        let cancelled = false;
        getSession().then((nextUser) => {
            if (cancelled) return;
            setUser(nextUser);
            setStatus(nextUser ? 'authenticated' : 'unauthenticated');
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const login = async (email: string, password: string) => {
        const nextUser = await loginRequest(email, password);
        setUser(nextUser);
        setStatus('authenticated');
    };

    const signUp = async (email: string, password: string, profile?: string) => {
        const nextUser = await signupRequest(email, password, profile ?? '');
        setUser(nextUser);
        setStatus('authenticated');
    };

    const logout = async () => {
        await apiClient.post<void>('/api/users/logout', undefined, {
            requiresAuth: false,
            skipAuthRefresh: true,
        });
        setUser(null);
        setStatus('unauthenticated');
    };

    const deleteAccount = async () => {
        await apiClient.delete<void>('/api/users/delete-user');
        setUser(null);
        setStatus('unauthenticated');
    };

    const value: AuthContextValue = {
        status,
        user,
        isAuthenticated: status === 'authenticated',
        isAdmin: user?.role === 'Admin',
        login,
        signUp,
        logout,
        deleteAccount,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}
