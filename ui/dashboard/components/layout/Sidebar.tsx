'use client';

import React from 'react';

interface SidebarProps {
  className?: string;
}

interface MenuItemProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function MenuItem({ icon, active = false, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-10 h-10 rounded-md transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: active 
          ? 'var(--color-primary-dark)' 
          : 'transparent',
        border: active ? '1px solid var(--color-primary)' : 'none',
      }}
    >
      <div 
        className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {icon}
      </div>
    </button>
  );
}

function ProjectsIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 8.25C3 7.00736 4.00736 6 5.25 6H8.75C9.99264 6 11 7.00736 11 8.25V11.75C11 12.9926 9.99264 14 8.75 14H5.25C4.00736 14 3 12.9926 3 11.75V8.25Z"
        fill={active ? 'white' : 'var(--color-neutral-400)'}
      />
      <path
        d="M13 8.25C13 7.00736 14.0074 6 15.25 6H18.75C19.9926 6 21 7.00736 21 8.25V11.75C21 12.9926 19.9926 14 18.75 14H15.25C14.0074 14 13 12.9926 13 11.75V8.25Z"
        fill={active ? 'white' : 'var(--color-neutral-400)'}
      />
      <path
        d="M3 15.25C3 14.0074 4.00736 13 5.25 13H8.75C9.99264 13 11 14.0074 11 15.25V18.75C11 19.9926 9.99264 21 8.75 21H5.25C4.00736 21 3 19.9926 3 18.75V15.25Z"
        fill={active ? 'white' : 'var(--color-neutral-400)'}
      />
      <path
        d="M13 15.25C13 14.0074 14.0074 13 15.25 13H18.75C19.9926 13 21 14.0074 21 15.25V18.75C21 19.9926 19.9926 21 18.75 21H15.25C14.0074 21 13 19.9926 13 18.75V15.25Z"
        fill={active ? 'white' : 'var(--color-neutral-400)'}
      />
    </svg>
  );
}

function SettingsIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25ZM9.75 12C9.75 10.7574 10.7574 9.75 12 9.75C13.2426 9.75 14.25 10.7574 14.25 12C14.25 13.2426 13.2426 14.25 12 14.25C10.7574 14.25 9.75 13.2426 9.75 12Z"
        fill={active ? 'white' : 'var(--color-neutral-400)'}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.0175 3.04931C11.1737 2.9836 11.3624 2.9836 11.5186 3.04931L13.0175 3.70385C13.4887 3.89395 13.9928 3.89395 14.464 3.70385L15.9629 3.04931C16.4341 2.85921 16.9621 2.93094 17.3739 3.1881L18.6984 3.97584C19.1102 4.233 19.3962 4.64652 19.4869 5.12248L19.8053 6.7491C19.9289 7.41161 20.3167 7.99639 20.8766 8.35802L22.2011 9.14576C22.613 9.40292 22.899 9.81644 22.9896 10.2924L23.3081 11.919C23.3988 12.395 23.2766 12.8884 22.9757 13.2716L21.8787 14.6783C21.4523 15.2258 21.2686 15.9195 21.3685 16.6005L21.6869 18.2271C21.7776 18.7031 21.6554 19.1965 21.3545 19.5797L20.2575 20.9864C19.9566 21.3696 19.5097 21.6015 19.0271 21.6252L17.3686 21.7009C16.6817 21.7316 16.0376 22.0463 15.5869 22.5721L14.49 23.9788C14.1891 24.362 13.7422 24.5939 13.2596 24.6176L11.601 24.6933C10.9142 24.724 10.2454 24.4756 9.75464 23.9999L8.65766 22.5932C8.207 22.0674 7.56289 21.7527 6.87601 21.722L5.21742 21.6463C4.73485 21.6226 4.28793 21.3907 3.98701 21.0075L2.89003 19.6008C2.58911 19.2176 2.46696 18.7242 2.55762 18.2482L2.87601 16.6217C2.97594 15.9406 2.79217 15.247 2.36575 14.6995L1.26877 13.2928C0.967852 12.9096 0.845696 12.4162 0.936358 11.9402L1.25474 10.3136C1.34541 9.83763 1.63139 9.42412 2.04326 9.16696L3.36777 8.37922C3.92766 8.01759 4.31552 7.43281 4.43907 6.7703L4.75746 5.14372C4.84813 4.66776 5.13411 4.25424 5.54597 3.99708L6.87048 3.20934C7.28235 2.95218 7.81035 2.88045 8.28152 3.07055L9.78042 3.72509C10.2516 3.91519 10.7556 3.91519 11.2268 3.72509L11.0175 3.04931ZM12.0181 4.54689C11.6757 4.66719 11.3106 4.66719 10.9682 4.54689L9.46928 3.89235C9.48057 3.89695 9.49227 3.90077 9.50433 3.90377L11.0032 4.55831C11.6369 4.81427 12.3494 4.81427 12.9831 4.55831L14.482 3.90377C14.9532 3.71367 15.4813 3.78541 15.893 4.04257L17.2175 4.83031C17.6294 5.08747 17.9154 5.50099 18.0061 5.97695L18.3244 7.60353C18.448 8.26604 18.8359 8.85082 19.3958 9.21245L20.7203 10.0002C21.1321 10.2574 21.4181 10.6709 21.5088 11.1468L21.8272 12.7734C21.9179 13.2494 21.7957 13.7428 21.4948 14.126L20.3978 15.5327C19.9714 16.0802 19.7876 16.7739 19.8876 17.4549L20.206 19.0815C20.2967 19.5574 20.1745 20.0508 19.8736 20.434L18.7766 21.8407C18.4757 22.2239 18.0288 22.4558 17.5462 22.4795L15.8877 22.5552C15.2008 22.5859 14.5567 22.9006 14.106 23.4264L13.009 24.8331C12.7081 25.2163 12.2612 25.4482 11.7786 25.4719L10.12 25.5476C9.43316 25.5783 8.76439 25.3299 8.27363 24.8542L7.17665 23.4475C6.726 22.9217 6.08188 22.607 5.39501 22.5763L3.73642 22.5006C3.25384 22.4769 2.80693 22.245 2.50601 21.8618L1.40902 20.4551C1.1081 20.0719 0.985952 19.5785 1.07661 19.1025L1.395 17.4759C1.49493 16.7949 1.31116 16.1012 0.884741 15.5537L-0.212238 14.147C-0.513154 13.7638 -0.635311 13.2704 -0.544648 12.7944L-0.226261 11.1678C-0.135599 10.6919 0.150377 10.2783 0.562244 10.0212L1.88675 9.23344C2.44665 8.87181 2.8345 8.28703 2.95806 7.62452L3.27645 5.99794C3.36711 5.52198 3.65309 5.10846 4.06496 4.8513L5.38947 4.06356C5.80133 3.8064 6.32934 3.73467 6.8005 3.92477L8.29941 4.57931C8.60176 4.69961 8.92447 4.75976 9.24718 4.75976C9.56989 4.75976 9.8926 4.69961 10.195 4.57931L12.0181 4.54689Z"
        fill={active ? 'white' : 'var(--color-neutral-400)'}
        stroke={active ? 'white' : 'var(--color-neutral-400)'}
        strokeWidth="0.5"
      />
    </svg>
  );
}

function Logo() {
  return (
    <div className="relative w-10 h-9 flex items-center justify-center">
      {/* Stylized "N" logo using multiple colored bars */}
      <div className="absolute left-0 top-0 w-[13px] h-[36px]">
        <div className="w-full h-full" style={{ background: 'linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)' }} />
      </div>
      <div className="absolute left-[7px] top-0 w-[13px] h-[36px]">
        <div className="w-full h-full" style={{ background: 'linear-gradient(180deg, #818CF8 0%, #6366F1 100%)' }} />
      </div>
      <div className="absolute left-[13px] top-0 w-[13px] h-[36px]">
        <div className="w-full h-full" style={{ background: 'linear-gradient(180deg, #A5B4FC 0%, #818CF8 100%)' }} />
      </div>
      <div className="absolute left-[20px] top-0 w-[20px] h-[36px]">
        <div className="w-full h-full" style={{ background: 'linear-gradient(180deg, #C7D2FE 0%, #A5B4FC 100%)' }} />
      </div>
    </div>
  );
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const [activeMenu, setActiveMenu] = React.useState<'projects' | 'settings'>('projects');

  return (
    <aside
      className={`flex flex-col items-center py-4 ${className}`}
      style={{
        width: '72px',
        backgroundColor: '#151357', // Indigo/900 from Figma
        height: '100vh',
      }}
    >
      {/* Logo */}
      <a 
        href="/" 
        className="mb-6 flex items-center justify-center w-10 h-10"
        aria-label="Home"
      >
        <Logo />
      </a>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 flex-1">
        <MenuItem
          icon={<ProjectsIcon active={activeMenu === 'projects'} />}
          active={activeMenu === 'projects'}
          onClick={() => setActiveMenu('projects')}
        />
        
        <MenuItem
          icon={<SettingsIcon active={activeMenu === 'settings'} />}
          active={activeMenu === 'settings'}
          onClick={() => setActiveMenu('settings')}
        />
      </nav>
    </aside>
  );
}
