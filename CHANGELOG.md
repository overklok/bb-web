# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Client version check (+ widget)
## [1.2.1] - 2021-09-14

### Fixed
- Invalid plate removal caused by plate settling algorithm modification
- Auxiliary points with numeric coordinates does not exist

## [1.2.0] - 2021-09-13

### Added
- I18next intergation
- English and russian localization (for main app & blockly)
- Live language switching
- Language selection in SettingsView and HomeView
- Saving preferred language via the core

## [1.1.2b] - 2021-08-19

### Added
- Ability to serve application without backend server
## [1.1.2] - 2021-08-13

### Updated
- 'About' widget: issue report request button added

## [1.1.1] - 2021-08-11

### Added
- 'About' widget with version information

## [1.1.0] - 2021-30-07

### Fixed
- Fix fidget deattaching after attaching because of accidental order of React components mount/unmount.

### Changed
- Core: Presenter instances are persistent after widget load. Views does not detached from the Presenters when unmounting.
- Imperative Views methods that write to mount-dependent objects will be called after mount only.

### Updated
- Updated Changelog formatting

### Deprecated
- Any Imperative View methods that reads from mount-dependent objects is removed or marked as deprecated.

## [1.0.9] - 2021-29-07

### Changed
- Breadboard: Verifier-specific board config does not contain arduino pins as an embedded plates, they are configured to be in the same domains as their corresponding plus / minus contacts.
