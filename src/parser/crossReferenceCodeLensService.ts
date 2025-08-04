import {
  ParsedSection,
  ParsedDetail,
  CrossReferenceCodeLensEntry,
} from "../types/parser";
import {
  ModuleInterface,
  DslBlock,
  ChildPattern,
} from "../types/configurationRegistry";

/**
 * Service to generate cross-reference code lens entries for Ash DSL navigation.
 * Matches source details (e.g., code_interface.define) to target details (e.g., actions.action) based on configuration.
 */
export class CrossReferenceCodeLensService {
  /**
   * Filter modules to only those with at least one crossReference child pattern.
   */
  private filterModulesWithCrossReferences(
    modules: ModuleInterface[]
  ): ModuleInterface[] {
    return modules.filter(m =>
      m.dslBlocks.some(
        b => b.childPatterns && b.childPatterns.some(p => p.crossReference)
      )
    );
  }

  /**
   * Find a detail in a given block by name.
   */
  private findDetailByName(
    sections: ParsedSection[],
    blockName: string,
    name: string
  ): ParsedDetail | undefined {
    const section = sections.find(s => s.section === blockName);
    if (!section) return undefined;
    return section.details.find(d => d.name === name);
  }

  /**
   * Get all DslBlocks in a module that have at least one crossReference child pattern.
   */
  private getBlocksWithCrossReferences(module: ModuleInterface): DslBlock[] {
    return module.dslBlocks.filter(
      b => b.childPatterns && b.childPatterns.some(p => p.crossReference)
    );
  }

  /**
   * Helper to create a cross-reference code lens entry for a given detail and pattern.
   */
  private createCrossReferenceCodeLens(
    sections: ParsedSection[],
    dslBlock: DslBlock,
    pattern: ChildPattern,
    detail: ParsedDetail
  ): CrossReferenceCodeLensEntry | undefined {
    const targetDetail = this.findDetailByName(
      sections,
      pattern.crossReference!.blockName,
      detail.name!
    );
    if (!targetDetail) return undefined;
    return {
      line: detail.line,
      character: detail.column - 1,
      title: `Go to ${pattern.crossReference!.blockName}`,
      targetLine: targetDetail.line,
    };
  }

  /**
   * Generate cross-reference code lens entries for all matches found in the parsed sections.
   * @param sections - The parsed sections of the module.
   * @param matchedModules - Array of module configurations (with crossReference info in childPatterns).
   * @returns Array of CrossReferenceCodeLensEntry for navigation.
   */
  public getCrossReferenceCodeLenses(
    sections: ParsedSection[],
    matchedModules: ModuleInterface[]
  ): CrossReferenceCodeLensEntry[] {
    // Pipeline-style processing for clarity
    return this.filterModulesWithCrossReferences(matchedModules).flatMap(
      moduleConfig =>
        this.getCrossReferenceLensesForModule(sections, moduleConfig)
    );
  }

  /**
   * Get all cross-reference code lens entries for a single module.
   */
  private getCrossReferenceLensesForModule(
    sections: ParsedSection[],
    moduleConfig: ModuleInterface
  ): CrossReferenceCodeLensEntry[] {
    return this.getBlocksWithCrossReferences(moduleConfig).flatMap(dslBlock =>
      this.getCrossReferenceLensesForBlock(sections, dslBlock)
    );
  }

  /**
   * Get all cross-reference code lens entries for a single DSL block.
   */
  private getCrossReferenceLensesForBlock(
    sections: ParsedSection[],
    dslBlock: DslBlock
  ): CrossReferenceCodeLensEntry[] {
    if (!dslBlock.childPatterns) return [];
    return dslBlock.childPatterns
      .filter(pattern => pattern.crossReference)
      .flatMap(pattern =>
        this.getCrossReferenceLensesForPattern(sections, dslBlock, pattern)
      );
  }

  /**
   * Get all cross-reference code lens entries for a single child pattern.
   */
  private getCrossReferenceLensesForPattern(
    sections: ParsedSection[],
    dslBlock: DslBlock,
    pattern: ChildPattern
  ): CrossReferenceCodeLensEntry[] {
    const section = sections.find(s => s.section === dslBlock.blockName);
    if (!section) return [];
    return section.details
      .filter(detail => detail.name)
      .map(detail =>
        this.createCrossReferenceCodeLens(sections, dslBlock, pattern, detail)
      )
      .filter(Boolean) as CrossReferenceCodeLensEntry[];
  }
}
