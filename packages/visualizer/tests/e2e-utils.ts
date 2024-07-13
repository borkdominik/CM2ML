import type { Page } from '@playwright/test'

export async function getIRGraph(page: Page) {
  return page.getByTestId('ir-graph').locator('canvas')
}

export async function useLayout(page: Page, layout: 'Compact' | 'Extended') {
  const menu = page.getByRole('menubar')
  await menu.getByText('View').click()
  await page.getByText('Layout').click()
  await page.getByText(layout).click()
}

export async function openExample(page: Page, language: 'UML', example: string) {
  const menu = page.getByRole('menubar')
  await menu.getByText('Model').click()
  await page.getByText('Examples').click()
  await page.getByText(language).click()
  await page.getByText(example).click()
}
