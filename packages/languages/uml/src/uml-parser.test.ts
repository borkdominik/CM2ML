import { readFileSync, readdirSync } from 'node:fs'

import { getMessage } from '@cm2ml/utils'
import { describe, expect, it } from 'vitest'

import { UmlParser } from './index'

// Green: 0-46685 -> 100%

const { validModels, invalidModels } = getFiles({
  startIndex: 0,
  numberOfFiles: 50000,
  invalidModels: [
    '0390aa780981baeb9c88926789a9a864e3dbae961118a2f17f3a87a0cc3bb493.uml', // duplicate id
    '086943006eec3dd2a28d9d053703ea1faf80f8aacdef0b993bb213ea3c38d304.uml', // uses abstract class Pin as instance type TODO/Jan: Check if abstract instances are allowed
    '0d5912ac87d1559fed1297cffbb53ebb6393878e4829bb85e64b50ff894e020a.uml', // duplicate id
    '1128005f61433c19ddb913f1716cb2165edfc973d455a3152fa2190b12b5f9f9.uml', // duplicate id
    '1831658a2d93946723191887f0b2f33eb2cc05700b7cc45c9605a188a5b7478c.uml', // duplicate id
    '1a29a93587fccaa56c6e2747928bd4f9a83ea4fe94e51f9ed746e79718772d10.uml', // duplicate id
    '1fade04ffc56a362995833908c552f7eadc314d25582607ca4c3338fb0f80b1a.uml', // uses abstract class Pin as instance type TODO/Jan: Check if abstract instances are allowed
    '1fbcfb1cee242133b138d0017013cd495477440b05e8f8a7a56fe56737698ed7.uml', // duplicate id
    '2a0f1e4a7394af04aacd525f376875bc28575470d55fd347e66324fa0155e49f.uml', // duplicate id
    '2b61758478e971d0b65edb96511f5f4b286fb8cf0b8690139044864f9123c9ba.uml', // not actually UML
    '2e5851e4f6b34f49cb272534e70489f0cfd9b3756b127a92cd2bb41cde98b464.uml', // uses abstract class Pin as instance type TODO/Jan: Check if abstract instances are allowed
    '32fd7205f5ca476fe21aed299a9d511dc6da6363ce86235de0ce90163f222e87.uml', // duplicate id
    '3807e34fc85f8809dc5c50a60191724554649c8de42af4dfcccf39329a84d890.uml', // duplicate id
    '3b7c2b547b19aa3bf242b10bbfa3f809c8684a51d806be496a4e0e4a28f00410.uml', // duplicate id
    '3d09b512c4b31971960d5805a6bd6d59307bbae75d4706fc5242c5dc437bde17.uml', // duplicate id
    '470ecc0168d34cede4c836f64afd5a5718a604973e87e35ce3898dd06c5780f6.uml', // invalid UML
    '480b03d525aa50a0d02596ebfa4e7175ee396e59634002d51e320f3b52c9c427.uml', // duplicate id
    '5d0796573a2811bbbd67ab9ee58cef85529fb277dfd96e6f8957fa22ed503fe1.uml', // duplicate id
    '5e19e6b9d29840bc07c1a67ad0237b85e0d40524b53eca316796f0af9213ca5c.uml', // duplicate id
    '5ea112d943e8825da525c48e2a673ab0fac03004c644d66322e30ce195a55d7e.uml', // uses abstract class Pin as instance type TODO/Jan: Check if abstract instances are allowed
    '64a09e0475267e1d0a88c409d9c4a55c35113471292d53d43ee45b0a24f6f4cf.uml', // uses abstract class Pin as instance type TODO/Jan: Check if abstract instances are allowed
    '6830b29249843c656edf64e6dfe6b91d0ddc4e669730b99238880e9e323b1253.uml', // uses abstract class Pin as instance type TODO/Jan: Check if abstract instances are allowed
    '79014b6756bad500fbd4edd5e256665759437736e14c5432602f03d90d2033ae.uml', // duplicate id
    '7b925ad4bf5313963e94529765fa6168712835d7dff16e32244e3058af316edb.uml', // duplicate id
    '7fc541e9043b7e86dbb1fa20a670dbc3d727096b16de143f940e471f7f7592d0.uml', // uses abstract class Pin as instance type TODO/Jan: Check if abstract instances are allowed
    '84cb37f59c916b05d4a36a8b28f9bc1ccd1a59230be0bd1f7caa0c327f58cd31.uml', // duplicate id
    '84d05a51d42aaae8d4506a805ea75be01f304375914c747bfc529843a71715fb.uml', // duplicate id
    '8beee7e0fd2e9f74d26dc7e8c3905f8e7e4e8a48064a52a26e70917f9184deef.uml', // duplicate id
    'a0781c0e549192e20ecdbd8e452b5314779e10cdd9eff0d47580d755cb13bcb5.uml', // invalid UML
    'a4f7a328882535dd39a40de29e2ab479243500b223d7fc31fd964fd5ed1f685e.uml', // duplicate id
    'a5aa9ab2d76ac96a9cb39ed64c9bc4c4186a2e714dc328560229bdcbaeee6af0.uml', // not UML
    'aabcfc2782ceda1f79973e7c2c6fd5bf0fe88897ef7a17128e92d5809d4be2dc.uml', // duplicate id
    'af14cd918fc0e004ca0a5de7f61dc9fa3f80d63cf39d55f7a0e0718ca25154e8.uml', // not UML
    'be08a4c4cb217459e987843fe849e83f11aca5dd770e620a89eee23d7c0c815d.uml', // uses abstract class Pin as instance type TODO/Jan: Check if abstract instances are allowed
    'cdeac60ad94c739df2051fe0649ce72d1c56cdf44c30b7de550ce24e0897b342.uml', // not UML
    'd221df3d85a5927cdfd7deeae92187f2a1b9129ce9587e3edb2d5bdfccd6cdff.uml', // invalid "metaclassReference" attribute on Package
    'd516b67c9011a32599fda3665daed165a05ff1b646fcd9086d629e008caeeea8.uml', // duplicate id
    'dd6319bb612d7f1f3e841734ce79638c50b3f5cd9da15476746dbebd886079f9.uml', // duplicate id
    'deba6074c1892c262330ce68a4e516c0e224724d169c24c9ff4926ab1960b083.uml', // invalid UML
    'e1f383323b0308d345c9277bd73a99ecb0e9d873882a388f2b6b6a3c20966679.uml', // duplicate id
    'e2282fa6e18b03f53a19e30ec9b3053ec1dd3e4982281c260995a83d7715f637.uml', // duplicate id
    'e93156c36900566c5a4eca2621fab9d0d920f9eb6fbed2bce00df00a57bc0f25.uml', // duplicate id
    'ead93c92b5a21957b514039593dd446b850cfb4298580811d1dc17028a7ab4b3.uml', // duplicate id
    'eae72f7ed192d8e515dc9ff0654e614bb86a8f8ed40cf9feba39c6d481afcdba.uml', // uses abstract class Pin as instance type TODO/Jan: Check if abstract instances are allowed
    'ed68e0a3f777e691c543fa5b7fb6c64d60d5965e69b11795877febf38903d8e6.uml', // not plain UML
    'f0cb46bb4e2127bd31c4e8d2a39f337d83e2a460a5f76412cd537b7aef8fe01a.uml', // duplicate id
    'ffec14974404d79da3b9fd4336a608795fe1b9017fe5fe8357c633a24a8512d5.uml', // duplicate id
  ],
  // override: 1835,
})

const showDebugOutput = validModels.length === 1

describe('uml-parser', () => {
  describe.each(getConfigurations())('with configuration $name', (configuration) => {
    it.each(validModels)('should parse model $index', ({ file }) => {
      const serializedModel = readFileSync(file, 'utf-8')
      try {
        const result = UmlParser.invoke(serializedModel, { ...configuration, debug: true, removeInvalidNodes: false, strict: true })
        expect(result).toBeDefined()
        if (showDebugOutput) {
          // eslint-disable-next-line no-console
          console.info(result.show())
        }
      } catch (error) {
        if (showDebugOutput) {
          // eslint-disable-next-line no-console
          console.info(serializedModel)
        }
        if (showDebugOutput) {
          throw new Error(`Failed to parse model ${file}: ${getMessage(error)}`)
        } else {
          throw error
        }
      }
    })

    it.skipIf(showDebugOutput).each(invalidModels)('should not parse model %s', (file) => {
      const serializedModel = readFileSync(file, 'utf-8')
      try {
        UmlParser.invoke(serializedModel, { ...configuration, debug: true, removeInvalidNodes: false, strict: true })
        throw new Error(`Model ${file} was parsed successfully but should not have been.`)
      } catch (error) {
      }
    })
  })
})

function getFiles({ startIndex = 0, numberOfFiles, invalidModels = [], override }: { startIndex?: number, numberOfFiles?: number, override?: number, invalidModels?: string[] }) {
  const invalidModelSet = new Set(invalidModels)
  const umlModelDir = '../../../models/uml'
  const datasetDir = `${umlModelDir}/dataset`
  const preparedFiles = readdirSync(umlModelDir).filter((file) => file.endsWith('.uml')).map((file) => `${umlModelDir}/${file}`)
  const datasetFiles = readdirSync(datasetDir).filter((file) => file.endsWith('.uml'))
  const validDatasetFiles = datasetFiles.filter((file) => !invalidModelSet.has(file)).map((file) => `${datasetDir}/${file}`)
  const invalidDatasetFiles = readdirSync(datasetDir).filter((file) => invalidModelSet.has(file)).map((file) => `${datasetDir}/${file}`)
  const allValidFiles = preparedFiles.concat(validDatasetFiles).map((file, index) => ({ file, index }))
  if (override && override >= 0 && override < allValidFiles.length) {
    return { validModels: [allValidFiles[override]!], invalidModels: invalidDatasetFiles }
  }
  const actualStartIndex = process.env.COVERAGE ? 0 : startIndex
  return { validModels: allValidFiles.slice(actualStartIndex, numberOfFiles ? actualStartIndex + numberOfFiles : undefined), invalidModels: invalidDatasetFiles }
}

function getConfigurations(pick?: 0 | 1 | 2 | 3) {
  const configurationPresets = [
    {
      name: 'default',
      onlyContainmentAssociations: false,
      relationshipsAsEdges: false,
    },
    {
      name: 'only containment associations',
      onlyContainmentAssociations: true,
      relationshipsAsEdges: false,
    },
    {
      name: 'relationships as edges',
      onlyContainmentAssociations: false,
      relationshipsAsEdges: true,
    },
    {
      name: 'only containment associations and relationships as edges',
      onlyContainmentAssociations: true,
      relationshipsAsEdges: true,
    },
  ] as const satisfies {
    name: string
    onlyContainmentAssociations: boolean
    relationshipsAsEdges: boolean
  }[]
  if (pick !== undefined) {
    return [configurationPresets[pick]]
  }
  return configurationPresets
}
