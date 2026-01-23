import { useState } from 'react';

const ToggleThemes = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark'),
  );
  return (
    <>
      <button
        onClick={() => {
          const root = document.documentElement;
          const next = !isDark;

          root.classList.toggle('dark', next);
          setIsDark(next);
        }}
        className="fixed top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-lg"
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </>
  );
};

export default ToggleThemes;
