import { switchTheme } from "../utils/themeSwitch.ts";

export function ThemeSwitcher() {
  const themes = ["default", "coffee", "forest", "ocean"];

  return (
    <div>
      {themes.map((theme) => (
        <button
          key={theme}
          onClick={() => switchTheme(theme)}
          className="css-button-3d"
        >
          {theme}
        </button>
      ))}
    </div>
  );
}
