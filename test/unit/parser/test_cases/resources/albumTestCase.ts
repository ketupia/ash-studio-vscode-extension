import Ash_Resource_Config from "../../../../../src/configurations/Ash.Resource.config";
import AshGraphql_Config from "../../../../../src/configurations/AshGraphql.config";
import AshJsonApi_Config from "../../../../../src/configurations/AshJsonApi.config";
import AshPostgres_Config from "../../../../../src/configurations/AshPostgres.config";
import { TestCase } from "../testCase";

export default {
  file: "test/example_files/resources/album.ashexample",
  configs: [
    AshGraphql_Config,
    AshPostgres_Config,
    Ash_Resource_Config,
    AshJsonApi_Config,
  ],
  // You may need to update these expected sections after running the test once
  sections: [
    // Example expected sections, update as needed
    {
      name: "graphql",
      startingLocation: { line: 9, column: 3 },
      endingLocation: { line: 11, column: 6 },
    },
    {
      name: "json_api",
      startingLocation: { line: 13, column: 3 },
      endingLocation: { line: 16, column: 6 },
    },
    {
      name: "postgres",
      startingLocation: { line: 18, column: 3 },
      endingLocation: { line: 25, column: 6 },
    },
    {
      name: "actions",
      startingLocation: { line: 27, column: 3 },
      endingLocation: { line: 47, column: 6 },
      children: [
        {
          keyword: "create",
          name: ":create",
          startingLocation: { line: 35, column: 5 },
        },

        {
          keyword: "destroy",
          name: ":destroy",
          startingLocation: { line: 30, column: 5 },
        },
        {
          keyword: "update",
          name: ":update",
          startingLocation: { line: 41, column: 5 },
        },
      ],
    },
    {
      name: "policies",
      startingLocation: { line: 49, column: 3 },
      endingLocation: { line: 65, column: 6 },
      children: [
        {
          keyword: "policy",
          name: "action_type(:read)",
          startingLocation: { line: 54, column: 5 },
        },
        {
          keyword: "policy",
          name: "action(:create)",
          startingLocation: { line: 58, column: 5 },
        },
        {
          keyword: "policy",
          name: "action_type([:update, :destroy])",
          startingLocation: { line: 62, column: 5 },
        },
        {
          keyword: "bypass",
          name: "actor_attribute_equals(:role, :admin)",
          startingLocation: { line: 50, column: 5 },
        },
      ],
    },
    {
      name: "changes",
      startingLocation: { line: 67, column: 3 },
      endingLocation: { line: 72, column: 6 },
    },
    {
      name: "validations",
      startingLocation: { line: 74, column: 3 },
      endingLocation: { line: 85, column: 6 },
    },
    {
      name: "attributes",
      startingLocation: { line: 87, column: 3 },
      endingLocation: { line: 106, column: 6 },
      children: [
        {
          keyword: "attribute",
          name: ":name",
          startingLocation: { line: 90, column: 5 },
        },
        {
          keyword: "attribute",
          name: ":year_released",
          startingLocation: { line: 95, column: 5 },
        },
        {
          keyword: "attribute",
          name: ":cover_image_url",
          startingLocation: { line: 100, column: 5 },
        },
      ],
    },
    {
      name: "relationships",
      startingLocation: { line: 108, column: 3 },
      endingLocation: { line: 122, column: 6 },
      children: [
        {
          keyword: "belongs_to",
          name: ":artist",
          startingLocation: { line: 109, column: 5 },
        },
        {
          keyword: "has_many",
          name: ":tracks",
          startingLocation: { line: 113, column: 5 },
        },
        {
          keyword: "has_many",
          name: ":notifications",
          startingLocation: { line: 118, column: 5 },
        },
        {
          keyword: "belongs_to",
          name: ":created_by",
          startingLocation: { line: 120, column: 5 },
        },
        {
          keyword: "belongs_to",
          name: ":updated_by",
          startingLocation: { line: 121, column: 5 },
        },
      ],
    },
    {
      name: "calculations",
      startingLocation: { line: 124, column: 3 },
      endingLocation: { line: 133, column: 6 },
      children: [
        {
          keyword: "calculate",
          name: ":duration",
          startingLocation: { line: 125, column: 5 },
        },
        {
          keyword: "calculate",
          name: ":can_manage_album?",
          startingLocation: { line: 127, column: 5 },
        },
      ],
    },
    {
      name: "aggregates",
      startingLocation: { line: 135, column: 3 },
      endingLocation: { line: 137, column: 6 },
      children: [
        {
          keyword: "sum",
          name: ":duration_seconds",
          startingLocation: { line: 136, column: 5 },
        },
      ],
    },
    {
      name: "identities",
      startingLocation: { line: 139, column: 3 },
      endingLocation: { line: 142, column: 6 },
      children: [
        {
          keyword: "identity",
          name: ":unique_album_names_per_artist",
          startingLocation: { line: 140, column: 5 },
        },
      ],
    },
  ],
} as TestCase;
