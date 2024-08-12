import { parseNamespace } from '@cm2ml/utils'

import type { Attribute } from './attributes'
import type { ModelMember } from './model-member'

export interface MetamodelConfiguration<AttributeName extends string, Type extends string, Tag extends string> {
  attributes: AttributeName[] | readonly AttributeName[]
  idAttribute: AttributeName
  types: Type[] | readonly Type[]
  typeAttributes: [AttributeName, ...AttributeName[]]
  nameAttribute?: AttributeName
  tags: Tag[] | readonly Tag[]
}

export type IdRecord<T extends string> = {
  [K in T]: K
}

export class Metamodel<const AttributeName extends string, const Type extends string, const Tag extends string> {
  public readonly Attributes: IdRecord<AttributeName>
  public readonly idAttribute: AttributeName
  public readonly typeAttributes: [AttributeName, ...AttributeName[]]
  public readonly nameAttribute: AttributeName | undefined
  public readonly Types: IdRecord<Type>
  public readonly Tags: IdRecord<Tag>

  public constructor({ attributes, idAttribute, types, typeAttributes, nameAttribute, tags }: MetamodelConfiguration<AttributeName, Type, Tag>) {
    this.Attributes = Object.fromEntries(attributes.map((attribute) => [attribute, attribute])) as IdRecord<AttributeName>
    if (this.Attributes[idAttribute] === undefined) {
      throw new Error(`Id attribute ${idAttribute} must be in attributes`)
    }
    this.idAttribute = idAttribute
    this.Types = Object.fromEntries(types.map((type) => [type, type])) as IdRecord<Type>
    for (const typeAttribute of typeAttributes) {
      if (this.Attributes[typeAttribute] === undefined) {
        throw new Error(`Type attribute ${typeAttribute} must be in attributes`)
      }
    }
    this.typeAttributes = typeAttributes
    if (nameAttribute !== undefined && this.Attributes[nameAttribute] === undefined) {
      throw new Error(`Name attribute ${nameAttribute} must be in attributes`)
    }
    this.nameAttribute = nameAttribute
    this.Tags = Object.fromEntries(tags.map((tag) => [tag, tag])) as IdRecord<Tag>
  }

  public getIdAttribute(member: ModelMember): Attribute | undefined {
    return member.getAttribute(this.idAttribute)
  }

  public isValidType(type: string | undefined): type is Type {
    return type !== undefined && type in this.Types
  }

  public isValidTag(tag: string | undefined): tag is Tag {
    return tag !== undefined && tag in this.Tags
  }

  public getType(member: ModelMember): Type | undefined {
    return this.getTypeAttribute(member)?.value.literal as Type | undefined
  }

  public getTypeAttribute(member: ModelMember): Attribute | undefined {
    for (const attribute of this.typeAttributes) {
      const type = member.getAttribute(attribute)
      if (this.isValidType(type?.value.literal)) {
        return type
      }
    }
    return undefined
  }

  public setType(member: ModelMember, type: string) {
    const typeAttribute = this.typeAttributes[0]
    member.addAttribute({ name: typeAttribute, type: 'category', value: { literal: type } }, false)
  }

  public getTagType(member: ModelMember): Type | undefined {
    const parsedName = parseNamespace(member.tag)
    const actualName =
      typeof parsedName === 'object' ? parsedName.name : parsedName
    if (this.isValidType(actualName)) {
      return actualName
    }
    return undefined
  }

  public getNameAttribute(member: ModelMember): Attribute | undefined {
    if (this.nameAttribute === undefined) {
      return undefined
    }
    return member.getAttribute(this.nameAttribute)
  }
}
