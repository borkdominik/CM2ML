# @cm2ml/uml

## Limitations

Since the complexity of the UML metamodel is high, only the following metamodel elements (and their generalizations) of the `Classes` diagram type will be implemented in their entirety:

- [x] BehavioredClassifier
- [x] Class
- [x] Classifier
- [x] EncapsulatedClassifier
- [x] Extension
- [x] Property
- [x] Operation
- [x] Reception

### Transitive

- [x] Association
- [x] BehavioralFeature
- [x] ConnectableElement
- [ ] DeploymentTarget
  - addEdge_deployedElement
- [x] Element
- [x] Feature
- [x] MultiplicityElement
- [x] NamedElement
- [x] Namespace
- [x] PackageableElement
- [x] ParameterableElement
- [ ] RedefinableElement
  - addEdge_redefinedElement
  - addEdge_redefinitionContext
- [x] Relationship
- [x] StructuralFeature
- [ ] StructuredClassifier
  - addEdge_role
- [x] TemplateableElement
- [x] Type
- [x] TypedElement

For a detailed description of the diagram type reference section 11.4 of the UML spec v2.5.1.
