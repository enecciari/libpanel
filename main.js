// TODO: add github documentation link here

const VERSION = 1;

if (global._libpanel) {
	var LibPanel = global._libpanel;

	if (LibPanel.VERSION != VERSION) {
		const Self = imports.misc.extensionUtils.getCurrentExtension();
		console.warn(`${Self.uuid} depends on libpanel ${VERSION} but libpanel ${LibPanel.VERSION} is loaded`);
	}
} else {
	const { GObject } = imports.gi;

	const AutoHidable = GObject.registerClass({
		Requires: [GObject.Object],
	}, class LibPanel_AutoHidable extends GObject.Interface {
		setup_autohide(container) {
			container = container || this;
			this._lpah_container = container;

			this._update_visibility();
			container._lpah_ca_handler_id = container.connect_after('actor-added', (container, children) => {
				children._lpah_vis_handler_callback = children.connect_after('notify::visible', this._update_visibility.bind(this));
				this._update_visibility();
			});
			container._lpah_cr_handler_id = container.connect_after('actor-removed', (container, children) => {
				if (children._lpah_vis_handler_callback) children.disconnect(children._lpah_vis_handler_callback);
				this._update_visibility();
			});
		}

		_get_ah_children() {
			return this._lpah_container.get_children();
		}

		_update_visibility() {
			for (const child of this._get_ah_children()) {
				if (child.visible) {
					this.show();
					return;
				}
			}

			this.hide();
			// Force the widget to take no space when hidden (this fixes some bugs but I don't know why)
			this.queue_relayout();
		}
	});

	const Semitransparent = superclass => {
		// We need to cache the created classes or else we would register the same class name multiple times
		if (Semitransparent.cache === undefined) Semitransparent.cache = {};
		if (Semitransparent.cache[superclass.name] !== undefined) return Semitransparent.cache[superclass.name];

		const klass = GObject.registerClass({
			GTypeName: `LibPanel_Semitransparent_${superclass.name}`,
			Properties: {
				'transparent': GObject.ParamSpec.boolean(
					'transparent',
					'Transparent',
					'Whether this widget is transparent to pointer events',
					GObject.ParamFlags.READWRITE,
					true
				),
			},
		}, class extends superclass {
			get transparent() {
				if (this._transparent === undefined)
					this._transparent = true;
	
				return this._transparent;
			}
	
			set transparent(value) {
				this._transparent = value;
				this.notify('transparent');
			}
	
			vfunc_pick(context) {
				if (!this.transparent) {
					super.vfunc_pick(context);
				}
				for (const child of this.get_children()) {
					child.pick(context);
				}
			}
		});
		Semitransparent.cache[superclass.name] = klass;
		return klass;
	};

	// ===================================================== Test zone ======================================================
	const { St, Clutter } = imports.gi;
	const DND = imports.ui.dnd;

	var Test = GObject.registerClass({
		Implements: [AutoHidable],
	}, class Test extends Semitransparent(St.Widget) {
		constructor() {
			super({ style: "padding: 15px", layout_manager: new Clutter.BinLayout(), reactive: true, });
			this._delegate = this;
			this.setup_autohide();
			this._draggable = DND.makeDraggable(this);
			this._show_callback_id = this.connect("stage-views-changed", () => {
				const css = this.get_theme_node();
			});
		}

		hide() {
			log("hidden")
			super.hide()
		}
	});
	var Test2 = GObject.registerClass({
		Implements: [AutoHidable],
	}, class Test2 extends Semitransparent(St.Widget) {
		constructor() {
			super({ style: "padding: 15px", layout_manager: new Clutter.BinLayout(), reactive: true, });
			this._delegate = this;
			this.setup_autohide();
			this._draggable = DND.makeDraggable(this);
			this._show_callback_id = this.connect("stage-views-changed", () => {
				const css = this.get_theme_node();
			});
		}

		hide() {
			log("hidden")
			super.hide()
		}
	});
	// ======================================================================================================================

	class LibPanel_Class {
		VERSION = VERSION;

		_AutoHidable = AutoHidable;
		_Semitransparent = Semitransparent;
	}

	var LibPanel = new LibPanel_Class();
	global._libpanel = LibPanel;
}
