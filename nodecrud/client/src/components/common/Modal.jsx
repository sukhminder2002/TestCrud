import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ title, children, footer, onClose, wide = false }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={`modal ${wide ? 'modal-wide' : ''}`}>
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
