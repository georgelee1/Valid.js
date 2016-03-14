/**
 * Valid.js (1.0.0) - Simple jQuery client side form validation
 * https://github.com/georgelee1/Valid.js
 * 
 * @author George Lee (www.georgelee.me)
 * @license MIT
 */
;(function($) {
   
   /*
    * Map of validator functions to validate the value of the each input, called with 'this' set as the element instance. The current value
    * of the input and the value of the attribute/data field.
    * @const
    */
   var VALIDATORS = {
      "required" : function(val, data) {
         return data === "false" || !!val;
      },
      "pattern" : function(val, data) {
         return new RegExp(data).test(val || "");
      }
   }
   
   var NON_UPDATING_KEY_CODES = {
      9 : true, // tab
      13 : true, // enter
      16 : true, // shift
      17 : true, // ctrl
      18 : true, // alt
      19 : true, // pause/break
      20 : true, // caps
      27 : true, // escape
      33 : true, // page up
      34 : true, // page down
      35 : true, // end
      36 : true, // home
      37 : true, // left arrow
      38 : true, // up arrow
      39 : true, // right arrow
      40 : true, // down arrow
      112 : true, // f1
      113 : true, // f2
      114 : true, // f3
      115 : true, // f4
      116 : true, // f5
      117 : true, // f6
      118 : true, // f7
      119 : true, // f8
      120 : true, // f9
      121 : true, // f10
      122 : true, // f11
      123 : true, // f12
      144 : true, // num lock
      145 : true // scroll lock
   };
   
   /**
    * Form constructor
    */
   var Form = function (element, options) {
      this._element = element;
      
      this._submitters = this._element.find("button,input[type=submit]").prop("disabled", true);
      this._valid = false;
      
      this._element.on("submit", $.proxy(this._submission, this));
      this._element.on("keyup", $.proxy(this._trigger, this, true));
      this._element.on("focus", "input,textarea,select", $.proxy(this._touch, this));
      this._element.on("focus blur paste change", $.proxy(this._trigger, this, false));
      this._element.on("click", "input[type=reset]", $.proxy(function() {
         setTimeout($.proxy(this._reset, this), 1);
      }, this));
      
      if (window["MutationObserver"]) {
         var observer = new MutationObserver($.proxy(this._validate, this));
         observer.observe(element.get(0), {
            attributes: false,
            characterData: false,
            childList: true,
            subtree: true
         });
      }
      
      this._element.on("DOMSubtreeModified", function(e) {
         console.info(e);
      })
   };
   
   /**
    * Update the current input to mark it as touched by the user
    */
   Form.prototype._touch = function(event) {
      var ele = $(event.target),
          validjs = this._get_validjs(ele);
      
      if (!validjs.touched) {
         ele.addClass("validjs-touched");
         validjs.touched = true;
      }
   }
   
   /**
    * Reset the form ready to start validating again
    */
   Form.prototype._reset = function() {
      this._validate();
      this._element.find("input[type!=submit][type!=reset],select,textarea")
         .removeClass("validjs-error validjs-touched")
         .each(function() {
            var validjs = $(this).data("validjs");
            if (validjs) {
               validjs.val = $(this).val();
               validjs.cls = {};
               validjs.touched = false;
               validjs.valid = undefined;
               validjs.valided = false;
            }
         });
      this._element.removeClass("validjs-error");
   }
   
   /**
    * Fired on an event that can update the value of a input field
    */
   Form.prototype._trigger = function(filterUpdating, event) {
      if (!filterUpdating || !NON_UPDATING_KEY_CODES[event.which]) {
         var target = $(event.target);
         if (!target.is("input[type!=submit][type!=reset],select,textarea")) {
            target = target.closest("input[type!=submit][type!=reset],select,textarea");
         }
         if (target.length) {
            var validjs = this._get_validjs(target, true),
                val = target.val();
            
            if (validjs.val !== val) {
               validjs.val = val;
               validjs.validated = false;
               this._validate();
            }
         }
      }
   }
   
   /**
    * Handles the submission of the FORM. Validates the input fields, if not prevents the form from
    * submitting.
    */
   Form.prototype._submission = function(e) {
      if (!this._validate()) {
         e.preventDefault();
         return;
      }
   };
   
   /**
    * Get the cached Valid.js validation data for the passed element
    */
   Form.prototype._get_validjs = function(ele, ommitVal) {
      var validjs = ele.data("validjs");
      if (!validjs) {
         validjs = {
            val: !ommitVal ? ele.val() : "",
            cls: {},
            touched: false,
            valid: undefined,
            validated: false,
            validation: {}
         }
         for (var name in VALIDATORS) {
            var val = ele.attr(name);
            if (typeof val !== "undefined") {
               validjs.validation[name] = val
               ele.removeAttr(name);
            } else {
               val = ele.data(name);
               if (typeof val !== "undefined") {
                  validjs.validation[name] = val
                  ele.removeData(name);
               }
            }
         }
         ele.data("validjs", validjs);
      }
      return validjs;
   }
   
   /**
    * Validates all input fields within the FORM are valid
    */
   Form.prototype._validate = function() { 
      var valid = true,
          self = this;
      
      this._element.find("input[type!=submit][type!=reset]:not(:disabled),select:not(:disabled),textarea:not(:disabled)").each(function() {
         var ele = $(this),
             validjs = self._get_validjs(ele);
         
         if (!validjs.validated) {
            var eleValid = true;
            for (var name in validjs.validation) {
               var validator = VALIDATORS[name];
               if (typeof validator === "function") {
                  if (validator.call(this, validjs.val, validjs.validation[name]) === false) {
                     eleValid = false;
                     break;
                  }
               }
            }
            validjs.validated = true;
            validjs.valid = eleValid;
            
            if (validjs.valid && validjs.cls.error) {
               ele.removeClass("validjs-error");
               validjs.cls.error = false;
            } else if (!validjs.valid && !validjs.cls.error && validjs.touched) {
               ele.addClass("validjs-error");
               validjs.cls.error = true;
            }
         }
         
         if (!validjs.valid) {
            valid = false;
         }
      });
      
      var previousValid = this._valid;
      this._valid = valid;
      
      if (previousValid !== valid) {
         this._element[valid ? "removeClass" : "addClass"]("validjs-error");
         this._submitters.prop("disabled", !valid);
         this._element.trigger("validjs.validated", [this._element.get(0), valid]);
      }
      
      return valid;
   };
   
   $.fn.validJs = function() {
      return this.each(function() {
         var ele = $(this);
         var form = ele.data("jquery.validjs");
         if (!form) {
            form = new Form(ele);
            ele.data("jquery.validjs", form);
         }
      });
   }
   
   $(document).find("form.validjs").validJs();
})(jQuery);