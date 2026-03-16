import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = size === 'sm' ? 'sm:max-w-md' : size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-xl';

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className={`${widthClass} w-full max-h-[90vh] sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl shadow-2xl animate-modal-in flex flex-col sm:mx-4`} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
