import type { GraphModel, GraphNode, Metamodel } from '@cm2ml/ir'
import type {
  Callback,
  HandlerPropagation,
  MetamodelElement,
} from '@cm2ml/metamodel'
import { inferAndSaveType } from '@cm2ml/metamodel'
import { getMessage } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'

export function createRefiner<
  AttributeName extends string,
  Type extends string,
  AbstractType extends string,
  Tag extends string,
  HandlerParameters extends HandlerPropagation,
>(
  metamodel: Metamodel<AttributeName, Type, Tag>,
  inferHandler: (
    node: GraphNode,
  ) => MetamodelElement<AttributeName, Type, AbstractType, Tag, HandlerParameters> | undefined,
) {
  function refine(
    model: GraphModel,
    handlerParameters: HandlerParameters,
  ): GraphModel {
    removeNonModelNodes(model)
    const callbacks = refineNodesRecursively(model.root, handlerParameters).toArray()
    callbacks.forEach((callback) => callback())
    replaceTagsWithTypes(model)
    return model
  }

  function findModelRoot(node: GraphNode): GraphNode | undefined {
    if (node.type !== undefined) {
      return node
    }
    const tagType = metamodel.getTagType(node)
    if (tagType !== undefined) {
      inferAndSaveType(node, tagType, metamodel)
      return node
    }
    return Stream.from(node.children)
      .map(findModelRoot)
      .find((child) => child !== undefined)
  }

  /** This function strips the model (root) of non-model elements */
  function removeNonModelNodes(model: GraphModel) {
    const newRoot = findModelRoot(model.root)

    if (!newRoot) {
      return
    }
    model.debug('Parser', `Re-rooted model with new root ${newRoot.type} (${
      newRoot.id
    })`)
    model.root = newRoot
  }

  function refineNodesRecursively(
    node: GraphNode,
    handlerParameters: HandlerParameters,
  ): Stream<Callback> {
    const handler = inferHandler(node)
    if (!handler) {
      const message = `No handler for node with tag ${
        node.tag
      } and type ${node.type} of parent ${node.parent?.show()}`
      if (node.model.settings.strict) {
        throw new Error(message)
      } else {
        node.model.debug('Parser', message)
      }
      return Stream.empty()
    }
    try {
      const callbacks = handler.handle(node, handlerParameters)
      return Stream.from(node.children).flatMap((child) => refineNodesRecursively(child, handlerParameters)).concat(callbacks)
    } catch (error) {
      node.model.debug('Parser', getMessage(error))
      if (node.model.settings.strict) {
        throw error
      }
      return Stream.empty()
    }
  }

  function replaceTagsWithTypes(model: GraphModel) {
    Stream.from(model.nodes).forEach((node) => {
      const type = node.type
      if (metamodel.isValidType(type)) {
        node.tag = type
        return
      }
      if (!model.settings.strict) {
        return
      }
      throw new Error(`Unknown type ${type} on node ${node.id}`)
    })
  }

  return refine
}
