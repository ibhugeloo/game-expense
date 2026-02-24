import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isError = type === 'error';

    return (
        <div className="toast-container">
            <div className={`toast toast-${type}`}>
                {isError ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                <span className="toast-message">{message}</span>
                <button className="toast-close" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
