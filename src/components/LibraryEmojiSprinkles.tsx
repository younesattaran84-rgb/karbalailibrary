import React, { useState, useEffect } from 'react';

interface FloatingEmoji {
  id: number;
  emoji: string;
  left: number; // percentage (0 - 100)
  duration: number; // seconds
  delay: number; // seconds
  size: number; // px
  rotation: number;
}

const LIBRARY_EMOJIS = ['📖', '📚', '📜', '✨', '🔖', '🕊️', '💡'];

export const LibraryEmojiSprinkles: React.FC = () => {
  const [ambientEmojis, setAmbientEmojis] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    // Phase 3: Controlled, balanced, and gentle ambient floating elements (7 items across screen)
    const items: FloatingEmoji[] = [
      { id: 1, emoji: '📖', left: 8, duration: 26, delay: 0, size: 20, rotation: -6 },
      { id: 2, emoji: '✨', left: 22, duration: 32, delay: 4, size: 16, rotation: 8 },
      { id: 3, emoji: '📚', left: 38, duration: 28, delay: 2, size: 22, rotation: -4 },
      { id: 4, emoji: '🕊️', left: 54, duration: 34, delay: 6, size: 18, rotation: 12 },
      { id: 5, emoji: '📜', left: 70, duration: 30, delay: 1, size: 20, rotation: -8 },
      { id: 6, emoji: '🔖', left: 84, duration: 25, delay: 5, size: 18, rotation: 6 },
      { id: 7, emoji: '💡', left: 94, duration: 33, delay: 3, size: 17, rotation: -5 },
    ];
    setAmbientEmojis(items);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    >
      {ambientEmojis.map((item) => (
        <span
          key={item.id}
          style={{
            position: 'absolute',
            left: `${item.left}%`,
            bottom: '-40px',
            fontSize: `${item.size}px`,
            animation: `emojiFloatDrift ${item.duration}s linear infinite`,
            animationDelay: `${item.delay}s`,
            transform: `rotate(${item.rotation}deg)`,
            opacity: 0.35,
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
            userSelect: 'none',
          }}
          className="transition-opacity duration-500"
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
};

