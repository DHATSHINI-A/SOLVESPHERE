import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Role, User, NotificationItem } from '../types';
import usersData from '../data/mockData/users.json';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  role: Role;
  login: (role: Role, customName?: string, orgName?: string) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  markAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sih_auth_session_v3';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(`${AUTH_STORAGE_KEY}_is_auth`) === 'true';
  });

  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem(`${AUTH_STORAGE_KEY}_role`) as Role) || 'citizen';
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${AUTH_STORAGE_KEY}_user`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return (usersData as User[])[0];
      }
    }
    return (usersData as User[])[0];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: 'AI Matching Complete',
      message: 'Your submitted water contamination problem has 3 verified academic-industry partner matches.',
      timestamp: '10m ago',
      read: false,
      type: 'ai_match',
    },
    {
      id: 'n-2',
      title: 'Milestone Approved',
      message: 'IIT Madras lab marked TRL-6 prototype bench-testing as completed.',
      timestamp: '1h ago',
      read: false,
      type: 'success',
    },
  ]);

  useEffect(() => {
    localStorage.setItem(`${AUTH_STORAGE_KEY}_is_auth`, String(isAuthenticated));
    localStorage.setItem(`${AUTH_STORAGE_KEY}_role`, role);
    if (user) {
      localStorage.setItem(`${AUTH_STORAGE_KEY}_user`, JSON.stringify(user));
    } else {
      localStorage.removeItem(`${AUTH_STORAGE_KEY}_user`);
    }
  }, [isAuthenticated, role, user]);

  const login = (newRole: Role, customName?: string, orgName?: string) => {
    const defaultUser = (usersData as User[]).find((u) => u.role === newRole) || (usersData as User[])[0];
    const loggedUser: User = {
      ...defaultUser,
      role: newRole,
      name: customName || defaultUser.name,
      organization: orgName || defaultUser.organization || defaultUser.org,
    };

    setUser(loggedUser);
    setRole(newRole);
    setIsAuthenticated(true);
    localStorage.setItem('sih_auth_token', `demo-jwt-token-${newRole}`);

    addNotification(
      'Authentication Successful',
      `Welcome to SolutionHub, ${loggedUser.name} (${newRole.toUpperCase()} Portal).`,
      'success'
    );
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('sih_auth_token');
    localStorage.removeItem(`${AUTH_STORAGE_KEY}_is_auth`);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: User = { ...prev, ...updatedFields };
      localStorage.setItem(`${AUTH_STORAGE_KEY}_user`, JSON.stringify(updated));
      return updated;
    });

    addNotification(
      'Profile Updated',
      'Your profile information and contact details have been successfully saved.',
      'success'
    );
  };

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'info') => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      type,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role,
        login,
        logout,
        updateUser,
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Backwards compatibility hook
export const useApp = () => useAuth();
