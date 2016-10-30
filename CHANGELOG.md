# Unreleased

- Add `security` option by default to the unit test files generated for all the frameworks.

# v3.0.0

## Breaking changes
- `models` are not generated anymore, instead `data` providers are generated. Data providers use `mock` responses by default.

## Enhancements and Bug fixes
- new yeoman infrastructure
- #80 - Use swagger parser to parse and validate swagger 2.0 spec
- #61, #54 - Support to define Reference Object as a Relative Schema File
- #17 - Pass the swagger source file as a CLI option
- #49 - apiPath options assumes that the path is local. Remote file paths are not allowed as this CLI option
- #51 - Generator won't handle enums
- #8 - Issue with allOf in swagger definitions
- #66 - Generated handler sets a `501` status code and generated tests check for `200` status code
- #72 - Deprecate warning using generated code : body-parser deprecated bodyParser() usage

# v2.0.2

## Bug fixes
- #55
- Minor fixes and upgrades - #57, #63, #64, #65
- #12
- #69
- #73
