import { GraphEncoder } from '@cm2ml/graph-encoder'
import { UmlParser } from '@cm2ml/uml-parser'
import { useMemo } from 'react'

import { Encoding } from './components/encodings/Encoding'
import { IRGraph } from './components/IRGraph'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './components/ui/resizable'
import { modelString } from './model'

export function App() {
  const model = useModelParser(modelString)
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={50}>
        <IRGraph model={model} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <Encoding model={model} encoder={GraphEncoder} />
      </ResizablePanel>
    </ResizablePanelGroup>
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
