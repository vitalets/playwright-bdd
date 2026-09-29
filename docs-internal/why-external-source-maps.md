# Inline and External Source Maps

Both approaches use the same Source Map v3 JSON to map generated Playwright test locations back to the original `.feature` file. The difference is where that JSON is stored and how tooling loads it.

## Inline Source Maps

The generated test embeds the map as a base64 data URL on its final line:

```js
//# sourceMappingURL=data:application/json;charset=utf-8;base64,...
```

The test and its map form a single artifact, so they are written, copied, and deleted together. Base64 encoding increases the map payload size by approximately one third and makes the generated JavaScript larger. Inspecting the map requires decoding the data URL.

## External Source Maps

The map is stored in a separate file next to the generated test:

```text
users.feature.spec.js
users.feature.spec.js.map
```

The generated test references it by a relative URL:

```js
//# sourceMappingURL=users.feature.spec.js.map
```

The JSON can be inspected directly and the generated JavaScript remains smaller. Both files must be kept together and cleaned up together. Writing the map before the test avoids publishing a new test that references a missing map.

## Comparison

| Aspect | Inline map | External map |
| --- | --- | --- |
| Generated artifacts | One test file | Test file plus map file |
| Map encoding | Base64-encoded JSON | Plain JSON |
| Generated JavaScript size | Larger because it includes the map | Smaller because the map is separate |
| Inspecting the map | Decode the data URL | Open the JSON file |
| File lifecycle | Test and map travel together | Coordinate writing, copying, and cleanup |
| Ignore rules | Generated test rule covers the map | Separate map-file rule may be needed |
| Playwright runner | Supports inline maps | Supports external maps |
| IDE integration | Requires data-URL support in the map resolver | Requires file-based map resolution |

## Shared Mapping Behavior

Both formats can embed the original feature text in `sourcesContent`, allowing consumers to display the source used during generation. Relative source paths resolve from the generated test's directory for an inline map and from the map file's directory for an external map. These bases are identical when an external map is stored next to its test.

The map format does not change the mappings themselves. With a consumer that supports the chosen format, either approach can provide feature-file locations for scenario selection, reports, and stack traces. IDE discovery is a separate consumer from the Playwright runner, so runner support alone does not establish IDE compatibility.
