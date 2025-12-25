// src/utils/apiHelpers.ts
export const safeParseResponse = <T>(data: any): T[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data as T[];
    if (typeof data === 'object' && data !== null) return [data] as T[];
    return [];
};

export const safeParseSingle = <T>(data: any): T | null => {
    if (!data) return null;
    if (Array.isArray(data) && data.length > 0) return data[0] as T;
    if (typeof data === 'object') return data as T;
    return null;
};

export const formatCurrency = (amount: number | null | undefined): string => {
    if (!amount && amount !== 0) return 'Не указано';
    return `${amount.toLocaleString('ru-RU')} ₽`;
};

export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Не указано';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('ru-RU');
    } catch {
        return dateString;
    }
};

export const getDefaultValue = <T>(value: T | null | undefined, defaultValue: T): T => {
    return value !== null && value !== undefined ? value : defaultValue;
};