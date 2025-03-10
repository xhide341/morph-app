export const switchTheme = (themeName: string): void => {
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("theme", themeName);
};

export const initTheme = (): void => {
  const savedTheme = localStorage.getItem("theme") || "default";
  switchTheme(savedTheme);
};
