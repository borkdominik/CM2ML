import { GraphEncoder } from '@cm2ml/graph-encoder'
import { UmlParser } from '@cm2ml/uml-parser'
import { useMemo } from 'react'

import { Container } from './components/Container'
import { Encoding } from './components/encodings/Encoding'
import { IRGraph } from './components/IRGraph'
import { modelString } from './model'

export function App() {
  const model = useModelParser(modelString)
  return (
    <div className="grid h-full grid-cols-2 gap-1 bg-neutral-900 p-1">
      <Container>
        <IRGraph model={model} />
      </Container>
      <Container>
        <Encoding model={model} encoder={GraphEncoder} />
      </Container>
    </div>
  )
}

function useModelParser(serializedModel: string) {
  const model = useMemo(() => {
    return UmlParser.invoke(serializedModel, {
      debug: false,
      idAttribute: 'id',
      strict: true,
    })
  }, [serializedModel])
  return model
}
