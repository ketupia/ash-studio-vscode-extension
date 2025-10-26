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
    public uri: unknown,
    public position: Position
  ) {}
}

export const workspace = {};  

export const window = {
  showInformationMessage: () => {},
};

export interface ExtensionContext {
  subscriptions?: { dispose(): void }[];
}

export const createExtensionContext = (): ExtensionContext => ({
  subscriptions: [],
});

export class DefinitionProvider {}

export type ProviderResult<T> = T | undefined | null;

export default {};
