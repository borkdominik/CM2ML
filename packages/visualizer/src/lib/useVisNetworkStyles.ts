import { useMemo } from 'react'
import type { EdgeOptions, NodeOptions } from 'vis-network/standalone/esm/vis-network'

import { useTheme } from './useTheme'

const fontFace = 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'

export function useVisNetworkStyles(styleSource: HTMLElement = document.body) {
  // Use theme as a dependency to update styles when theme changes
  const theme = useTheme.use.theme()
  return useMemo(() => {
    const colors = getColors(styleSource)
    const edgeStyles: EdgeOptions = {
      color: {
        color: colors.secondary.light,
        highlight: colors.primary.light,
        hover: colors.primary.light,
      },
      font: {
        color: colors.foreground.base,
        face: fontFace,
        strokeWidth: 0,
      },
      labelHighlightBold: false,
      scaling: {
        min: 2,
        max: 5,
      },
    }
    const nodeStyles: NodeOptions = {
      color: {
        background: colors.secondary.base,
        border: colors.secondary.dark,
        hover: colors.primary.light,
        highlight: {
          background: colors.primary.base,
          border: colors.primary.dark,
        },
      },
      font: {
        color: colors.secondaryForeground.base,
        face: fontFace,
      },
      labelHighlightBold: false,
    }
    const interactionStyles = {
      hover: true,
      hoverConnectedEdges: false,
      selectConnectedEdges: false,
    }
    return {
      colors,
      edgeStyles,
      interactionStyles,
      nodeStyles,
    }
  }, [styleSource, theme])
}

function getColors(element: HTMLElement) {
  const style = getComputedStyle(element)
  const modifier = 0.8
  function getColor(name: string) {
    const hsl = hslFromCss(style.getPropertyValue(name))
    return {
      base: hexFromHsl(hsl),
      dark: hexFromHsl([hsl[0], hsl[1], hsl[2] * modifier]),
      light: hexFromHsl([hsl[0], hsl[1], hsl[2] / modifier]),
    }
  }
  const foreground = getColor('--foreground')
  const primary = getColor('--primary')
  const primaryForeground = getColor('--primary-foreground')
  const secondary = getColor('--secondary')
  const secondaryForeground = getColor('--secondary-foreground')
  return {
    foreground,
    primary,
    primaryForeground,
    secondary,
    secondaryForeground,
  }
}

function hslFromCss(hsl: string): [number, number, number] {
  const [h, s, l] = hsl.replaceAll('%', '').split(' ').map(Number)
  if (h === undefined || s === undefined || l === undefined) {
    throw new Error(`Invalid HSL color: ${hsl}`)
  }
  return [h, s / 100, l / 100]
}

function hexFromHsl([h, s, l]: [number, number, number]) {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0') // convert to Hex and prefix "0" if needed
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
