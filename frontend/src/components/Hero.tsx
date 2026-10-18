import React from 'react';

interface HeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({ title, subtitle, children }) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800/60 py-16 sm:py-20">
      {/* Ambient glowing radial effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[40rem] rounded-full bg-red-600/15 blur-[100px]" />
        <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-red-900/10 blur-[80px]" />
        <div className="absolute top-1/3 -right-24 h-64 w-64 rounded-full bg-red-600/10 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
};
