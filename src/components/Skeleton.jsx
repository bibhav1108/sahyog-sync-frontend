const Skeleton = ({ 
  className = "", 
  variant = "default", 
  count = 1, 
  height, 
  width,
  containerClassName = "",
  style = {} 
}) => {
  const variants = {
    default: "rounded-xl",
    text: "rounded-md",
    circle: "rounded-full",
  };

  const skeletonStyle = {
    ...style,
    height: height || undefined,
    width: width || undefined,
  };

  const renderSkeleton = (index) => (
    <div
      key={index}
      style={skeletonStyle}
      className={`
        relative overflow-hidden
        ${variants[variant]}
        ${className}
        bg-white/[0.08]
        before:absolute before:inset-0
        before:bg-black/[0.1]
        before:content-['']
        border border-white/[0.08]
      `}
    >
      {/* 🚀 WAVE SHIMMER EFFECT */}
      <div
        className="
          absolute inset-0
          -translate-x-full
          animate-shimmer
          bg-gradient-to-r
          from-transparent
          via-white/[0.25]
          to-transparent
          opacity-80
        "
      />
    </div>
  );

  if (count > 1) {
    return (
      <div className={containerClassName || "space-y-3 w-full"}>
        {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
      </div>
    );
  }

  return renderSkeleton(0);
};

export default Skeleton;
