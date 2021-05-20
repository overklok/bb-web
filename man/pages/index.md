# Tapanda: Breadboard web apps

This document describes implementation of the browser-run part of the project, 
provides guidance on how to configure and use it, 
and outlines some development conventions.

![](images/logo.png)

## What the project consists of

`tapanda/bb-web` comprises a set of web applications. It's intended to use it as frontends for 
_Tapanda: Breadboard_ clients, but some of them can be used as independent apps. 
They all share a common codebase, and at the same time involves specific components.

## Where to start with

This documentation is accompanied by the manual. It consists of several sections which may be useful to read.

* It's recommended to start with {@tutorial gs_index} to get basic understanding of 
  how the project is organized, make it possible to configure apps and build it on a local machine.
  
* Project applications are described in the {@tutorial apps_index} 
  section of the manual.
  
* If you need more details on the core architecture and how it drives the applications, 
  refer to the {@tutorial arch_index}. This section relies highly on the API reference, 
  so it may be a good starting point to browse the source code.

* _TODO_: For additional info, browse the {@tutorial guides_index} section pages.

* If you want to contribute, it's welcome to read the {@tutorial dev_index}
  section to keep the code consistent and well-organized.
