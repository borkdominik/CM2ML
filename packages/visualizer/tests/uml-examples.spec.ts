import { test } from '@playwright/test'

import { getIRGraph, openExample, useLayout } from './e2e-utils'

interface Example {
  name: string
  nodes: number
  edges: number
  attributes: number
}

const umlExamples: Example[] = [
  {
    name: 'clazz.uml',
    nodes: 79,
    edges: 686,
    attributes: 585,
  },
  {
    name: 'deployment.uml',
    nodes: 12,
    edges: 121,
    attributes: 83,
  },
  {
    name: 'ownedPort.uml',
    nodes: 25,
    edges: 202,
    attributes: 179,
  },
  {
    name: 'uml-model.uml',
    nodes: 20,
    edges: 168,
    attributes: 107,
  },
]

umlExamples.forEach(({ name, nodes, edges, attributes }) => {
  test(`UML example ${name}`, async ({ page }) => {
    await page.goto('/')
    await useLayout(page, 'Extended')

    await openExample(page, 'UML', name)

    const graph = await getIRGraph(page)
    await graph.waitFor({ state: 'visible' })

    const modelStats = page.getByTestId('model-stats')
    await modelStats.getByText('UML model').waitFor({ state: 'visible' })
    await modelStats.getByText(`${nodes} nodes`).waitFor({ state: 'visible' })
    await modelStats.getByText(`${edges} edges`).waitFor({ state: 'visible' })
    await modelStats.getByText(`${attributes} attributes`).waitFor({ state: 'visible' })
  })
})
