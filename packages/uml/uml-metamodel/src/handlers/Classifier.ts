import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { Classifier } from '../uml-metamodel'

export const ClassifierHandler = Classifier.createHandler(
  (classifier, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_attribute(classifier)
    addEdge_collaborationUse(classifier)
    addEdge_feature(classifier)
    addEdge_general(classifier)
    addEdge_generalization(classifier)
    addEdge_inheritedMember(classifier)
    addEdge_ownedTemplateSignature(classifier)
    addEdge_ownedUseCase(classifier)
    addEdge_powertypeExtent(classifier)
    addEdge_redefinedClassifier(classifier)
    addEdge_representation(classifier)
    addEdge_substitution(classifier)
    addEdge_templateParameter(classifier)
    addEdge_useCase(classifier)
  },
  {
    [Uml.Attributes.isAbstract]: 'false',
    [Uml.Attributes.isFinalSpecialization]: 'false',
  },
)

function addEdge_attribute(_classifier: GraphNode) {
  // TODO
  // /attribute : Property [0..*]{ordered, unique, composite} (opposite A_attribute_classifier::classifier )
  // The Properties owned by the Classifier.
}

function addEdge_collaborationUse(_classifier: GraphNode) {
  // TODO
  // ♦ collaborationUse : CollaborationUse [0..*]{subsets Element::ownedElement} (opposite A_collaborationUse_classifier::classifier)
  // The CollaborationUses owned by the Classifier.
}

function addEdge_feature(_classifier: GraphNode) {
  // TODO
  // /feature : Feature [0..*]{union, subsets Namespace::member} (opposite Feature::featuringClassifier)
  // Specifies each Feature directly defined in the classifier.Note that there may be members of the Classifier that are of the type Feature but are not included, e.g., inherited features.
}

function addEdge_general(_classifier: GraphNode) {
  // TODO
  // /general : Classifier [0..*] (opposite A_general_classifier::classifier)
  // The generalizing Classifiers for this Classifier.
}

function addEdge_generalization(_classifier: GraphNode) {
  // TODO
  // ♦ generalization : Generalization [0..*]{subsets Element::ownedElement, subsets A_source_directedRelationship::directedRelationship} (opposite Generalization::specific)
  // The Generalization relationships for this Classifier. These Generalizations navigate to more general Classifiers in the generalization hierarchy.
}

function addEdge_inheritedMember(_classifier: GraphNode) {
  // TODO
  // /inheritedMember : NamedElement [0..*]{subsets Namespace::member} (opposite A_inheritedMember_inheritingClassifier::inheritingClassifier)
  // All elements inherited by this Classifier from its general Classifiers.
}

function addEdge_ownedTemplateSignature(_classifier: GraphNode) {
  // TODO
  // ♦ ownedTemplateSignature : RedefinableTemplateSignature [0..1]{subsets A_redefinitionContext_redefinableElement::redefinableElement, redefines TemplateableElement::ownedTemplateSignature} (opposite RedefinableTemplateSignature::classifier)
  // The optional RedefinableTemplateSignature specifying the formal template parameters.
}

function addEdge_ownedUseCase(_classifier: GraphNode) {
  // TODO
  // ♦ ownedUseCase : UseCase [0..*]{subsets Namespace::ownedMember} (opposite A_ownedUseCase_classifier::classifier)
  // The UseCases owned by this classifier.
}

function addEdge_powertypeExtent(_classifier: GraphNode) {
  // TODO
  // powertypeExtent : GeneralizationSet [0..*] (opposite GeneralizationSet::powertype)
  // The GeneralizationSet of which this Classifier is a power type.
}

function addEdge_redefinedClassifier(_classifier: GraphNode) {
  // TODO
  // redefinedClassifier : Classifier [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedClassifier_classifier::classifier )
  // The Classifiers redefined by this Classifier.
}

function addEdge_representation(_classifier: GraphNode) {
  // TODO
  // representation : CollaborationUse [0..1]{subsets Classifier::collaborationUse} (opposite A_representation_classifier::classifier)
  // A CollaborationUse which indicates the Collaboration that represents this Classifier.
}

function addEdge_substitution(_classifier: GraphNode) {
  // TODO
  // ♦ substitution : Substitution [0..*]{subsets Element::ownedElement, subsets NamedElement::clientDependency} (opposite Substitution::substitutingClassifier)
  // The Substitutions owned by this Classifier.
}

function addEdge_templateParameter(_classifier: GraphNode) {
  // TODO
  // templateParameter : ClassifierTemplateParameter [0..1]{redefines ParameterableElement::templateParameter} (opposite ClassifierTemplateParameter::parameteredElement)
  // TheClassifierTemplateParameter that exposes this element as a formal parameter.
}

function addEdge_useCase(_classifier: GraphNode) {
  // TODO
  // useCase : UseCase [0..*] (opposite UseCase::subject)
  // The set of UseCases for which this Classifier is the subject.
}
