import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { openEncoder, openExample } from './e2e-utils'

async function openBoPEncoding(page: Page, maxPathLength: number, maxPaths: number) {
  await page.goto('/')

  await openExample(page, 'UML', 'deployment.uml')
  const modelForm = page.getByTestId('model-form')
  await modelForm.getByTestId('Associations-accordion-toggle').click()
  await modelForm.getByLabel('Only Containment Associations').click()
  await modelForm.getByLabel('Relationships as Edges').click()

  await openEncoder(page, 'Bag-of-Paths')

  const encoderForm = page.getByTestId('encoder-form')
  await encoderForm.getByTestId('Paths-accordion-toggle').click()
  await encoderForm.getByLabel('Max Paths').fill(`${maxPaths}`)
  await encoderForm.getByLabel('Max Path Length').fill(`${maxPathLength}`)

  const pathGraphs = page.getByTestId('path-graph')
  const nthPathGraph = (index: number) => pathGraphs.nth(index)
  const selectAll = (index: number) => nthPathGraph(index).getByTestId('path-graph-select-all').click()
  const weight = (index: number) => nthPathGraph(index).getByTestId('path-graph-weight')

  return { pathGraphs, selectAll, weight }
}

test.describe(`selections`, () => {
  test('can select all edges', async ({ page }) => {
    const { selectAll } = await openBoPEncoding(page, 2, 2)

    await selectAll(0)
    const firstEdgeDetails = page.getByTestId('edge-details-group')
    await firstEdgeDetails.getByText('FirstDeployment', { exact: true }).waitFor()
    await firstEdgeDetails.getByText('ownedElement').waitFor()

    await selectAll(1)
    const secondEdgeDetails = page.getByTestId('edge-details-group')
    await secondEdgeDetails.getByText('SecondDeployment', { exact: true }).waitFor()
    await secondEdgeDetails.getByText('ownedElement').waitFor()
  })

  test('shows path weights', async ({ page }) => {
    const { weight } = await openBoPEncoding(page, 3, 100)
    expect(weight(0)).toHaveText('3.00')
    expect(weight(99)).toHaveText('2.00')
  })
})
