import { switchTheme } from "../utils/theme-switch.ts";

export function ThemeToggle() {
  const themes = ["coffee", "forest", "ocean"];

  return (
    <div>
      <select
        onChange={(e) => switchTheme(e.target.value)}
        className="css-button-3d w-24 p-2 text-center"
      >
        {themes.map((theme) => (
          <option
            key={theme}
            value={theme}
            className="active:bg-primary focus:bg-primary"
          >
            {theme}
          </option>
        ))}
      </select>
    </div>
  );
}
