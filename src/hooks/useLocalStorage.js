import { useState, useEffect } from 'react';

// Custom hook for localStorage management
export const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook for managing multiple localStorage keys
export const useMultipleLocalStorage = (keys) => {
  const [data, setData] = useState({});

  useEffect(() => {
    const loadData = () => {
      const loadedData = {};
      keys.forEach(key => {
        try {
          const item = window.localStorage.getItem(key);
          loadedData[key] = item ? JSON.parse(item) : null;
        } catch (error) {
          console.log(`Error reading localStorage key "${key}":`, error);
          loadedData[key] = null;
        }
      });
      setData(loadedData);
    };

    loadData();
  }, [keys]);

  const updateData = (key, value) => {
    try {
      const valueToStore = value instanceof Function ? value(data[key]) : value;
      setData(prev => ({ ...prev, [key]: valueToStore }));
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(`Error setting localStorage key "${key}":`, error);
    }
  };

  const clearData = (key) => {
    try {
      setData(prev => ({ ...prev, [key]: null }));
      window.localStorage.removeItem(key);
    } catch (error) {
      console.log(`Error removing localStorage key "${key}":`, error);
    }
  };

  const clearAllData = () => {
    try {
      keys.forEach(key => {
        window.localStorage.removeItem(key);
      });
      const clearedData = {};
      keys.forEach(key => {
        clearedData[key] = null;
      });
      setData(clearedData);
    } catch (error) {
      console.log('Error clearing localStorage:', error);
    }
  };

  return { data, updateData, clearData, clearAllData };
};

// Hook for localStorage with expiration
export const useLocalStorageWithExpiry = (key, initialValue, ttl = null) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsedItem = JSON.parse(item);
      
      // Check if item has expiry
      if (parsedItem.expiry && ttl) {
        const now = new Date().getTime();
        if (now > parsedItem.expiry) {
          window.localStorage.removeItem(key);
          return initialValue;
        }
        return parsedItem.value;
      }
      
      // If no expiry structure, return as is (backward compatibility)
      return parsedItem.value !== undefined ? parsedItem.value : parsedItem;
    } catch (error) {
      console.log(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      const item = {
        value: valueToStore,
        expiry: ttl ? new Date().getTime() + ttl : null
      };
      
      window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.log(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook for managing app-wide settings
export const useAppSettings = () => {
  const [settings, setSettings] = useLocalStorage('app_settings', {
    theme: 'default',
    language: 'en',
    notifications: true,
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      theme: 'default',
      language: 'en',
      notifications: true,
      autoSave: true,
      autoSaveInterval: 30000,
    });
  };

  return { settings, updateSetting, resetSettings };
};

// Export all hooks
export default useLocalStorage;
