import { SymbolKind } from "vscode";
import {
  ModuleConfiguration,
  namePatterns,
} from "../types/configurationRegistry";

const Ash_Resource_Config: ModuleConfiguration = {
  displayName: "Ash.Resource",
  declarationPattern: "Ash.Resource",
  dslSections: [
    {
      name: "actions",
      symbol: SymbolKind.Method,
      childPatterns: [
        {
          keyword: "create",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
        {
          keyword: "read",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
        {
          keyword: "update",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
        {
          keyword: "destroy",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
        {
          keyword: "action",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
      ],
    },
    {
      name: "aggregates",
      symbol: SymbolKind.Variable,
      childPatterns: [
        {
          keyword: "count",
          namePattern: namePatterns.not_boolean_name,
          isDefinition: true,
        },
        {
          keyword: "exists",
          namePattern: namePatterns.boolean_name,
          isDefinition: true,
        },
        {
          keyword: "first",
          namePattern: namePatterns.not_boolean_name,
          isDefinition: true,
        },
        {
          keyword: "sum",
          namePattern: namePatterns.not_boolean_name,
          isDefinition: true,
        },
        {
          keyword: "list",
          namePattern: namePatterns.not_boolean_name,
          isDefinition: true,
        },
        {
          keyword: "max",
          namePattern: namePatterns.not_boolean_name,
          isDefinition: true,
        },
        {
          keyword: "min",
          namePattern: namePatterns.not_boolean_name,
          isDefinition: true,
        },
        {
          keyword: "avg",
          namePattern: namePatterns.not_boolean_name,
          isDefinition: true,
        },
        {
          keyword: "custom",
        },
      ],
    },
    {
      name: "attributes",
      symbol: SymbolKind.Field,
      childPatterns: [
        {
          keyword: "attribute",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
      ],
    },
    {
      name: "calculations",
      symbol: SymbolKind.Property,
      childPatterns: [
        {
          keyword: "calculate",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
      ],
    },
    {
      name: "changes",
      childPatterns: [
        {
          keyword: "change",
        },
      ],
    },
    {
      name: "code_interface",
      symbol: SymbolKind.Method,
      childPatterns: [
        {
          keyword: "define",
          namePattern: namePatterns.primitive_name,
        },
      ],
    },
    {
      name: "identities",
      childPatterns: [
        {
          keyword: "identity",
          namePattern: namePatterns.primitive_name,
        },
      ],
    },
    {
      name: "policies",
      symbol: SymbolKind.Property,
      childPatterns: [
        {
          keyword: "bypass",
          namePattern: namePatterns.everything_up_to_do,
        },
        {
          keyword: "policy",
          namePattern: namePatterns.everything_up_to_do,
        },
      ],
    },
    {
      name: "preparations",
      childPatterns: [
        {
          keyword: "prepare",
        },
      ],
    },
    {
      name: "relationships",
      symbol: SymbolKind.Interface,
      childPatterns: [
        {
          keyword: "belongs_to",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
        {
          keyword: "has_many",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
        {
          keyword: "has_one",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
        {
          keyword: "many_to_many",
          namePattern: namePatterns.primitive_name,
          isDefinition: true,
        },
      ],
    },
    {
      name: "resource",
      childPatterns: [],
    },
    {
      name: "validations",
      childPatterns: [
        {
          keyword: "validate",
          namePattern: namePatterns.primitive_name,
        },
      ],
    },
  ],
  diagramSpecs: [
    {
      name: "Policy Flowchart",
      keyword: "policies",
      mixCommand: "ash.generate_policy_charts",
      filePattern: "-policy-flowchart.mmd",
    },
  ],
};

export default Ash_Resource_Config;
