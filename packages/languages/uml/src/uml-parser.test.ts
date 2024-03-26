import { readFileSync, readdirSync } from 'node:fs'

import { getMessage } from '@cm2ml/utils'
import { describe, expect, it } from 'vitest'

import { UmlParser } from './index'

// Green: 0-46662 -> 100%

const umlModelDir = '../../../models/uml'

const { validModels, invalidModels } = getFiles({
  startIndex: 0,
  numberOfFiles: 500,
  invalidModels: [
    '0390aa780981baeb9c88926789a9a864e3dbae961118a2f17f3a87a0cc3bb493.uml', // duplicate id
    '080364b14ef24331b00049e387697986ed7f05c16d93a6b32f36c356c3cb6ef5.uml', // duplicate generalization
    '086943006eec3dd2a28d9d053703ea1faf80f8aacdef0b993bb213ea3c38d304.uml', // uses abstract class Pin as instance type
    '0b01763511a89d396ba9f6aa5b14ac94f23875280cead245404f1744c25d579a.uml', // duplicate generalization
    '0d30f96045cc652e095149b01540e8fb66d3c809a9dc4e60ad4fdad2ce45b7d3.uml', // duplicate generalization
    '0d5912ac87d1559fed1297cffbb53ebb6393878e4829bb85e64b50ff894e020a.uml', // duplicate id
    '1128005f61433c19ddb913f1716cb2165edfc973d455a3152fa2190b12b5f9f9.uml', // duplicate id
    '1231f8d154fad979a3d87596e4dba7408ce1135082b49242f5ffaa4a93439870.uml', // duplicate generalization
    '1831658a2d93946723191887f0b2f33eb2cc05700b7cc45c9605a188a5b7478c.uml', // duplicate id
    '1a29a93587fccaa56c6e2747928bd4f9a83ea4fe94e51f9ed746e79718772d10.uml', // duplicate id
    '1b6d8c54c2e2c485d2c4ec74a1508cac190cb6fb09a54accf6803dbc8a6d475f.uml', // duplicate generalization
    '1fade04ffc56a362995833908c552f7eadc314d25582607ca4c3338fb0f80b1a.uml', // uses abstract class Pin as instance type
    '1fbcfb1cee242133b138d0017013cd495477440b05e8f8a7a56fe56737698ed7.uml', // duplicate id
    '217ce1849957ba325ddac1da6b96c86fae68f1166d0f3bfd8c4b5d1b5e9bdc8b.uml', // duplicate generalization
    '2a0f1e4a7394af04aacd525f376875bc28575470d55fd347e66324fa0155e49f.uml', // duplicate id
    '2b61758478e971d0b65edb96511f5f4b286fb8cf0b8690139044864f9123c9ba.uml', // not actually UML
    '2da29b0b92bf5445d09d803040b60e1650074621cfb43eb158a43fd8187e2955.uml', // duplicate generalization
    '2e5851e4f6b34f49cb272534e70489f0cfd9b3756b127a92cd2bb41cde98b464.uml', // uses abstract class Pin as instance type
    '32fd7205f5ca476fe21aed299a9d511dc6da6363ce86235de0ce90163f222e87.uml', // duplicate id
    '3807e34fc85f8809dc5c50a60191724554649c8de42af4dfcccf39329a84d890.uml', // duplicate id
    '3b7c2b547b19aa3bf242b10bbfa3f809c8684a51d806be496a4e0e4a28f00410.uml', // duplicate id
    '3d09b512c4b31971960d5805a6bd6d59307bbae75d4706fc5242c5dc437bde17.uml', // duplicate id
    '4418bc1c53bd2581f5b1a28b361295edc9339859580efba835fd57728d34c802.uml', // duplicate generalization
    '470ecc0168d34cede4c836f64afd5a5718a604973e87e35ce3898dd06c5780f6.uml', // invalid UML
    '480b03d525aa50a0d02596ebfa4e7175ee396e59634002d51e320f3b52c9c427.uml', // duplicate id
    '4aecc78e166edd7726482363a6350c1bfbd8d3f3c7ee12b1a54939a6b3daafcf.uml', // duplicate generalization
    '50a618fdd612b5985f634dc800ea7dad21ee7ff28cbf83b2cd7dce4b31195b80.uml', // duplicate generalization
    '5bb7e8963745e101ebf1af633e966c58e43508168c4ea54779c60f047f1bcbd1.uml', // duplicate generalization
    '5d0796573a2811bbbd67ab9ee58cef85529fb277dfd96e6f8957fa22ed503fe1.uml', // duplicate id
    '5e19e6b9d29840bc07c1a67ad0237b85e0d40524b53eca316796f0af9213ca5c.uml', // duplicate id
    '5ea112d943e8825da525c48e2a673ab0fac03004c644d66322e30ce195a55d7e.uml', // uses abstract class Pin as instance type
    '61ae90150db5d0d8a96d5d8da14b59adba5c98d409bd8dbf35121faa65887ce1.uml', // duplicate generalization
    '625a14f0e74e8813f7d3c5ea8b6a64bd50878f198c4a06c008c5c00020d9a589.uml', // duplicate generalization
    '63e616a28519d28bc54a752ab5e302ebffde453ddd89a97674de824d2bdceb39.uml', // duplicate generalization
    '64a09e0475267e1d0a88c409d9c4a55c35113471292d53d43ee45b0a24f6f4cf.uml', // uses abstract class Pin as instance type
    '6830b29249843c656edf64e6dfe6b91d0ddc4e669730b99238880e9e323b1253.uml', // uses abstract class Pin as instance type
    '69feb7e87370b76e608986ae612d3aeee5af1c12d107beb02c651f516f966ea6.uml', // duplicate generalization
    '72d84465a3a1f9c93b7739446afcfeda875f5165a0b36e158b07848342d57f9b.uml', // duplicate generalization
    '79014b6756bad500fbd4edd5e256665759437736e14c5432602f03d90d2033ae.uml', // duplicate id
    '7b925ad4bf5313963e94529765fa6168712835d7dff16e32244e3058af316edb.uml', // duplicate id
    '7fc541e9043b7e86dbb1fa20a670dbc3d727096b16de143f940e471f7f7592d0.uml', // uses abstract class Pin as instance type
    '81c3b0f1c4ca0ccac17588d4f57f45b4bcb2c5da11cdc01efb1a054bd6ad17ce.uml', // duplicate generalization
    '84cb37f59c916b05d4a36a8b28f9bc1ccd1a59230be0bd1f7caa0c327f58cd31.uml', // duplicate id
    '8beee7e0fd2e9f74d26dc7e8c3905f8e7e4e8a48064a52a26e70917f9184deef.uml', // duplicate id
    '91ac0c7e6fc04b3e265879951d5177774b67284781e1d0e0ee43b6dfc31e8938.uml', // duplicate generalization
    '9a16867844a856e572c16eb85203084c3f1f96df9d2189f6b8807e38140ed429.uml', // duplicate generalization
    '9dcd1712dcc15e60434ddfbe6ca53de74bebd1408e999adebb37cad9c2fecb44.uml', // duplicate generalization
    'a0781c0e549192e20ecdbd8e452b5314779e10cdd9eff0d47580d755cb13bcb5.uml', // invalid UML
    'a4f7a328882535dd39a40de29e2ab479243500b223d7fc31fd964fd5ed1f685e.uml', // duplicate id
    'a5aa9ab2d76ac96a9cb39ed64c9bc4c4186a2e714dc328560229bdcbaeee6af0.uml', // not UML
    'aabcfc2782ceda1f79973e7c2c6fd5bf0fe88897ef7a17128e92d5809d4be2dc.uml', // duplicate id
    'adb6a2d5439121fc72ac9c7a89e6ad5c003da479cba8ddf91ed686ca81024abb.uml', // duplicate generalization
    'af14cd918fc0e004ca0a5de7f61dc9fa3f80d63cf39d55f7a0e0718ca25154e8.uml', // not UML
    'b70a4cfd9e09e49b0da01e1e7229a27d276a094a9165b29100dd43c531e64592.uml', // duplicate edges
    'be08a4c4cb217459e987843fe849e83f11aca5dd770e620a89eee23d7c0c815d.uml', // uses abstract class Pin as instance type
    'cdeac60ad94c739df2051fe0649ce72d1c56cdf44c30b7de550ce24e0897b342.uml', // not UML
    'd221df3d85a5927cdfd7deeae92187f2a1b9129ce9587e3edb2d5bdfccd6cdff.uml', // invalid "metaclassReference" attribute on Package
    'd4a85c281e1e172578e055c6c7f3a0e365efa711765db8558c0eb90efc7110af.uml', // duplicate generalization
    'd516b67c9011a32599fda3665daed165a05ff1b646fcd9086d629e008caeeea8.uml', // duplicate id
    'd7e92eda9a8dc016511672503a0f19d13033bb1b3532b6d5b20ba0a74a32daa1.uml', // duplicate generalization
    'dd6319bb612d7f1f3e841734ce79638c50b3f5cd9da15476746dbebd886079f9.uml', // duplicate id
    'deba6074c1892c262330ce68a4e516c0e224724d169c24c9ff4926ab1960b083.uml', // invalid UML
    'e1f383323b0308d345c9277bd73a99ecb0e9d873882a388f2b6b6a3c20966679.uml', // duplicate id
    'e2282fa6e18b03f53a19e30ec9b3053ec1dd3e4982281c260995a83d7715f637.uml', // duplicate id
    'e93156c36900566c5a4eca2621fab9d0d920f9eb6fbed2bce00df00a57bc0f25.uml', // duplicate id
    'ead93c92b5a21957b514039593dd446b850cfb4298580811d1dc17028a7ab4b3.uml', // duplicate id
    'eae72f7ed192d8e515dc9ff0654e614bb86a8f8ed40cf9feba39c6d481afcdba.uml', // uses abstract class Pin as instance type
    'ed68e0a3f777e691c543fa5b7fb6c64d60d5965e69b11795877febf38903d8e6.uml', // not plain UML
    'f0cb46bb4e2127bd31c4e8d2a39f337d83e2a460a5f76412cd537b7aef8fe01a.uml', // duplicate id
    'ffec14974404d79da3b9fd4336a608795fe1b9017fe5fe8357c633a24a8512d5.uml', // duplicate id
  ],
  // override: 446,
})

const showDebugOutput = validModels.length === 1

describe('uml-parser', () => {
  describe.each(getConfigurations())('with configuration $name', (configuration) => {
    it.each(validModels)('should parse model $index', ({ file, snapshot }) => {
      const serializedModel = readFileSync(file, 'utf-8')
      try {
        const result = UmlParser.invoke(serializedModel, { ...configuration, debug: true, strict: true })
        expect(result).toBeDefined()
        if (snapshot) {
          expect(result.show()).toMatchFileSnapshot(`./__snapshots__/${file.replace(umlModelDir, '').replace('.uml', '')}/${configuration.name.replaceAll(' ', '-')}.txt`)
        }
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
  })

  describe.skipIf(showDebugOutput || invalidModels.length === 0)('invalid models', () => {
    it.each(invalidModels)('should not parse invalid model %s', (file) => {
      const serializedModel = readFileSync(file, 'utf-8')
      // At least one configuration must result in an error
      expect(() => getConfigurations().forEach((configuration) => {
        UmlParser.invoke(serializedModel, { ...configuration, debug: true, strict: true })
      })).toThrowErrorMatchingSnapshot()
    })
  })
})

function getFiles({ startIndex = 0, numberOfFiles, invalidModels = [], override }: { startIndex?: number, numberOfFiles?: number, override?: number, invalidModels?: string[] }) {
  const invalidModelSet = new Set(invalidModels)
  const datasetDir = `${umlModelDir}/dataset`
  const preparedFiles = readdirSync(umlModelDir).filter((file) => file.endsWith('.uml')).map((file) => `${umlModelDir}/${file}`).map((file) => ({ file, snapshot: true }))
  const datasetFiles = readdirSync(datasetDir).filter((file) => file.endsWith('.uml'))
  const validDatasetFiles = datasetFiles.filter((file) => !invalidModelSet.has(file)).map((file) => `${datasetDir}/${file}`).map((file) => ({ file, snapshot: false }))
  const invalidDatasetFiles = readdirSync(datasetDir).filter((file) => invalidModelSet.has(file)).map((file) => `${datasetDir}/${file}`)
  const allValidFiles = preparedFiles.concat(validDatasetFiles).map((file, index) => ({ ...file, index }))
  if (override !== undefined && override >= 0 && override < allValidFiles.length) {
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
