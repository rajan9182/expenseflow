// Currency formatter for INR
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

// Date formatter
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Get category color class from category object
export const getCategoryColor = (categoryObj) => {
    if (!categoryObj) return 'secondary';
    // Convert hex color to badge class
    const colorMap = {
        '#2563eb': 'primary',
        '#10b981': 'success',
        '#f59e0b': 'warning',
        '#ef4444': 'danger',
        '#64748b': 'secondary',
        '#06b6d4': 'info',
    };
    return colorMap[categoryObj.color] || 'secondary';
};

// Get category icon from category object
export const getCategoryIcon = (categoryObj) => {
    if (!categoryObj) return 'fa-solid fa-circle';
    return categoryObj.icon || 'fa-solid fa-circle';
};

// Payment method helpers with FontAwesome icons
export const getPaymentMethodColor = (method) => {
    const colors = {
        Cash: 'success',
        UPI: 'primary',
        Card: 'warning',
        'Net Banking': 'info',
    };
    return colors[method] || 'secondary';
};

export const getPaymentMethodIcon = (method) => {
    const icons = {
        Cash: 'fa-solid fa-money-bill-wave',
        UPI: 'fa-solid fa-mobile-screen-button',
        Card: 'fa-solid fa-credit-card',
        'Net Banking': 'fa-solid fa-building-columns',
    };
    return icons[method] || 'fa-solid fa-wallet';
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
};

// Month names
export const getMonthName = (monthIndex) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Get initials from name
export const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Format number with commas
export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
};

// Get relative time (e.g., "2 days ago")
export const getRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(date);
};

// Validate email
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Truncate text
export const truncate = (str, length = 50) => {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
};
