export const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '---';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

export const formatVA = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const num = parseFloat(value);
    if (isNaN(num)) return '-';
    if (num >= 1) return `${Math.round(num)}/10`;
    return `${Math.round(num * 10)}/10`;
};

export const formatDiopter = (value) => {
    if (value === null || value === undefined || value === '') return '0.00';
    const num = parseFloat(value);
    if (isNaN(num) || num === 0) return '0.00';
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
};

export const formatAxis = (value) => {
    if (value === null || value === undefined || value === '') return '0°';
    return `${value}°`;
};

export const recordFormatters = { formatDate, formatVA, formatDiopter, formatAxis };
