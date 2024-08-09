import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { openEncoder, openExample, selectLayout } from './e2e-utils'

async function openTreeEncoding(page: Page) {
  await page.goto('/')

  await openExample(page, 'UML', 'deployment.uml')
  const modelForm = page.getByTestId('model-form')
  await modelForm.getByTestId('Associations-accordion-toggle').click()
  await modelForm.getByLabel('Only Containment Associations').click()
  await modelForm.getByLabel('Relationships as Edges').click()

  await openEncoder(page, 'Tree-based')

  const encoderForm = page.getByTestId('encoder-form')
  await encoderForm.getByTestId('Features-accordion-toggle').click()
  await encoderForm.getByLabel('Raw Features').click()

  // Make room for more of the tree to be visible
  await selectLayout(page, 'Compact')

  const treeGraph = page.getByTestId('tree-graph')
  const fitView = async () => treeGraph.getByTitle('fit view').click()
  const selectedNode = treeGraph.locator('.tree-node__selected')

  const selectNode = (id: string) => treeGraph.getByTestId(`tree-node-${id}`).click()
  const selectEdge = (sourceId: string, targetId: string) => treeGraph.getByTestId(`tree-node-${sourceId},${targetId}`).click()

  return { fitView, selectedNode, selectEdge, selectNode, treeGraph }
}

test('shows tree metadata', async ({ page }) => {
  const { treeGraph } = await openTreeEncoding(page)
  await treeGraph.getByText('174 nodes').waitFor()
  await treeGraph.getByText('45 words').waitFor()
})

test.describe(`selections`, () => {
  test('can select nodes', async ({ page }) => {
    const { fitView, selectedNode, selectNode } = await openTreeEncoding(page)

    await fitView()
    await expect(selectedNode).toHaveCount(0)
    await selectNode('_0V2YcPidEe6PhJwEQ2R2dA')
    await expect(selectedNode).toHaveText('_0V2YcPidEe6PhJwEQ2R2dA')

    const nodeDetails = page.getByTestId('node-details')
    await nodeDetails.waitFor()
    await nodeDetails.getByText('Model — model').waitFor()
  })

  test('can select edges', async ({ page }) => {
    const { fitView, selectedNode, selectEdge } = await openTreeEncoding(page)

    await fitView()
    await expect(selectedNode).toHaveCount(0)
    await selectEdge('_9-mJcPifEe6PhJwEQ2R2dA', '_0V2YcPidEe6PhJwEQ2R2dA')
    await expect(selectedNode).toHaveText('_0V2YcPidEe6PhJwEQ2R2dA')

    const edgeDetails = page.getByTestId('edge-details-group')
    await edgeDetails.getByText('_9-mJcPifEe6PhJwEQ2R2dA').waitFor()
    await edgeDetails.getByText('_0V2YcPidEe6PhJwEQ2R2dA').waitFor()
    await edgeDetails.getByText('owner').waitFor()
  })

  test('shows external node selections', async ({ page }) => {
    const { fitView, selectedNode, selectEdge } = await openTreeEncoding(page)

    await selectEdge('_9-mJcPifEe6PhJwEQ2R2dA', '_0V2YcPidEe6PhJwEQ2R2dA')
    await fitView()

    await page.getByTestId('edge-details-group').getByText('_0V2YcPidEe6PhJwEQ2R2dA').click()
    await expect(selectedNode).toHaveText('_0V2YcPidEe6PhJwEQ2R2dA')
  })

  test('shows external edge selections', async ({ page }) => {
    const { fitView, selectedNode, selectNode } = await openTreeEncoding(page)

    await selectNode('_0V2YcPidEe6PhJwEQ2R2dA')
    await fitView()

    await page.getByTestId('node-details').getByText('ownedElement').nth(2).click()
    await expect(selectedNode).toHaveText('_9-mJcPifEe6PhJwEQ2R2dA')
  })

  test('can clear a selection', async ({ page }) => {
    const { fitView, selectNode, selectedNode, treeGraph } = await openTreeEncoding(page)

    await selectNode('_0V2YcPidEe6PhJwEQ2R2dA')
    await expect(selectedNode).toHaveCount(1)

    await fitView()
    await treeGraph.click() // This click on the background clears the selection
    await expect(page.getByTestId('edge-details-group')).toHaveCount(0)
    await expect(selectedNode).toHaveCount(0)
  })
})
