import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T>(key: string | null, initialValue: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
    const getInitialValue = () => {
        if (typeof window === "undefined" || !key) {
            return initialValue instanceof Function ? initialValue() : initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            // Don't parse 'undefined' string
            if (item && item !== 'undefined') {
                return JSON.parse(item);
            }
            return initialValue instanceof Function ? initialValue() : initialValue;
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return initialValue instanceof Function ? initialValue() : initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState<T>(getInitialValue);

    // This effect re-reads from localStorage if the key changes.
    // This is crucial for switching users.
    useEffect(() => {
        setStoredValue(getInitialValue());
    }, [key]);

    // This effect writes to localStorage whenever the key or value changes.
    useEffect(() => {
        if (typeof window !== "undefined" && key) {
            try {
                if (storedValue === undefined) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, JSON.stringify(storedValue));
                }
            } catch (error) {
                console.error("Error writing to localStorage", error);
            }
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}