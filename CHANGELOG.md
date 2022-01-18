# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased] - 2021-01-18

### Added

- skip exercise button 

## [1.2.12] - 2021-01-17

### Fixed
- "Launch only" mode is not applied when is_sandbox is set

### Removed
- task_description_* fields will not be interpreted

## [1.2.11] - 2021-12-03

### Added
- automated deploy to AWS instance
- support for temporary i18n server API updates

### Fixed
- duplicated ViewConnector instantiation for root widgets and when recomposed

## [1.2.10] - 2021-12-03

### Added
- automated deploy with Bitbucket Pipelines

## [1.2.9] - 2021-11-26

### Added
- more docs

### Changed
- board disconnection alert message


### Removed
- modal action handling in Views (as unused)
- pane creation/removal transitions
- unused ImperativeView methods are deprecated
- redundant logic in ImperativeView

## [1.2.8] - 2021-10-19

### Fixed
- empty 'distros/latest' sample response for http fakes
- no key for lesson list item in HomeView
- no fallback values for task_description, task_description_alt fields
- empty app_details object is not handles (actual when the core is connected via Socket.IO)

## [1.2.7] - 2021-10-15

### Fixed
- empty Blockly code when IF/IFELSE block is persented in the workspace

## [1.2.6] - 2021-10-09

### Fixed
- high CPU usage by HomeView - caused by SVG background animation

### Added
- lesson filtering in HomeView based on current language

### Updated
- minor visual updates

## [1.2.5] - 2021-10-03

### Fixed
- board: fixed unfocusable input fields when injecting the board module 

## [1.2.4] - 2021-10-03

### Fixed
- current line transition which causes unwanted color appearance when switching from weights close to zero
- unmatched current particle positions when switching the weight caused by incorrect math processing

## [1.2.3] - 2021-10-30

### Added
- localized Tapanda log (shown at 'home' and 'about' widgets)

## [1.2.2] - 2021-10-30

### Fixed
- invalid 'referrerPolicy' value for CORS in SSL requests
- incorrect client rc version number parsing in the update dialog  

### Updated
- URL scheme is shifted with prefix to work within a separated branch of server URL schema
- verifier responses is localized (only for bb-srv 0.0.9+)

### Added
- client version check (+ widget)
- display task description for exercises based on lesson language property
- display course's language in the lesson menu (initial view)

## [1.2.1] - 2021-09-14

### Fixed
- invalid plate removal caused by plate settling algorithm modification
- auxiliary points with numeric coordinates does not exist

## [1.2.0] - 2021-09-13

### Added
- i18next intergation
- english and russian localization (for main app & blockly)
- live language switching
- language selection in SettingsView and HomeView
- saving preferred language via the core

## [1.1.2b] - 2021-08-19

### Added
- ability to serve application without backend server
## [1.1.2] - 2021-08-13

### Updated
- 'About' widget: issue report request button added

## [1.1.1] - 2021-08-11

### Added
- 'About' widget with version information

## [1.1.0] - 2021-30-07

### Fixed
- fix fidget deattaching after attaching because of accidental order of React components mount/unmount.

### Changed
- core: Presenter instances are persistent after widget load. Views does not detached from the Presenters when unmounting.
- imperative Views methods that write to mount-dependent objects will be called after mount only.

### Updated
- Changelog formatting

### Deprecated
- any Imperative View methods that reads from mount-dependent objects is removed or marked as deprecated.

## [1.0.9] - 2021-29-07

### Changed
- Breadboard: Verifier-specific board config does not contain arduino pins as an embedded plates, they are configured to be in the same domains as their corresponding plus / minus contacts.
