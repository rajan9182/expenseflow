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

// Category helpers with FontAwesome icons
export const getCategoryColor = (category) => {
    const colors = {
        Groceries: 'success',
        Bills: 'warning',
        Medical: 'danger',
        Entertainment: 'primary',
        Shopping: 'secondary',
        Transport: 'info',
        Education: 'primary',
        Food: 'success',
        Other: 'secondary',
    };
    return colors[category] || 'secondary';
};

export const getCategoryIcon = (category) => {
    const icons = {
        Groceries: 'fa-solid fa-cart-shopping',
        Bills: 'fa-solid fa-file-invoice-dollar',
        Medical: 'fa-solid fa-kit-medical',
        Entertainment: 'fa-solid fa-film',
        Shopping: 'fa-solid fa-bag-shopping',
        Transport: 'fa-solid fa-car',
        Education: 'fa-solid fa-graduation-cap',
        Food: 'fa-solid fa-utensils',
        Other: 'fa-solid fa-ellipsis',
    };
    return icons[category] || 'fa-solid fa-circle';
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
