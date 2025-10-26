export enum SymbolKind {
  File = 1,
  Module,
  Namespace,
  Package,
  Class,
  Method,
  Property,
  Field,
  Constructor,
  Enum,
  Interface,
  Function,
  Variable,
}

export const languages = {
  registerDefinitionProvider: () => ({ dispose: () => {} }),
};

export class Position {
  constructor(
    public line: number,
    public character: number
  ) {}
}

export class Location {
  constructor(
    public uri: any,
    public position: Position
  ) {}
}

export const workspace = {};

export const window = {
  showInformationMessage: () => {},
};

export const ExtensionContext = function () {} as any;

export const DefinitionProvider = class {} as any;

export const ProviderResult = null as any;

export default {} as any;
