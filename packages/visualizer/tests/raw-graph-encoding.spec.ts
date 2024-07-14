import { test } from '@playwright/test'

import { openExample, useEncoder, useLayout } from './e2e-utils'

test(`raw graph encoding`, async ({ page }) => {
  await page.goto('/')
  await useLayout(page, 'Extended')

  await openExample(page, 'UML', 'deployment.uml')
  await useEncoder(page, 'Raw graph')

  // Nodes

  const rawGraphList = page.getByTestId('raw-graph-list')

  const nodeLabel = rawGraphList.getByText('_0V2YcPidEe6PhJwEQ2R2dA')
  await nodeLabel.click()

  // Edges
  const edgeLabel = rawGraphList.getByText('[ 0, 2]')
  await edgeLabel.click()
})
