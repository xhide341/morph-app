import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { switchTheme } from "../utils/theme-switch.ts";

export const ThemeToggle = () => {
  const themes = ["coffee", "forest", "ocean", "lavender"];

  return (
    <div className="flex">
      <Menu>
        <MenuButton
          className="bg-primary hover:bg-primary/90 text-background data-[focus]:outline-foreground data-[open]:bg-secondary inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-2 text-xs font-thin tracking-wide focus:outline-none data-[focus]:outline-1"
          aria-label="Theme selection menu"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Theme
          <ChevronDownIcon className="fill-background size-4" aria-hidden="true" />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom"
          className="border-secondary bg-primary/80 max-h-[300px] w-32 origin-top-right overflow-y-auto rounded-lg border p-1 text-xs/6 backdrop-blur-lg transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          aria-label="Theme options"
        >
          {themes.map((theme) => (
            <MenuItem key={theme}>
              <button
                onClick={() => switchTheme(theme)}
                className={`group text-background hover:bg-secondary/30 data-[focus]:bg-secondary/30 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs tracking-wide capitalize peer-hover:data-[focus]:bg-transparent`}
                role="menuitem"
                aria-label={`Switch to ${theme} theme`}
              >
                <div
                  className={`bg-primary-hint size-3 rounded-full theme-${theme}-hint`}
                  aria-hidden="true"
                />
                {theme}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};

export default ThemeToggle;
