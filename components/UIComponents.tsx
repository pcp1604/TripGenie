
import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  type = 'button',
  icon: Icon
}: { 
  children: React.ReactNode; 
  onClick?: React.MouseEventHandler<HTMLButtonElement>; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; 
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ElementType;
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-serif font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive disabled:pointer-events-none disabled:opacity-50 h-12 px-6";
  
  const variants = {
    primary: "bg-brand-deep text-white hover:bg-brand-deep/90 shadow-lg shadow-brand-deep/20",
    secondary: "bg-brand-olive text-brand-deep hover:bg-brand-olive/80",
    outline: "border-2 border-brand-deep/20 bg-transparent hover:bg-brand-deep/5 text-brand-deep",
    ghost: "hover:bg-brand-light/50 text-brand-deep",
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!disabled && Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: React.MouseEventHandler<HTMLDivElement> }) => (
  <div onClick={onClick} className={`rounded-2xl border border-brand-deep/10 bg-white/80 backdrop-blur-sm text-brand-deep shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-3 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-display font-bold text-xl text-brand-deep ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline' | 'success'; className?: string }) => {
  const variants = {
    default: "bg-brand-deep/10 text-brand-deep",
    secondary: "bg-brand-olive/20 text-brand-deep",
    outline: "border border-brand-deep/20 text-brand-deep",
    success: "bg-green-100 text-green-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-brand-deep/80 mb-2 block ${className}`}>
    {children}
  </label>
);

export const Input = ({ value, onChange, placeholder, type = 'text', className = '', onKeyDown }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    className={`flex h-12 w-full rounded-xl border border-brand-deep/20 bg-white px-4 py-2 text-base placeholder:text-brand-deep/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive disabled:cursor-not-allowed disabled:opacity-50 font-sans transition-all ${className}`}
  />
);

export const Textarea = ({ value, onChange, placeholder, rows = 4, className = '' }: any) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`flex min-h-[80px] w-full rounded-xl border border-brand-deep/20 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-brand-deep/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-brand-deep/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FDFCF5] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-brand-deep/10">
        <div className="flex justify-between items-center p-6 border-b border-brand-deep/10">
          <h3 className="font-display font-bold text-2xl text-brand-deep">{title}</h3>
          <button onClick={onClose} className="text-brand-deep/50 hover:text-brand-deep transition-colors">
            &times;
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
