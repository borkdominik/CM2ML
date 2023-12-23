import { useEffect, useState } from 'react'

import { loadExample } from '../lib/exampleModel'
import { useAppState } from '../lib/useAppState'

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './ui/menubar'

export function Menu() {
  const { clearEncoder, clearModel, encoder, fitGraph, model, setModel } =
    useAppState()
  return (
    <Menubar className="rounded-none">
      <MenubarMenu>
        <MenubarTrigger>Model</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => setModel(loadExample())}>
            Load Example
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={clearModel} disabled={model === undefined}>
            Close
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Encoder</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={clearEncoder} disabled={encoder === undefined}>
            Close
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Model</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem disabled={model === undefined} onClick={fitGraph}>
                Fit
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <ThemeSubMenu />
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

const themes = ['light', 'dark'] as const

type Theme = (typeof themes)[number]

function ThemeSubMenu() {
  const body = document.getElementsByTagName('body')[0]
  const [theme, setTheme] = useState<Theme>(() =>
    body?.classList.contains('dark') ? 'dark' : 'light',
  )
  useEffect(() => {
    if (theme === 'light') {
      body?.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      body?.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }, [theme])
  return (
    <MenubarSub>
      <MenubarSubTrigger>Theme</MenubarSubTrigger>
      <MenubarSubContent>
        {themes.map((th) => (
          <MenubarItem
            disabled={th === theme}
            key={th}
            onClick={() => setTheme(th)}
          >
            <span className="capitalize">{th}</span>
          </MenubarItem>
        ))}
      </MenubarSubContent>
    </MenubarSub>
  )
}
