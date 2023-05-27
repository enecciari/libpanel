# Documentation

This is the documentation for libpanel. Items starting with and underscore are private and should be used only if you want to change the way libpanel itself works. Do note that when you change something in libpanel, it will affect **every** extensions using libpanel.

This documenation uses typescript-like type annotations, even though the library is written in pure javascript. Exported object also have their type specified as follow:
  - Object: an instance of a class
  - Interface: a GObject interface
  - Mixin: a mixin that should be used like this: `class MyClass extends MyMixin(MySuperclass) { ... }`

## `LibPanel` (Object)

The main API endpoint. This is a global (shared between extensions) and unique object.

### `VERSION: number`

The version of the currently loaded libpanel.


## `LibPanel._AutoHidable` (Interface)

An interface for widgets that automatically hide when they're empty or contains only hidden widgets.

### `setup_autohide(container: Clutter.Actor = this)`

Setup the autohide features. Must be called in the constructor of your widget. If the widget that should be tracked for children isn't `this` you can provide `container`. However, the widget that will be shown / hidden is always `this`.

### `_get_ah_children() −> Clutter.Actor[]`

Return the children of the container. You can override this if you want to filter out some children for example.

### `_update_visibility()`

Manually ask `this` to check if it should be visible or not and change visibility accordingly. The only good reason to use this is if you don't use `setup_autohide` for some reason.


## `LibPanel._Semitransparent` (Mixin)

An interface for widgets that can be transparent to pointer events, while letting their children block them.

### `transparent: bool`

Whether `this` let pointer events pass through. The default value is `true`.

### `vfunc_pick(context: Clutter.PickContext)`

This function is used by Clutter to determine what areas of the widget capture pointer events. If the widget is set to be transparent, only the children of the widget are picked and not the widget itself.
















### Panel (Class)

#### `constructor(name: string, nColumns: number = 2)`

Create a new `Panel` with provided name and number of columns. The name is used to remember the position of the panel and **must** be unique per extension.

#### `addItem(item: Clutter.Actor, colSpan: number = 1)`

Add a new item to the new panel with a given column span. If your item have a popup menu it should be available as `item.menu`, which `QuickSettingsItem` automatically set for you if you inherit from it or any of its descendents.

#### `getItems()`

Return an array containing every items present in the panel.

#### `removeItem(item: Clutter.Actor)`

Remove an item from this panel. This method will try to clean up as much as possible and **must** be called when you remove an item without destroying it. Using this method might work correctly if `item` isn't actually a child of `this`, but it's highly discouraged.

#### `getColumnSpan(item: Clutter.Actor)`

Get the column span of an item. It's an error to call this method when `item` isn't a children of `this`.

#### `setColumnSpan(item: Clutter.Actor, colSpan: number)`

Set the column span of an item. It's an error to call this method when `item` isn't a children of `this`.
