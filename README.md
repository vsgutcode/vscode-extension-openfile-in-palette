# openfile-in-palette README

This extension allows you to open existing files and create new files from the palette.


## Features

* Create file with template.  
  The template for each extension should be specified in setting.json.Snippet is used for template. The description method follows https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax.
* Open file with path suggestion.
* The following symbols can be used to specify paths.
  + ~ : Home
  + .. : Parent Directory
  + \* : For example, ~/*.cpp.
* Rename file.
* Duplicate file.

## Usage

* in palette
 1. type openfile-in-palette: openfile.
 2. input path.

* key binding  
Assign openfile-in-palette.openfile to the key of your choice.

## Requirements



## Extension Settings

This extension contributes the following settings:

* `openfile-in-palette.templates.enable`: Enable/disable template.
* `openfile-in-palette.templates.map`: Set template for each extension.

## Known Issues


## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.10

Add rename and duplicate file command.

### 0.0.9

use os.homedir() for ~.

### 0.0.8

Add vsix installer for opening .vsix.

### 0.0.7

Fix for linux.

