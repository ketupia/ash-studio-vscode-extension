import * as path from "path";
import * as fs from "fs";
import { jest } from "@jest/globals";

import {
  getGeneratedDiagramFilePath,
  readGeneratedDiagramFile,
  maybeDeleteGeneratedDiagram,
} from "../../../src/utils/diagramMixUtils";
import { DiagramSpec } from "../../../src/types/configurationRegistry";

describe("diagramMixUtils helpers", () => {
  describe("getGeneratedDiagramFilePath", () => {
    it("uses resource basename and filePattern to compose path", () => {
      const resource = path.join("/project/lib", "album.ashexample");
      const spec: DiagramSpec = {
        filePattern: ".mmd",
        mixCommand: "",
      } as unknown as DiagramSpec;
      const out = getGeneratedDiagramFilePath(resource, spec);
      expect(path.basename(out)).toBe("album.mmd");
    });

    it("handles empty filePattern", () => {
      const resource = path.join("/project/lib", "artist.ex");
      const spec: DiagramSpec = {
        filePattern: "",
        mixCommand: "",
      } as unknown as DiagramSpec;
      const out = getGeneratedDiagramFilePath(resource, spec);
      expect(path.basename(out)).toBe("artist");
    });

    it("trims whitespace from filePattern", () => {
      const resource = path.join("/project/lib", "user.ex");
      const spec: DiagramSpec = {
        filePattern: "-graph.mmd  ",
        mixCommand: "",
      } as unknown as DiagramSpec;
      const out = getGeneratedDiagramFilePath(resource, spec);
      expect(path.basename(out)).toBe("user-graph.mmd");
    });
  });

  // Lightweight tests for file read/delete helpers will use jest mocks
  describe("file helpers (mocked fs)", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("readGeneratedDiagramFile throws when file missing", async () => {
      jest
        .spyOn(fs.promises, "readFile")
        .mockRejectedValue(new Error("ENOENT"));
      await expect(
        readGeneratedDiagramFile("/no/such/path.mmd")
      ).rejects.toThrow();
    });

    it("maybeDeleteGeneratedDiagram unlinks when lifecycle is auto-delete", async () => {
      const unlinkSpy = jest
        .spyOn(fs.promises, "unlink")
        .mockResolvedValue(undefined);
      await maybeDeleteGeneratedDiagram("/tmp/some.mmd", "auto-delete");
      expect(unlinkSpy).toHaveBeenCalledWith("/tmp/some.mmd");
    });

    it("maybeDeleteGeneratedDiagram skips unlink when lifecycle is generate-only", async () => {
      const unlinkSpy = jest
        .spyOn(fs.promises, "unlink")
        .mockResolvedValue(undefined);
      await maybeDeleteGeneratedDiagram("/tmp/other.mmd", "generate-only");
      expect(unlinkSpy).not.toHaveBeenCalled();
    });

    it("maybeDeleteGeneratedDiagram throws on unexpected unlink errors", async () => {
      jest
        .spyOn(fs.promises, "unlink")
        .mockRejectedValue(new Error("EACCES: permission denied"));
      await expect(
        maybeDeleteGeneratedDiagram("/tmp/fail.mmd", "auto-delete")
      ).rejects.toThrow(/permission denied/);
    });
  });
});
