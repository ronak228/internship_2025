import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Initial state
const initialState = {
  // User data
  user: null,
  isAuthenticated: false,
  
  // App settings
  theme: 'default',
  notifications: true,
  
  // Data counts for dashboard
  stats: {
    totalDocuments: 0,
    totalBlogPosts: 0,
    lastActivity: null,
  },
  
  // Loading states
  loading: {
    auth: false,
    weather: false,
    crypto: false,
    blog: false,
    documents: false,
  },
  
  // Error states
  errors: {
    auth: null,
    weather: null,
    crypto: null,
    blog: null,
    documents: null,
  }
};

// Action types
const actionTypes = {
  // Auth actions
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  
  // Settings actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  // Stats actions
  UPDATE_STATS: 'UPDATE_STATS',
  
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  
  // Error actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_START:
      return {
        ...state,
        loading: { ...state.loading, auth: true },
        errors: { ...state.errors, auth: null }
      };
      
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: { ...state.loading, auth: false },
        errors: { ...state.errors, auth: null }
      };
      
    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: { ...state.loading, auth: false },
        errors: { ...state.errors, auth: action.payload }
      };
      
    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: { ...state.loading, auth: false },
        errors: { ...state.errors, auth: null }
      };
      
    case actionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        ...action.payload
      };
      
    case actionTypes.UPDATE_STATS:
      return {
        ...state,
        stats: { ...state.stats, ...action.payload }
      };
      
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };
      
    case actionTypes.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value }
      };
      
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload]: null }
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [persistedUser, setPersistedUser] = useLocalStorage('user', null);
  const [persistedSettings, setPersistedSettings] = useLocalStorage('app_settings', {
    theme: 'default',
    notifications: true
  });

  // Load persisted data on mount
  useEffect(() => {
    if (persistedUser) {
      dispatch({
        type: actionTypes.LOGIN_SUCCESS,
        payload: persistedUser
      });
    }
    
    if (persistedSettings) {
      dispatch({
        type: actionTypes.UPDATE_SETTINGS,
        payload: persistedSettings
      });
    }
    
    // Load stats from localStorage
    updateStats();
  }, []);

  // Actions
  const login = (userData) => {
    dispatch({ type: actionTypes.LOGIN_START });
    
    try {
      // Simulate API call
      setTimeout(() => {
        const user = {
          ...userData,
          loginTime: new Date().toISOString()
        };
        
        setPersistedUser(user);
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: user
        });
        
        updateStats();
      }, 1000);
    } catch (error) {
      dispatch({
        type: actionTypes.LOGIN_FAILURE,
        payload: error.message
      });
    }
  };

  const logout = () => {
    setPersistedUser(null);
    dispatch({ type: actionTypes.LOGOUT });
  };

  const updateSettings = (settings) => {
    const newSettings = { ...persistedSettings, ...settings };
    setPersistedSettings(newSettings);
    dispatch({
      type: actionTypes.UPDATE_SETTINGS,
      payload: newSettings
    });
  };

  const updateStats = () => {
    try {
      // Get stats from localStorage
      const documents = JSON.parse(localStorage.getItem('doc_editor_documents') || '[]');
      const blogPosts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
      
      const stats = {
        totalDocuments: documents.length,
        totalBlogPosts: blogPosts.length,
        lastActivity: new Date().toISOString(),
      };
      
      dispatch({
        type: actionTypes.UPDATE_STATS,
        payload: stats
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const setLoading = (key, value) => {
    dispatch({
      type: actionTypes.SET_LOADING,
      payload: { key, value }
    });
  };

  const setError = (key, value) => {
    dispatch({
      type: actionTypes.SET_ERROR,
      payload: { key, value }
    });
  };

  const clearError = (key) => {
    dispatch({
      type: actionTypes.CLEAR_ERROR,
      payload: key
    });
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    updateSettings,
    updateStats,
    setLoading,
    setError,
    clearError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Export action types for external use
export { actionTypes };

export default useAppContext;
