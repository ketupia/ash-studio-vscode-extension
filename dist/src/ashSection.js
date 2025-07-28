"use strict";
// Legacy interfaces - re-exported from ashParser.ts for compatibility
// TODO: Update imports to use ashParser.ts directly and remove this file
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAshText = exports.parseAshDocument = exports.ParseError = exports.AshParseResult = exports.AshSectionDetail = exports.AshSection = void 0;
var ashParser_1 = require("./ashParser");
Object.defineProperty(exports, "AshSection", { enumerable: true, get: function () { return ashParser_1.AshSection; } });
Object.defineProperty(exports, "AshSectionDetail", { enumerable: true, get: function () { return ashParser_1.AshSectionDetail; } });
Object.defineProperty(exports, "AshParseResult", { enumerable: true, get: function () { return ashParser_1.AshParseResult; } });
Object.defineProperty(exports, "ParseError", { enumerable: true, get: function () { return ashParser_1.ParseError; } });
Object.defineProperty(exports, "parseAshDocument", { enumerable: true, get: function () { return ashParser_1.parseAshDocument; } });
Object.defineProperty(exports, "parseAshText", { enumerable: true, get: function () { return ashParser_1.parseAshText; } });
