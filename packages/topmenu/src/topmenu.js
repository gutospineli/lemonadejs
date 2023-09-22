if (!lemonade && typeof (require) === 'function') {
    var lemonade = require('lemonadejs');
}

if (!Modal && typeof (require) === 'function') {
    var Modal = require('@lemonadejs/modal');
}

; (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.Topmenu = factory();
}(this, (function () {

    const Item = function() {
        if (this.type === 'line') {
            return `<hr />`;
        } else {
            return `<div data-icon="{{self.icon}}" data-submenu="{{!!self.submenu}}" onmouseover="self.parent.parent.open(e, self)">
                <a>{{self.title}}</a> <span>{{self.shortcut}}</span>
            </div>`;
        }
    }

    // Level
    let index = 0;

    const Create = function() {
        let self = this;

        self.open = function(e, s) {
            if (s.submenu) {
                let item = self.parent.modals[self.index+1];
                if (! item) {
                    item = self.parent.create();
                }
                let parent = self.parent.modals[self.index].modal;
                let modal = item.modal;
                modal.closed = false;
                if (modal.options !== s.submenu) {
                    modal.top = parent.top + e.target.offsetTop;
                    modal.left = parent.left + 250;
                    modal.options = s.submenu;
                    // Close modals with higher level
                    self.parent.close(self.index+1);
                }
            } else {
                // Close modals with higher level
                self.parent.close(self.index+1);
            }
        }

        let template = `<Modal :closed="true" :ref="self.modal">
            <div class="lm-topmenu-menu">
                <Item :loop="self.options" />
            </div>
        </Modal>`;

        return lemonade.element(template, self, { Item: Item });
    }

    const Topmenu = function() {
        let self = this;

        // Container for all modals
        self.modals = [];

        self.create = function() {
            // Create a new self for each modal
            let s = {
                index: index++,
                parent: self,
            };
            // Render the modal inside the main container
            lemonade.render(Create, self.el.children[1], s);
            // Add the reference of the modal in a container
            self.modals.push(s);
            // Return self
            return s;
        }

        self.open = function(e, s) {
            let modal = self.modals[0].modal;

            // Click on the top level menu toggle the state of the menu
            if (e.type === 'click') {
                modal.closed = !modal.closed;
            }

            // If the modal is open and the content is different from what is shown
            if (modal.closed === false && modal.options !== s.submenu) {
                // Define new position
                modal.top = e.target.offsetTop + e.target.offsetHeight;
                modal.left = e.target.offsetLeft;
                // Refresh content
                modal.options = s.submenu;
                // Close modals with higher level
                self.close(1);
            }
        }

        self.close = function(level) {
            self.modals.forEach(function(value, k) {
                if (k >= level) {
                    value.modal.closed = true;
                }
            })
        }

        self.onload = function() {
            self.el.addEventListener("focusout", (e) => {
                self.close(0);
            });
        }

        return `<div class="lm-topmenu" tabindex="0">
            <div class="lm-topmenu-options" :loop="self.options">
                <div class="lm-topmenu-title" onmouseover="self.parent.open(e, self)" onclick="self.parent.open(e, self)">{{self.title}}</div>
            </div>
            <div :ready="self.create()"></div>
        </div>`
    }

    lemonade.setComponents({ Topmenu: Topmenu });

    return function (root, options) {
        if (typeof (root) === 'object') {
            lemonade.render(Topmenu, root, options)
            return options;
        } else {
            return Topmenu.call(this, root)
        }
    }
})));