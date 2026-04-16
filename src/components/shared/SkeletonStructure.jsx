import React from 'react';

/**
 * SkeletonStructure renders a complex skeleton layout based on a configuration array.
 * 
 * Layout prop format:
 * [
 *   { type: 'row', gap: 4, cols: [
 *     { type: 'circle', size: 40 },
 *     { type: 'stack', gap: 2, items: [ { type: 'text', width: '60%' }, { type: 'text', width: '40%' } ] }
 *   ]},
 *   { type: 'grid', cols: 3, gap: 6, item: { type: 'rect', height: 100 } }
 * ]
 */
const Skeleton = ({ variant = "rect", width, height, className = "" }) => {
  const isCircle = variant === "circle";
  const isText = variant === "text";

  return (
    <div
      className={`
        relative overflow-hidden bg-surface_highest
        ${isCircle ? "rounded-full" : isText ? "rounded" : "rounded-2xl"}
        ${className}
      `}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <div className="absolute inset-0 bg-shimmer animate-shimmer" />
    </div>
  );
};

const SkeletonStructure = ({ layout = [], className = "" }) => {
  const renderItem = (item, index) => {
    switch (item.type) {
      case 'circle':
        return (
          <Skeleton 
            key={index} 
            variant="circle" 
            width={item.size} 
            height={item.size} 
            className={item.className}
          />
        );
      case 'text':
        return (
          <Skeleton 
            key={index} 
            variant="text" 
            width={item.width} 
            height={item.height || 12} 
            className={item.className}
          />
        );
      case 'rect':
        return (
          <Skeleton 
            key={index} 
            width={item.width || '100%'} 
            height={item.height || 100} 
            className={`rounded-2xl ${item.className || ''}`}
          />
        );
      case 'row':
        return (
          <div key={index} className={`flex items-center gap-${item.gap || 4} ${item.className || ''}`}>
            {item.cols.map((col, i) => renderItem(col, i))}
          </div>
        );
      case 'stack':
        return (
          <div key={index} className={`flex flex-col gap-${item.gap || 2} ${item.className || ''}`}>
            {item.items.map((it, i) => renderItem(it, i))}
          </div>
        );
      case 'grid':
        return (
          <div key={index} className={`grid grid-cols-1 lg:grid-cols-${item.cols || 1} gap-${item.gap || 6} ${item.className || ''}`}>
            {item.items 
              ? item.items.map((it, i) => renderItem(it, i))
              : Array.from({ length: item.count || item.cols }).map((_, i) => renderItem(item.item, i))
            }
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {layout.map((item, index) => renderItem(item, index))}
    </div>
  );
};

export default SkeletonStructure;
