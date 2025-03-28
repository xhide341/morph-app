import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { switchTheme } from "../utils/theme-switch.ts";

export const ThemeToggle = () => {
  const themes = ["coffee", "forest", "ocean"];

  return (
    <div className="flex">
      <Menu>
        <MenuButton className="bg-primary hover:bg-primary/80 text-foreground inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm focus:outline-none data-[focus]:outline-1 data-[focus]:outline-[var(--color-foreground)] data-[hover]:bg-[var(--color-secondary)] data-[open]:bg-[var(--color-secondary)]">
          Theme
          <ChevronDownIcon className="size-4 fill-[var(--color-foreground)]/60" />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom"
          className="w-52 origin-top-right rounded-xl border border-[var(--color-secondary)] bg-[var(--color-primary)] p-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {themes.map((theme) => (
            <MenuItem key={theme}>
              <button
                onClick={() => switchTheme(theme)}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[var(--color-foreground)] data-[focus]:bg-[var(--color-secondary)]"
              >
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
