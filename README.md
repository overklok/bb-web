# tapanda/bb-web
A set of single-page web applications for Tapanda e-learning system to teach programming and electronics.

> :warning: **This is a public version of the project.** Full documentation is maintained separately, 
and some components may be omitted here.

Production version is deployed at https://board.tapanda.ru

It's intended to use it as frontends for _Tapanda: Breadboard_ clients, but some of them can be used 
as independent apps. They all share a common codebase, and at the same time involves specific components:

| Application | Function                                                                                             |
|-------------|------------------------------------------------------------------------------------------------------|
| main        | The main SPA, hosted on board.tapanda.ru                                                             |
| board       | Virtual breadboard editor/visualizer                                                                 |           
| blockly     | Blockly program editor                                                                               |
| monkey      | Monkey testing tool                                                                                  |
| playground  | Allows to work with the Breadboard and Blockly programs simultaneously, including Arduino programming|

## Architecture

This project can be divided into 3 parts:
* the core
* specific custom modules (e. g. utilities)
* applications (llisted above)

**The core** contains the implementation of the architecture, including base classes and commonly used components. 
The only global dependency is the React library which is slightly related to some core components, 
and which is not necessary to use in applications. The core is based on the _Model-View-Presenter_ 
architectural style, where _Views_ can be implemented in a declarative style using React JSX.

**Utilities** are located in a separate place, since they can be transferred to separate libraries in terms of 
volume and weak connection with the rest of the code. In order not to complicate the development of unsettled 
requirements, it was decided not to do this yet.

An **application** typically consists of arranged _Widgets_. In total, an application can have several markup modes, 
which can be switched programmatically.
A Widget is a combination of a _View_ and a set of _Presenters_. _Presenters_, in turn, can access _Model_ instances 
to read and write data.

## Utilities

### Virtual Breadboard

Virtual Breadboard editor/visualizer is placed in `utils/breadboard` directory. 
Implemented using the `SVG.js` library.

`breadboard` functions:
* Display elements
* Display currents
* Display debug information
* Editing the Breadboard configuration:
	* Adding new elements to the board
	* Moving elements placed on the board
    * Rotating elements placed on the board
    * Changing input paramenters of elements
    * Removing elements placed on the board
* Import/export board configuration in JSON format
* Export board image in SVG/PNG

The `breadboard` consists of multiple layers graphically and structurally.
Layers are independent, and controlled from the main facade class `Breadboard`.

### Blockly integration

To integrate `Blockly` workspace into Tapanda application environment, `BlocklyWrapper` utility is used. It performs following functions:
* Wrapping Blockly workspace initialization and setup in a single class
* Block limit management
* Block type management
* Command generator management
* Read-only mode switching 
* Highlighting incorrect program fragments
* Implementation of the block type editor for the admin panel

## File structure

### Root

| Path                              | Description                           |
|-----------------------------------|---------------------------------------|
| `__mocks__`                       | Mock functions for 3rd party libs     |
| `dist`                            | App build results                     |               
| `doc`                             | Doc build results                     |
| `fixtures`                        | Data samples for development/testing  |
| `man`                             | Documentation sources                 |
| `man/pages`                       | Markdown pages                        |
| `man/static`                      | Static files (CSS, images) for pages  |
| `src`                             | Codebase root                         |
| `src/css`                         | Styles                                |
| `src/css/blocks`                  | Blocks (BEM)                          |
| `src/css/core`                    | Base blocks used in core Views        |
| `src/fonts`                       | Source fonts                          |
| `src/html`                        | Dev server webpage templates          |
| `src/images`                      | Images used in the project            |
| `src/js`                          | JS codebase root                      |
| `src/js/configs`                  | App configs                           |
| `src/js/configs/*/layouts.js`     | Markup modes                          |
| `src/js/configs/*/widgets.js`     | Widget list                           |
| `src/js/configs/*/settings.js`    | App settings                          |
| `src/js/core`                     | Core root                             |
| `src/js/models`                   | App models                            |
| `src/js/presenters`               | App presenters                        |
| `src/js/views`                    | App views                             |
| `src/js/routers`                  | App routers                           |
| `src/js/utils`                    | Auxiliary modules                     |
| `src/js/utils/blockly`            | Blockly integration                   |
| `src/js/utils/breadboard`         | Virtual Breadboard                    |
| `src/js/BlocklyApplication.ts`    | `blockly` app                         |
| `src/js/BoardApplication.ts`      | `board` app                           |
| `src/js/MainApplication.ts`       | `main` app                            |
| `src/js/MonkeyApplication.ts`     | `monkey` app                          |
| `src/js/PlaygroundApplication.ts` | `playground` app                      |
| `.babelrc`                        | global Babel config (used by Jest)    |
| `.env`                            | Env variables used to build           |
| `.env.sample`                     | Example of the `.env` file            |
| `babel.config.js`                 | .babelrc overridings                  |
| `jest.config.js`                  | Jest config                           |
| `jsdoc.json`                      | JSDoc config                          |
| `package.json`                    | Project parameters                    |
| `tsconfig.json`                   | TypeScript config                     |
| `webpack.config.js`               | Build config                          |
| `CHANGELOG.md`                    | Project change log                    |

### Core

| Path                      | Description                         |
|---------------------------|-------------------------------------|
| `base`                    | Base classes of the core            |
| `base/model`              | Base Model classes                  |
| `base/model/datasources`  | Base Data source implementations    |
| `base/model/middlewares`  | Intermediate data processors        |
| `base/view`               | Base View and Presenter classes     |
| `base/view/viewcomposers` | View composer implementations       |
| `datatypes`               | Data type helpers (TS)              |
| `helpers`                 | Helper functions                    |
| `helpers/exceptions`      | Exception types                     |
| `models`                  | Core Model implementations          |
| `models/datasources`      | Core Data source implementations    |
| `models/middleware`       | Core data processor implementations |
| `presenters`              | Presenter implementations           |
| `providers`               | Service providers                   |
| `services`                | Service implementations             |
| `services/interfaces`     | Service interfaces                  |
| `routers`                 | Router implementations              |
| `views`                   | View implementations                |
| `views/layout`            | `LayoutView` and its components     |
| `views/modal`             | `ModalView` and its components      |

### Virtual Breadboard

| Path                      | Description                         |
|---------------------------|-------------------------------------|
| `core`                    | Base classes of the `breadboard`    |
| `core/extras`             | Auxiliary functions                 |
| `core/plate`              | Base subtypes of the `Plate` class  |
| `extras`                  | Additional board configurations     |
| `layers`                  | Layer implementations               |
| `menus`                   | Menu implementations                |
| `plates`                  | `Plate` implementations             |
| `styles`                  | Styles (CSS)                        |

## Usage

Before using for client/server development or deployment, create an `.env` environment variable file located 
at the root of the project, like `.env.example`. 
For development without other projects, you do not need to create this file.

### Launch

Launch command format (call from the project root):
```
npm run <entry>:<launch_type>
```

where `<entry>` is simply a name of one of the apps listed in the beginning of this document,
and `<launch_type>` is one of the following:

| Launch type | Description                                                                                 |
|-------------|---------------------------------------------------------------------------------------------|
| `build`     | Single distribuiton build (no map-files included). _Used primarily for deployment._         |
| `watch`     | Live distribution build. _Used for development within server/client environment._           |
| `serve`     | Live distribution build with dev server. _Used for development without external programs._  |

The list of commands is defined in `webpack.config.js`.
