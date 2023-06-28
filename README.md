Documentation
=============

This is the documentation for libpanel. Items starting with and underscore are private and should be used only if you want to change the way libpanel itself works. Do note that when you change something in libpanel, it will affect **every** extensions using libpanel.

This documenation uses typescript-like type annotations, even though the library is written in pure javascript. Exported object also have their type specified as follow:
  - `object`: an instance of a class
  - `interface`: a GObject interface
  - `mixin`: a mixin that should be used like this: `class MyClass extends MyMixin(MySuperclass) { ... }`
  - `property`: a GObject property (which means you can bind it and use the `notify` signal for it)

`main.js`
=========

The main file of libpanel. This is the file from where you'll import every objects to interact with libpanel. Other files may be imported by your extension as they contains utilitie functions and classes

`LibPanel: object`
-------------------

The main API endpoint. This is a global (shared between extensions) and unique object.

### `VERSION: number`

The version of the currently loaded libpanel.

### `enablers: string[]`

The uuid of every extension that enabled libpanel.

### `enabled: bool`

Check if libpanel is enabled. This property is not writable.

### `enable()`

Enable libpanel. This will replace the quick settings panel with the libpanel panel grid. Each `enable` must be paired with a `disable` in the same extension.
IMPORTANT NOTICE: you NEED to enable libpanel before using any of its objects.

### `disable()`

Disable libpanel. This will reverse any changes made to gnome-shell.

### `main_panel`

The main panel. If libpanel is enabled it's the `LibPanel._Panel` that replaces the main panel, if libpanel is disabled it's the gnome's panel.

### `addPanel(panel: Panel)`

Add a new panel to the grid. It will be automatically placed where it should be.

### `removePanel(panel: Panel)`

Remove a panel from the grid.

### `_enable()`

The actual method that enables libpanel. This doesn't check if libpanel is already enabled.

### `_disable()`

The actual method that disables libpanel. This doesn't check if other extensions still needs to have libpanel enabled.

### `_replace_menu(new_menu)`

Replace the current menu (without destroying it) with `new_menu` and return the current one it.

### `_patcher: patcher.Patcher | null`

The patcher used by libpanel. `null` when libpanel is disabled.

### `_old_menu`

The gnome's menu when libpanel is enabled, `null` otherwise.

### `_panel_grid: LibPanel._PanelGrid | null`

The grid of panels. `null` when libpanel is disabled.

### `_settings: Gio.Settings`

The libpanel's settings.


`Panel(name: string, nColumns: number = 2)`
-------------------------------------------

A panel just like the quick settings one. The name must be unique per extension.
Every methods available on this class are also available one the gnome panel.

#### `getItems() -> Clutter.Actor[]`

Return an array containing every items present in the panel.

#### `addItem(item: Clutter.Actor, colSpan: number = 1)`

Add a new item to the new panel with a given column span. If your item have a popup menu it should be available as `item.menu`, which `QuickSettingsItem` automatically set for you if you inherit from it or any of its descendents.

#### `removeItem(item: Clutter.Actor)`

Remove an item from this panel. This method will try to clean up as much as possible and **must** be called when you remove an item without destroying it. Using this method might work correctly if `item` isn't actually a child of `this`, but it's highly discouraged.

#### `getColumnSpan(item: Clutter.Actor) -> number`

Get the column span of an item. It's an error to call this method when `item` isn't a children of `this`.

#### `setColumnSpan(item: Clutter.Actor, colSpan: number)`

Set the column span of an item. It's an error to call this method when `item` isn't a children of `this`.


`LibPanel._AutoHidable(..., { container: Clutter.Actor = this, ... }): mixin`
------------------------------------------------------------------------------

A mixin for widgets that automatically hide when they're empty or contains only hidden widgets.
If the widget that should be tracked for children isn't `this` you can provide `container`. However, the widget that will be shown / hidden is always `this`. `null` can also be passed for `container` if you want to setup your container later.

### `container: Clutter.Actor`

The widget that is tracked for children to detect wheter this widget should be hidden. This property is writable.

### `_get_ah_children() −> Clutter.Actor[]`

Return the children of the container. You can override this if you want to filter out some children for example.

### `_update_visibility()`

Manually ask `this` to check if it should be visible or not and change visibility accordingly. The only good reason to use this is if you set `this.container` to `null` for some reason.

### `_lpah_container: Clutter.Actor`

The widget that is observed for children. This attribute **must not** be written, you need to set `this.container` if you want to change it.


`LibPanel._Semitransparent(): mixin`
-------------------------------------

A mixin for widgets that can be transparent to pointer events, while letting their children block them.

### `transparent: bool`

Whether `this` let pointer events pass through. The default value is `true`.

### `vfunc_pick(context: Clutter.PickContext)`

This function is used by Clutter to determine what areas of the widget capture pointer events. If the widget is set to be transparent, only the children of the widget are picked and not the widget itself.


`LibPanel._GridItem(name: string): mixin`
------------------------------------------

A mixin for widgets that can be added to the panel grid. It notably adds drag & drop.

### `is_grid_item: bool = true`

This attribute indicates that this widget can be considered as a grid item. It's a replacement for `widget instanceof LibPanel._GridItem` as the later don't work because of the way the mixin works.

### `name: string`

The name of the panel is used to save and restore its position on the grid.

### `draggable: property[bool]`

Whether the widget is draggable.

### `_drag_handle: ui.dnd._Draggable`

The handle to the dragging handler.

### `_drag_monitor: object`

The current drag monitor, if any.

### `_on_drag_motion(event: object)`

Called when the mouse is moved while dragging.

### `_dnd_placeholder: LibPanel._DropZone`

The `DropZone` used as a placeholder to show where the widget will be dropped. Only defined when `this` is being dragged.

### `_drag_orig_index: number`

When the item is being dragged, its original index in the children of its parent.


`LibPanel._DropZone(source: Clutter.Actor)`
------------------------------------------

A ghost widget to show where the item that's being dragged will be placed. It's also used by the drag & drop system.

### `_height_constraint: Clutter.BindConstraint`
### `_width_constraint: Clutter.BindConstraint`

The contraints that forces `this` to have the same size as its source.

### `acceptDrop(source, _actor, _x, _y, _time)`

The method used by the drag & drop system to allow the widget to be dropped.

`LibPanel._PanelGrid(sourceActor: Clutter.Actor) extends ui.popupMenuPopupMenu`
-------------------------------------------------

A popup used to implement the panel grid. It will always over the whole height of the screen, and will automatically add columns to make sure the width of the screen is always filled.

### `transparent: bool`

Same as in `LibPanel._Semitransparent`.

### `_cleanup()`

Delete trailing empty columns.

### `_add_column(layout: string[] = []) -> Clutter.Actor`

Create and a add a new column to the grid. Returns the newly created column.

### `box: St.BoxLayout`

The widget that contains columns.

### `_panel_style_class: string`

The style class that's used to make panels that look like panels.

### `_get_column_height(column: Clutter.Actor) -> number`

Get the (approximate) height of a column. This method is really approximate because it don't take into account spacing between widgets and do the calculation using widget's natural size (not their allocated size).


`LibPanel._PanelColumn(layout: string[] = []) extends LibPanel._Semitransparent(St.BoxLayout)`
----------------------------------------------------------------------------------------------

### `_panel_layout: string[]`

The layout of this column. This is the list of the name of every panel that is in this column. Panels that are not present (e.g because the extension creating them isn't enabled) are still in this list. It's used to restore the position of the panels in the grid.
This attribute is automatically kept up-to-date.

### `_width_constraint: Clutter.BindConstraint`

This constraint is added to the column when it's empty. It makes the column the same width as the column left to it.

### `_add_panel(panel)`

Add a panel to this column. This method will place it accordingly to the layout of the column. If it's not in the layout, it will be added at the bottom. This method is only useful when you want your panel to be automatically placed, and thus the drag & drop system don't use it.


`LibPanel._importer: object`
-----------------------------

The object used to import libpanel's files. It also contains some useful properties.

### `path: string`

The path of the folder where libpanel is located.


`utils.js`
==========

This file contains utility functions.

`split(string: string, sep: string, maxsplit: number) -> string[]`
------------------------------------------------------------------

A function that behave like Python's `str.split`.


`rsplit(string: string, sep: string, maxsplit: number) -> string[]`
-------------------------------------------------------------------

A function that behave like Python's `str.rsplit`.


`array_remove(array: Array, item: object) -> bool`
--------------------------------------------------

Removes an item from an array and return `true` if it has been removed and `false` otherwise (e.g if it wan't present).


`array_insert(array: Array, index: number, ...items: object[])`
---------------------------------------------------------------

Insert items in an array at the specified index.


`get_stack() -> object[]`
-------------------------

Return a list of object representing a parsed call stack. Each item of the list look like this: `{ func: string, file: string, line: number, column: number }`. Items of this list goes from inner-most to outer-most context and doesn't include the scope of the function itself.


`get_extension_uuid() -> string`
--------------------------------

Get the uuid of the first extension found in the call stack. This is useful in libpanel because `ExtensionUtils.getCurrentExtension()` always returns the extension that loaded libpanel first.

`get_shell_version() -> { major: number, minor: number}`
--------------------------------------------------------

Get the version of gnome-shell.


`add_named_connections(patcher: patcher.Patcher, object)`
---------------------------------------------------------

This function will add methods on `object` for supporting named connections, which are a replacement for `connect`, `connect_after` and `disconnect`. Here are the added methods:

### `connect_named(source: GObject.Object, signal: string, callback: Function) -> number`

This is equivalent to `source.connect(signal, callback)`, except that the connection can later be removed with the new methods. It also returns and id that can be used with (and only with) `disconnect_named`.

### `connect_after_named(source: GObject.Object, signal: string, callback: Function)`

Just like `connect_named`, but with `connect_after`.

### `disconnect_named()`

Disconnect every signals added by this object.

### `disconnect_named(id: number)`

Disconnect the signal identified by `id`. No effect if there is no signal with this id.

### `disconnect_named(source: GObject.Object)`

Disconnect every signals connected by `this` on `source`. No effect if no signal have been connected to `source`.

### `disconnect_named(source: GObject.Object, signal: string)`

Disconnect every signals named `signal` connected by `this` on `source`. No effect if no signal named `signal` have been connected to `source`.

### `disconnect_named(source: GObject.Object, signal: string, callback: Function)`

Disconnect the signal named `signal` that calls `callback` connected by `this` on `source`. No effect if not present.


`get_settings(path: string) -> Gio.Settings`
--------------------------------------------

Create a settings object from the path to its schema.


`find_panel(widget: Clutter.Actor) -> LibPanel._GridItem`
---------------------------------------------------------

Recursively find the panel that this widget is a child of. If there are multiple panels in the widget tree (e.g a panel inside a panel group) then the top-most one is returned. Will return `undefined` if the widget isn't inside any panel.


`patcher.js`
============

This file contains only the patcher class.

`Patcher`
---------

A class to patch objects in different ways.
Every patching method will take an identifier (sometime it's optional) that must be unique per instance.

### `replace_method(object, new_method: UnboundFunction, patch_name: string = undefined)`

Replace (or add) a method on `object`. The name of the replaced method is the same as the one of `new_method`. The original (and already bounded) method will passed as the first argument to `new_method`.
You can't patch the same method on the same object two times on the same patcher, unless you explicitly pass a patch name. Do note, however, that it's not a good idea because the method could be unpatched in the wrong order, which will cause the original method to be definitely lost (unless you manually unpatch it in the reverse order that you patched it).

### `unpatch(name: string)`

Reverse the patch with the given name.

### `unpatch_all()`

Reverse all the patchs of this instance.

### `_check_name(name: string) -> bool`

Check whether `name` is an available patch name. If not it will print an error in the logs and return `false`, and it will return `true` otherwise.


`Patches`
=========

When enabled (and only when enabled) libpanel will patch a number of things. This is the list of them.

`DND._Draggable`
----------------

 - This class get a new attribute named `_disabled` which can be set to `true` to disable drag & drop for a widget.
 - This pull request is backported https://gitlab.gnome.org/GNOME/gnome-shell/-/merge_requests/2770


`GObject.Object`
----------------

`utils.add_named_connections` is called on this class.
