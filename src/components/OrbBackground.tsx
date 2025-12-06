export const OrbBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Primary orb - top right */}
      <div 
        className="orb orb-primary animate-float w-[600px] h-[600px] -top-48 -right-48"
      />
      
      {/* Secondary orb - bottom left */}
      <div 
        className="orb orb-secondary animate-float-delayed w-[500px] h-[500px] -bottom-32 -left-32"
      />
      
      {/* Accent orb - center */}
      <div 
        className="orb orb-accent animate-float-slow w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      
      {/* Dark overlay for depth */}
      <div className="absolute inset-0 bg-background/40" />
    </div>
  );
};
