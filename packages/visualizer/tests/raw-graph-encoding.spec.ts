import { test } from '@playwright/test'

import { openEncoder, openExample, selectLayout } from './e2e-utils'

test(`raw graph encoding`, async ({ page }) => {
  await page.goto('/')
  await selectLayout(page, 'Extended')

  await openExample(page, 'UML', 'deployment.uml')
  await openEncoder(page, 'Raw graph')

  const rawGraphList = page.getByTestId('raw-graph-list')

  // Node selection
  const nodeLabel = rawGraphList.getByText('_0V2YcPidEe6PhJwEQ2R2dA')
  await nodeLabel.click()

  // Edge selection
  const edgeLabel = rawGraphList.getByText('[ 0, 2]')
  await edgeLabel.click()
})
