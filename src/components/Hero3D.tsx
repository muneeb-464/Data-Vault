const Hero3D = () => {
  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96" style={{ perspective: "800px" }}>
      {/* Rotating wireframe cube */}
      <div
        className="absolute inset-0 animate-rotate3d"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front face */}
        <div
          className="absolute inset-8 border-2 border-primary/40 rounded-2xl"
          style={{ transform: "translateZ(80px)", boxShadow: "0 0 30px hsl(199 95% 60% / 0.15), inset 0 0 30px hsl(199 95% 60% / 0.05)" }}
        />
        {/* Back face */}
        <div
          className="absolute inset-8 border-2 border-primary/20 rounded-2xl"
          style={{ transform: "translateZ(-80px)" }}
        />
        {/* Left face */}
        <div
          className="absolute inset-8 border-2 border-accent/20 rounded-2xl"
          style={{ transform: "rotateY(-90deg) translateZ(80px)" }}
        />
        {/* Right face */}
        <div
          className="absolute inset-8 border-2 border-accent/30 rounded-2xl"
          style={{ transform: "rotateY(90deg) translateZ(80px)", boxShadow: "0 0 20px hsl(168 76% 50% / 0.1)" }}
        />
        {/* Top face */}
        <div
          className="absolute inset-8 border-2 border-secondary/20 rounded-2xl"
          style={{ transform: "rotateX(90deg) translateZ(80px)" }}
        />
        {/* Bottom face */}
        <div
          className="absolute inset-8 border-2 border-secondary/15 rounded-2xl"
          style={{ transform: "rotateX(-90deg) translateZ(80px)" }}
        />

        {/* Inner sphere glow */}
        <div
          className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse-glow"
          style={{
            background: "radial-gradient(circle, hsl(199 95% 60% / 0.4) 0%, transparent 70%)",
            transform: "translate(-50%, -50%) translateZ(0px)",
          }}
        />
      </div>

      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(199 95% 60% / 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Floating particles */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/60"
          style={{
            top: `${20 + i * 20}%`,
            left: `${80 + (i % 2) * 15}%`,
            animation: `pulse-glow ${2 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Hero3D;
