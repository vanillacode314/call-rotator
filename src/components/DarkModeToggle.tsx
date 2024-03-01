import { As, useColorMode } from "@kobalte/core";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function DarkModeToggle() {
  const { setColorMode } = useColorMode();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <As component={Button} variant="ghost" size="sm" class="w-9 px-0">
          <div class="i-radix-icons:sun text-xl rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <div class="i-radix-icons:moon text-xl absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <div class="sr-only">Toggle theme</div>
        </As>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => setColorMode("light")}>
          <div class="i-radix-icons:sun mr-2 size-4" />
          <div>Light</div>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setColorMode("dark")}>
          <div class="i-radix-icons:moon mr-2 size-4" />
          <div>Dark</div>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setColorMode("system")}>
          <div class="i-radix-icons:laptop mr-2 size-4" />
          <div>System</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
