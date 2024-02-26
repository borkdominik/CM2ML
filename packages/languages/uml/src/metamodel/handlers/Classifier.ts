import type { GraphNode } from '@cm2ml/ir'

import { resolve, resolveFromAttribute, resolveFromChild } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Classifier, ClassifierTemplateParameter, CollaborationUse, GeneralizationSet, Substitution, UseCase } from '../uml-metamodel'

export const ClassifierHandler = Classifier.createHandler(
  (classifier, { onlyContainmentAssociations }) => {
    const collaborationUses = resolveFromChild(classifier, 'collaborationUse', { many: true, type: CollaborationUse })
    const ownedUseCases = resolveFromChild(classifier, 'ownedUseCase', { many: true, type: UseCase })
    const powertypeExtents = resolve(classifier, 'powertypeExtent', { many: true, type: GeneralizationSet })
    const redefinedClassifiers = resolveFromAttribute(classifier, 'redefinedClassifier', { many: true, type: Classifier })
    const representation = resolveFromAttribute(classifier, 'representation', { type: CollaborationUse })
    const substitutions = resolve(classifier, 'substitution', { many: true, type: Substitution })
    const templateParameter = resolveFromAttribute(classifier, 'templateParameter', { type: ClassifierTemplateParameter })
    const useCases = resolve(classifier, 'useCase', { many: true, type: UseCase })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_attribute(classifier)
    addEdge_collaborationUse(classifier, collaborationUses)
    addEdge_feature(classifier)
    addEdge_general(classifier)
    addEdge_generalization(classifier)
    addEdge_inheritedMember(classifier)
    addEdge_ownedTemplateSignature(classifier)
    addEdge_ownedUseCase(classifier, ownedUseCases)
    addEdge_powertypeExtent(classifier, powertypeExtents)
    addEdge_redefinedClassifier(classifier, redefinedClassifiers)
    addEdge_representation(classifier, representation)
    addEdge_substitution(classifier, substitutions)
    addEdge_templateParameter(classifier, templateParameter)
    addEdge_useCase(classifier, useCases)
  },
  {
    [Uml.Attributes.isAbstract]: 'false',
    [Uml.Attributes.isFinalSpecialization]: 'false',
  },
)

function addEdge_attribute(_classifier: GraphNode) {
  // TODO/Association
  // /attribute : Property [0..*]{ordered, unique, composite} (opposite A_attribute_classifier::classifier )
  // The Properties owned by the Classifier.
}

function addEdge_collaborationUse(classifier: GraphNode, collaborationUses: GraphNode[]) {
  // ♦ collaborationUse : CollaborationUse [0..*]{subsets Element::ownedElement} (opposite A_collaborationUse_classifier::classifier)
  // The CollaborationUses owned by the Classifier.
  collaborationUses.forEach((collaborationUse) => {
    classifier.model.addEdge('collaborationUse', classifier, collaborationUse)
  })
}

function addEdge_feature(_classifier: GraphNode) {
  // TODO/Association
  // /feature : Feature [0..*]{union, subsets Namespace::member} (opposite Feature::featuringClassifier)
  // Specifies each Feature directly defined in the classifier.Note that there may be members of the Classifier that are of the type Feature but are not included, e.g., inherited features.
}

function addEdge_general(_classifier: GraphNode) {
  // TODO/Association
  // /general : Classifier [0..*] (opposite A_general_classifier::classifier)
  // The generalizing Classifiers for this Classifier.
}

function addEdge_generalization(_classifier: GraphNode) {
  // TODO/Association
  // ♦ generalization : Generalization [0..*]{subsets Element::ownedElement, subsets A_source_directedRelationship::directedRelationship} (opposite Generalization::specific)
  // The Generalization relationships for this Classifier. These Generalizations navigate to more general Classifiers in the generalization hierarchy.
}

function addEdge_inheritedMember(_classifier: GraphNode) {
  // TODO/Association
  // /inheritedMember : NamedElement [0..*]{subsets Namespace::member} (opposite A_inheritedMember_inheritingClassifier::inheritingClassifier)
  // All elements inherited by this Classifier from its general Classifiers.
}

function addEdge_ownedTemplateSignature(_classifier: GraphNode) {
  // TODO/Association
  // ♦ ownedTemplateSignature : RedefinableTemplateSignature [0..1]{subsets A_redefinitionContext_redefinableElement::redefinableElement, redefines TemplateableElement::ownedTemplateSignature} (opposite RedefinableTemplateSignature::classifier)
  // The optional RedefinableTemplateSignature specifying the formal template parameters.
}

function addEdge_ownedUseCase(classifier: GraphNode, ownedUseCases: GraphNode[]) {
  // ♦ ownedUseCase : UseCase [0..*]{subsets Namespace::ownedMember} (opposite A_ownedUseCase_classifier::classifier)
  // The UseCases owned by this classifier.
  ownedUseCases.forEach((ownedUseCase) => {
    classifier.model.addEdge('ownedUseCase', classifier, ownedUseCase)
  })
}

function addEdge_powertypeExtent(classifier: GraphNode, powertypeExtents: GraphNode[]) {
  // powertypeExtent : GeneralizationSet [0..*] (opposite GeneralizationSet::powertype)
  // The GeneralizationSet of which this Classifier is a power type.
  powertypeExtents.forEach((powertypeExtent) => {
    classifier.model.addEdge('powertypeExtent', classifier, powertypeExtent)
  })
}

function addEdge_redefinedClassifier(classifier: GraphNode, redefinedClassifiers: GraphNode[]) {
  // redefinedClassifier : Classifier [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedClassifier_classifier::classifier )
  // The Classifiers redefined by this Classifier.
  redefinedClassifiers.forEach((redefinedClassifier) => {
    classifier.model.addEdge('redefinedClassifier', classifier, redefinedClassifier)
  })
}

function addEdge_representation(classifier: GraphNode, representation: GraphNode | undefined) {
  // representation : CollaborationUse [0..1]{subsets Classifier::collaborationUse} (opposite A_representation_classifier::classifier)
  // A CollaborationUse which indicates the Collaboration that represents this Classifier.
  if (!representation) {
    return
  }
  classifier.model.addEdge('representation', classifier, representation)
}

function addEdge_substitution(classifier: GraphNode, substitutions: GraphNode[]) {
  // ♦ substitution : Substitution [0..*]{subsets Element::ownedElement, subsets NamedElement::clientDependency} (opposite Substitution::substitutingClassifier)
  // The Substitutions owned by this Classifier.
  substitutions.forEach((substitution) => {
    classifier.model.addEdge('substitution', classifier, substitution)
  })
}

function addEdge_templateParameter(classifier: GraphNode, templateParameter: GraphNode | undefined) {
  // templateParameter : ClassifierTemplateParameter [0..1]{redefines ParameterableElement::templateParameter} (opposite ClassifierTemplateParameter::parameteredElement)
  // TheClassifierTemplateParameter that exposes this element as a formal parameter.
  if (!templateParameter) {
    return
  }
  classifier.model.addEdge('templateParameter', classifier, templateParameter)
}

function addEdge_useCase(classifier: GraphNode, useCases: GraphNode[]) {
  // useCase : UseCase [0..*] (opposite UseCase::subject)
  // The set of UseCases for which this Classifier is the subject.
  useCases.forEach((useCase) => {
    classifier.model.addEdge('useCase', classifier, useCase)
  })
}
