# CHANGELOG

## [v0.1.0] - 2026-08-23

### Added

- Added the browser-native port of canonical `T000092-cognitive-reflection-test`.
- Added the exact three-item config, editable numeric input, aligned classification, and deterministic fixed-item scheduling.
- Added shared-runner dispatch workflow and transfer audit.

### Changed

- Re-authored PsychoPy presentation through browser-native `TrialBuilder` and `StimUnit` primitives.

### Fixed

- Kept lifecycle and instruction stages inside item trials so reduced output remains one row per logical item.
