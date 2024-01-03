import { UmlParser } from '@cm2ml/builtin'

const serializedModel = `<?xml version="1.0" encoding="UTF-8"?>
<uml:Model xmi:version="20131001" xmlns:xmi="http://www.omg.org/spec/XMI/20131001" xmlns:uml="http://www.eclipse.org/uml2/5.0.0/UML" xmi:id="_Cfp0UGmxEe2kLe5KTNzRtw" name="clazz">
  <packagedElement xmi:type="uml:Class" xmi:id="_QE0EkK7gEe2EZoZ5sgiBCg" name="asd">
    <ownedAttribute xmi:id="_bM_S4K7gEe2EZoZ5sgiBCg" name="NewProperty1" type="_9pVK8LK0Ee24ffphK9Na6g">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_bM_58K7gEe2EZoZ5sgiBCg" value="3"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_bNAhAK7gEe2EZoZ5sgiBCg" value="4"/>
    </ownedAttribute>
    <ownedAttribute xmi:id="_g69BoK7oEe2EZoZ5sgiBCg" name="NewProperty2">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_g69Boa7oEe2EZoZ5sgiBCg" value="1"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_g69Boq7oEe2EZoZ5sgiBCg" value="*"/>
    </ownedAttribute>
    <ownedAttribute xmi:id="_O3oC8bK1Ee24ffphK9Na6g" name="NewClass1" type="_MHjIALK1Ee24ffphK9Na6g" aggregation="shared" association="_O3oC8LK1Ee24ffphK9Na6g">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_O3oqALK1Ee24ffphK9Na6g" value="1"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_O3oqAbK1Ee24ffphK9Na6g" value="1"/>
    </ownedAttribute>
    <ownedAttribute xmi:id="_UahDwbK1Ee24ffphK9Na6g" name="NewClass3" type="_Mg74YLK1Ee24ffphK9Na6g" association="_UahDwLK1Ee24ffphK9Na6g">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_Uahq0LK1Ee24ffphK9Na6g" value="1"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_Uahq0bK1Ee24ffphK9Na6g" value="1"/>
    </ownedAttribute>
    <ownedAttribute xmi:id="_VYMM8bK1Ee24ffphK9Na6g" name="new Class 4" type="_M-U_ALK1Ee24ffphK9Na6g" aggregation="composite" association="_VYMM8LK1Ee24ffphK9Na6g">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_VYM0ALK1Ee24ffphK9Na6g" value="1"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_VYM0AbK1Ee24ffphK9Na6g" value="1"/>
    </ownedAttribute>
    <interfaceRealization xmi:id="_ay8lcLK1Ee24ffphK9Na6g" client="_QE0EkK7gEe2EZoZ5sgiBCg" supplier="_9pVK8LK0Ee24ffphK9Na6g" contract="_9pVK8LK0Ee24ffphK9Na6g"/>
    <ownedOperation xmi:id="_Cr6ZsK70Ee2EZoZ5sgiBCg" name="NewOperation3"/>
    <ownedOperation xmi:id="_r0YL0K70Ee2EZoZ5sgiBCg" name="NewOperation1">
      <ownedParameter xmi:id="_Pf5kMbFSEe2z_s-Al402-w" name="NewParameter1" type="_QE0EkK7gEe2EZoZ5sgiBCg" direction="return"/>
      <ownedParameter xmi:id="_TnD78LFUEe2z_s-Al402-w" name="NewParameter2" type="_W7vZ8K79Ee2EZoZ5sgiBCg" direction="return"/>
      <ownedParameter xmi:id="_YG02YLFVEe2z_s-Al402-w" name="NewParameter3" type="_9pVK8LK0Ee24ffphK9Na6g"/>
      <ownedParameter xmi:id="_huGJQbFuEe21bf9NlKs9Kg" name="NewParameter4"/>
    </ownedOperation>
  </packagedElement>
  <packagedElement xmi:type="uml:DataType" xmi:id="_W7vZ8K79Ee2EZoZ5sgiBCg" name="NewDataType1"/>
  <packagedElement xmi:type="uml:Class" xmi:id="_7Y-R4LK0Ee24ffphK9Na6g" name="NewClass2" isAbstract="true"/>
  <packagedElement xmi:type="uml:Enumeration" xmi:id="_8Q6mgLK0Ee24ffphK9Na6g" name="NewEnumeration1">
    <ownedLiteral xmi:id="__G-0sLK0Ee24ffphK9Na6g" name="NewEnumerationLiteral1"/>
  </packagedElement>
  <packagedElement xmi:type="uml:Interface" xmi:id="_9pVK8LK0Ee24ffphK9Na6g" name="NewInterface1"/>
  <packagedElement xmi:type="uml:Package" xmi:id="_99xw8LK0Ee24ffphK9Na6g" name="NewPackage3" visibility="public">
    <packageImport xmi:id="_dxJb8LK1Ee24ffphK9Na6g" importedPackage="_dDtuMLK1Ee24ffphK9Na6g"/>
    <packageMerge xmi:id="_e5mRwLK1Ee24ffphK9Na6g" mergedPackage="_ed5NMLK1Ee24ffphK9Na6g"/>
    <packagedElement xmi:type="uml:Package" xmi:id="_AmwlYLK1Ee24ffphK9Na6g" name="NewPackage1"/>
  </packagedElement>
  <packagedElement xmi:type="uml:PrimitiveType" xmi:id="_-da6ULK0Ee24ffphK9Na6g" name="NewPrimitiveType1">
    <ownedAttribute xmi:id="_ipeAULK2Ee24ffphK9Na6g" name="NewProperty1" isStatic="true" isDerived="true">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_ipenYLK2Ee24ffphK9Na6g" value="1"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_ipenYbK2Ee24ffphK9Na6g" value="1"/>
    </ownedAttribute>
  </packagedElement>
  <packagedElement xmi:type="uml:Abstraction" xmi:id="_J2H38LK1Ee24ffphK9Na6g" client="_QE0EkK7gEe2EZoZ5sgiBCg" supplier="_7Y-R4LK0Ee24ffphK9Na6g"/>
  <packagedElement xmi:type="uml:Class" xmi:id="_MHjIALK1Ee24ffphK9Na6g" name="NewClass1">
    <ownedAttribute xmi:id="_O3oqArK1Ee24ffphK9Na6g" name="asd" type="_QE0EkK7gEe2EZoZ5sgiBCg" association="_O3oC8LK1Ee24ffphK9Na6g">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_O3oqA7K1Ee24ffphK9Na6g" value="1"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_O3oqBLK1Ee24ffphK9Na6g" value="1"/>
    </ownedAttribute>
  </packagedElement>
  <packagedElement xmi:type="uml:Class" xmi:id="_Mg74YLK1Ee24ffphK9Na6g" name="NewClass3">
    <ownedAttribute xmi:id="_UaiR4LK1Ee24ffphK9Na6g" name="asd" type="_QE0EkK7gEe2EZoZ5sgiBCg" association="_UahDwLK1Ee24ffphK9Na6g">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_UaiR4bK1Ee24ffphK9Na6g" value="1"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_UaiR4rK1Ee24ffphK9Na6g" value="1"/>
    </ownedAttribute>
  </packagedElement>
  <packagedElement xmi:type="uml:Class" xmi:id="_M-U_ALK1Ee24ffphK9Na6g" name="NewClass4">
    <substitution xmi:id="_Gt7igLK2Ee24ffphK9Na6g" client="_M-U_ALK1Ee24ffphK9Na6g" supplier="_EWMPELK2Ee24ffphK9Na6g" contract="_EWMPELK2Ee24ffphK9Na6g"/>
    <ownedAttribute xmi:id="_VYM0ArK1Ee24ffphK9Na6g" name="asd" type="_QE0EkK7gEe2EZoZ5sgiBCg" association="_VYMM8LK1Ee24ffphK9Na6g">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_VYNbELK1Ee24ffphK9Na6g" value="1"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_VYNbEbK1Ee24ffphK9Na6g" value="1"/>
    </ownedAttribute>
  </packagedElement>
  <packagedElement xmi:type="uml:Class" xmi:id="_Nbk7sLK1Ee24ffphK9Na6g" name="NewClass5"/>
  <packagedElement xmi:type="uml:Association" xmi:id="_O3oC8LK1Ee24ffphK9Na6g" memberEnd="_O3oC8bK1Ee24ffphK9Na6g _O3oqArK1Ee24ffphK9Na6g"/>
  <packagedElement xmi:type="uml:Association" xmi:id="_UahDwLK1Ee24ffphK9Na6g" memberEnd="_UahDwbK1Ee24ffphK9Na6g _UaiR4LK1Ee24ffphK9Na6g"/>
  <packagedElement xmi:type="uml:Association" xmi:id="_VYMM8LK1Ee24ffphK9Na6g" memberEnd="_VYMM8bK1Ee24ffphK9Na6g _VYM0ArK1Ee24ffphK9Na6g"/>
  <packagedElement xmi:type="uml:Dependency" xmi:id="_XCaTELK1Ee24ffphK9Na6g" client="_QE0EkK7gEe2EZoZ5sgiBCg" supplier="_Nbk7sLK1Ee24ffphK9Na6g"/>
  <packagedElement xmi:type="uml:Package" xmi:id="_dDtuMLK1Ee24ffphK9Na6g" name="NewPackage1">
    <packageImport xmi:id="_wZ60QLK9Ee2fn9jN03lZYw" importedPackage="_ed5NMLK1Ee24ffphK9Na6g"/>
  </packagedElement>
  <packagedElement xmi:type="uml:Package" xmi:id="_ed5NMLK1Ee24ffphK9Na6g" name="NewPackage2"/>
  <packagedElement xmi:type="uml:Realization" xmi:id="_ghLTkLK1Ee24ffphK9Na6g" client="_QE0EkK7gEe2EZoZ5sgiBCg" supplier="_9pVK8LK0Ee24ffphK9Na6g"/>
  <packagedElement xmi:type="uml:Class" xmi:id="_D0YigLK2Ee24ffphK9Na6g" name="NewClass6"/>
  <packagedElement xmi:type="uml:Class" xmi:id="_EWMPELK2Ee24ffphK9Na6g" name="NewClass7"/>
  <packagedElement xmi:type="uml:Usage" xmi:id="_FGLhkLK2Ee24ffphK9Na6g" client="_Mg74YLK1Ee24ffphK9Na6g" supplier="_D0YigLK2Ee24ffphK9Na6g"/>
  <packagedElement xmi:type="uml:Class" xmi:id="_LjfcIbSLEe2pkZx4lGC8Ew" name="asd2">
    <ownedAttribute xmi:id="_ItfSANIcEe2rY5KN6ehSig" name="NewClass8" type="_j12MQL0cEe2besM683MlUA" association="_ItM-INIcEe2rY5KN6ehSig">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_Itf5ENIcEe2rY5KN6ehSig" value="1"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_ItggINIcEe2rY5KN6ehSig" value="1"/>
    </ownedAttribute>
  </packagedElement>
  <packagedElement xmi:type="uml:Class" xmi:id="_j12MQL0cEe2besM683MlUA" name="NewClass8" isAbstract="true">
    <ownedAttribute xmi:id="_ItggIdIcEe2rY5KN6ehSig" name="asd2" type="_LjfcIbSLEe2pkZx4lGC8Ew" association="_ItM-INIcEe2rY5KN6ehSig">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_ItggItIcEe2rY5KN6ehSig" value="1"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_IthHMNIcEe2rY5KN6ehSig" value="1"/>
    </ownedAttribute>
  </packagedElement>
  <packagedElement xmi:type="uml:Class" xmi:id="_Uk2g0cymEe2SqIqlz0mqiA" name="NewClass9">
    <ownedAttribute xmi:id="_uKNqAc1tEe2aWMTUBOnCiQ" name="NewProperty1" type="_j12MQL0cEe2besM683MlUA">
      <lowerValue xmi:type="uml:LiteralInteger" xmi:id="_uK1VEM1tEe2aWMTUBOnCiQ" value="3"/>
      <upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="_uK1VEc1tEe2aWMTUBOnCiQ" value="5"/>
    </ownedAttribute>
    <ownedOperation xmi:id="_45WxkM5PEe2J1pPdCxXkdw" name="NewOperation1" visibility="public">
      <ownedParameter xmi:id="_8YNeEM5PEe2J1pPdCxXkdw" name="NewParameter1" type="_MHjIALK1Ee24ffphK9Na6g"/>
      <ownedParameter xmi:id="_e-0x0dI3Ee2XPc95mjsJSg" name="NewParameter2" type="_j12MQL0cEe2besM683MlUA" direction="return"/>
    </ownedOperation>
  </packagedElement>
  <packagedElement xmi:type="uml:Association" xmi:id="_ItM-INIcEe2rY5KN6ehSig" memberEnd="_ItfSANIcEe2rY5KN6ehSig _ItggIdIcEe2rY5KN6ehSig"/>
</uml:Model>
`

export const exampleModel = {
  serializedModel,
  parameters: {
    debug: false,
    idAttribute: 'xmi:id',
    relationshipsAsEdges: true,
    strict: true,
  },
  parser: UmlParser,
}
