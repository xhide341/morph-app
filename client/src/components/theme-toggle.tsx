import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { switchTheme } from "../utils/theme-switch.ts";

export const ThemeToggle = () => {
  const themes = [
    "coffee",
    "forest",
    "ocean",
    "sunset",
    "mint",
    "lavender",
    "arctic",
    "desert",
  ];

  return (
    <div className="flex">
      <Menu>
        <MenuButton className="bg-primary hover:bg-primary/80 text-foreground data-[focus]:outline-foreground data-[open]:bg-secondary inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm tracking-wide focus:outline-none data-[focus]:outline-1">
          Theme
          <ChevronDownIcon className="size-4 fill-[var(--color-foreground)]" />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom"
          className="border-secondary bg-primary/50 max-h-[300px] w-32 origin-top-right overflow-y-auto rounded-lg border p-1 text-sm/6 backdrop-blur-lg transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {themes.map((theme) => (
            <MenuItem key={theme}>
              <button
                onClick={() => switchTheme(theme)}
                className={`group text-foreground data-[focus]:bg-secondary hover:bg-secondary/50 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm tracking-wide capitalize peer-hover:data-[focus]:bg-transparent`}
              >
                <div
                  className={`bg-primary-hint size-3 rounded-full theme-${theme}-hint`}
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
