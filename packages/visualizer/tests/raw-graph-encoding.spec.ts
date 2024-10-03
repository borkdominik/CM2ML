import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { openEncoder, openExample, selectLayout } from './e2e-utils'

async function openRawGraphEncoding(page: Page) {
  await page.goto('/')
  await openExample(page, 'UML', 'deployment.uml')
  const modelForm = page.getByTestId('model-form')
  await modelForm.getByTestId('Associations-accordion-toggle').click()
  await modelForm.getByLabel('Only Containment Associations').click()
  await modelForm.getByLabel('Relationships as Edges').click()
  await openEncoder(page, 'Raw graph')
}

async function openRawGraphListEncoding(page: Page) {
  await openRawGraphEncoding(page)

  const rawGraphList = page.getByTestId('raw-graph-list')
  await rawGraphList.waitFor()
  const selectedNode = rawGraphList.getByTestId('selected-node')
  const selectedEdge = rawGraphList.getByTestId('selected-edge')
  return { rawGraphList, selectedNode, selectedEdge }
}

test.describe('list', () => {
  test.describe('selections', () => {
    test(`can select nodes`, async ({ page }) => {
      const { rawGraphList, selectedNode } = await openRawGraphListEncoding(page)

      await rawGraphList.getByText('_0V2YcPidEe6PhJwEQ2R2dA').click()

      const nodeDetails = page.getByTestId('node-details')
      await nodeDetails.waitFor()
      await nodeDetails.getByText('Model — model').waitFor()
      await expect(selectedNode).toHaveText('_0V2YcPidEe6PhJwEQ2R2dA,')
    })

    test(`can select edges`, async ({ page }) => {
      const { rawGraphList, selectedEdge } = await openRawGraphListEncoding(page)

      await rawGraphList.getByText('[0, 2]').click()

      const edgeDetails = page.getByTestId('edge-details-group')
      await edgeDetails.getByText('_0V2YcPidEe6PhJwEQ2R2dA').waitFor()
      await edgeDetails.getByText('_9-mJcPifEe6PhJwEQ2R2dA').waitFor()
      await edgeDetails.getByText('ownedElement', { exact: true }).waitFor()
      await expect(selectedEdge).toHaveText('[0, 2],')
    })

    test('shows external node selections', async ({ page }) => {
      const { rawGraphList, selectedNode } = await openRawGraphListEncoding(page)

      await rawGraphList.getByText('[0, 2]').click()

      await page.getByTestId('edge-details-group').getByText('_0V2YcPidEe6PhJwEQ2R2dA').click()
      await expect(selectedNode).toHaveText('_0V2YcPidEe6PhJwEQ2R2dA,')
    })

    test('shows external edge selections', async ({ page }) => {
      const { rawGraphList, selectedEdge } = await openRawGraphListEncoding(page)

      await rawGraphList.getByText('_0V2YcPidEe6PhJwEQ2R2dA').click()

      await page.getByTestId('node-details').getByText('ownedElement').nth(2).click()
      await expect(selectedEdge).toHaveCount(1)
      await expect(selectedEdge).toHaveText('[0, 2],')
    })
  })
})

async function openRawGraphMatrixEncoding(page: Page, browserName: string) {
  await openRawGraphEncoding(page)

  const encoderForm = page.getByTestId('encoder-form')
  await encoderForm.getByTestId('Graph-accordion-toggle').click()
  await encoderForm.getByText('list').click()
  await page.getByRole('option', { name: 'matrix' }).click()

  if (browserName === 'webkit') {
    // Webkit runs don't properly close the dropdown of the format selection, even though it works in the browser
    // It's most likely a playwright-specific driver issue, but this workaround forces the dropdown to close
    await selectLayout(page, 'Compact')
    await selectLayout(page, 'Extended')
  }

  const rawGraphGrid = page.getByTestId('raw-graph-grid')
  await rawGraphGrid.waitFor()

  // Again, Webkit requires special treatment, because the bounding boxes of the labels are offset to be behind the cells for some reason
  // However, the labels are still clickable as expected, but playwright cannot detect that
  const selectTarget = (nodeId: string) => rawGraphGrid
    .getByTestId(`grid-target-${nodeId}`)
    .click(browserName === 'webkit' ? { force: true, position: { x: 8, y: -5 } } : undefined)
  const selectSource = (nodeId: string) => rawGraphGrid
    .getByTestId(`grid-source-${nodeId}`)
    .click(browserName === 'webkit' ? { force: true, position: { x: -100, y: 8 } } : undefined)

  const selectedTarget = rawGraphGrid.locator('.column-selected')
  const selectedSource = rawGraphGrid.locator('.row-selected')

  const selectEdge = (sourceId: string, targetId: string) => rawGraphGrid.getByTestId(`grid-cell-${sourceId}-${targetId}`).click()
  const cell = (sourceId: string, targetId: string) => rawGraphGrid.getByTestId(`grid-cell-${sourceId}-${targetId}`)

  return {
    rawGraphGrid,
    selectTarget,
    selectSource,
    selectedTarget,
    selectedSource,
    selectEdge,
    cell,
  }
}

test.describe('matrix', () => {
  test.describe('selections', () => {
    test(`can select nodes by source`, async ({ browserName, page }) => {
      const nodeId = '_0V2YcPidEe6PhJwEQ2R2dA'
      const { selectSource, selectedTarget, selectedSource } = await openRawGraphMatrixEncoding(page, browserName)

      await selectSource(nodeId)

      const nodeDetails = page.getByTestId('node-details')
      await nodeDetails.waitFor({ timeout: 10000 })
      await nodeDetails.getByText('Model — model').waitFor()
      await expect(selectedTarget).toHaveText(nodeId)
      await expect(selectedSource).toHaveText(nodeId)
    })

    test(`can select nodes by target`, async ({ browserName, page }) => {
      const nodeId = '_0V2YcPidEe6PhJwEQ2R2dA'
      const { selectTarget, selectedTarget, selectedSource } = await openRawGraphMatrixEncoding(page, browserName)

      await selectTarget(nodeId)

      const nodeDetails = page.getByTestId('node-details')
      await nodeDetails.waitFor({ timeout: 10000 })
      await nodeDetails.getByText('Model — model').waitFor()
      await expect(selectedTarget).toHaveText(nodeId)
      await expect(selectedSource).toHaveText(nodeId)
    })

    test(`can select edges`, async ({ browserName, page }) => {
      const sourceId = '_0V2YcPidEe6PhJwEQ2R2dA'
      const targetId = '_7flJUPifEe6PhJwEQ2R2dA'
      const { cell, selectEdge, selectedTarget, selectedSource } = await openRawGraphMatrixEncoding(page, browserName)

      await selectEdge(sourceId, targetId)

      const edgeDetails = page.getByTestId('edge-details-group')
      await edgeDetails.getByText('_0V2YcPidEe6PhJwEQ2R2dA').waitFor()
      await edgeDetails.getByText('_7flJUPifEe6PhJwEQ2R2dA').waitFor()
      await edgeDetails.getByText('ownedElement', { exact: true }).waitFor()
      await expect(selectedTarget).toHaveText(targetId)
      await expect(selectedSource).toHaveText(sourceId)
      await expect(cell(sourceId, targetId)).toHaveClass(/cell-selected/)
    })

    test('shows external node selections', async ({ browserName, page }) => {
      const { selectEdge, selectedTarget, selectedSource } = await openRawGraphMatrixEncoding(page, browserName)

      await selectEdge('_0V2YcPidEe6PhJwEQ2R2dA', '_7flJUPifEe6PhJwEQ2R2dA')

      const nodeId = '_0V2YcPidEe6PhJwEQ2R2dA'
      await page.getByTestId('edge-details-group').getByText(nodeId).click()
      await expect(selectedTarget).toHaveText(nodeId)
      await expect(selectedSource).toHaveText(nodeId)
    })

    test('shows external edge selections', async ({ browserName, page }) => {
      const { cell, selectSource, selectedTarget, selectedSource } = await openRawGraphMatrixEncoding(page, browserName)

      await selectSource('_0V2YcPidEe6PhJwEQ2R2dA')

      const sourceId = '_0V2YcPidEe6PhJwEQ2R2dA'
      const targetId = '_9-mJcPifEe6PhJwEQ2R2dA'
      await page.getByTestId('node-details').getByText('ownedElement').nth(2).click()
      await expect(selectedTarget).toHaveText(targetId)
      await expect(selectedSource).toHaveText(sourceId)
      await expect(cell(sourceId, targetId)).toHaveClass(/cell-selected/)
    })

    test('can clear selection', async ({ browserName, page }) => {
      const { selectSource, selectedSource, rawGraphGrid } = await openRawGraphMatrixEncoding(page, browserName)

      const nodeId = '_0V2YcPidEe6PhJwEQ2R2dA'
      await selectSource(nodeId)
      await expect(selectedSource).toHaveText(nodeId)

      await rawGraphGrid.click()
      await expect(selectedSource).toHaveCount(0)
    })
  })
})
