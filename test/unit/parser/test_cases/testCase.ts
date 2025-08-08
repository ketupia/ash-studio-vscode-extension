import { ModuleConfiguration } from "../../../../src/types/configurationRegistry";
import { ParsedSection } from "../../../../src/types/parser";

export interface TestCase {
  file: string;
  configs: ModuleConfiguration[];
  sections: ParsedSection[];
}
