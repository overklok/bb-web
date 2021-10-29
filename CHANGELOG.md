# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Removed
- Modal action handling in Views (as unused)

## [1.2.8] - 2021-10-19

### Fixed
- Empty 'distros/latest' sample response for http fakes
- No key for lesson list item in HomeView
- No fallback values for task_description, task_description_alt fields
- Empty app_details object is not handles (actual when the core is connected via Socket.IO)

## [1.2.7] - 2021-10-15

### Fixed
- Empty Blockly code when IF/IFELSE block is persented in the workspace

## [1.2.6] - 2021-10-09

### Fixed
- High CPU usage by HomeView - caused by SVG background animation

### Added
- Lesson filtering in HomeView based on current language

### Updated
- Minor visual updates

## [1.2.5] - 2021-10-03

### Fixed
- Board: fixed unfocusable input fields when injecting the board module 

## [1.2.4] - 2021-10-03

### Fixed
- Current line transition which causes unwanted color appearance when switching from weights close to zero
- Unmatched current particle positions when switching the weight caused by incorrect math processing

## [1.2.3] - 2021-10-30

### Added
- Localized Tapanda log (shown at 'home' and 'about' widgets)

## [1.2.2] - 2021-10-30

### Fixed
- Invalid 'referrerPolicy' value for CORS in SSL requests
- Incorrect client rc version number parsing in the update dialog  

### Updated
- URL scheme is shifted with prefix to work within a separated branch of server URL schema
- Verifier responses is localized (only for bb-srv 0.0.9+)

### Added
- Client version check (+ widget)
- Display task description for exercises based on lesson language property
- Display course's language in the lesson menu (initial view)

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
