import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { switchTheme } from "../utils/theme-switch.ts";

export function ThemeToggle() {
  const themes = ["coffee", "forest", "ocean"];

  return (
    <div className="mt-4 flex">
      <Menu>
        <MenuButton className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm/6 font-semibold text-[var(--color-foreground)] shadow-[var(--color-foreground)]/10 shadow-inner focus:outline-none data-[focus]:outline-1 data-[focus]:outline-[var(--color-foreground)] data-[hover]:bg-[var(--color-secondary)] data-[open]:bg-[var(--color-secondary)]">
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
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-[var(--color-secondary)]"
              >
                {theme}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
}
