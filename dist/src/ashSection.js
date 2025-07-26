"use strict";
// Legacy interfaces - re-exported from ashParser.ts for compatibility
// TODO: Update imports to use ashParser.ts directly and remove this file
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAshText = exports.parseAshDocument = void 0;
var ashParser_1 = require("./ashParser");
Object.defineProperty(exports, "parseAshDocument", { enumerable: true, get: function () { return ashParser_1.parseAshDocument; } });
Object.defineProperty(exports, "parseAshText", { enumerable: true, get: function () { return ashParser_1.parseAshText; } });
