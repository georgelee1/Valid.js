/**
 * Valid.js (1.0.0) - Simple jQuery client side form validation
 * https://github.com/georgelee1/Valid.js
 * 
 * @author George Lee (www.georgelee.me)
 * @license MIT
 */
;(function($) {

   /**
    * Polyfill.
    * The forEach() method executes a provided function once per array element.
    */
   if (!Array.prototype.forEach) {
      Array.prototype.forEach = function(callback, thisArg) {
         if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
         }
         var x = 0, len = this.length, next;
         for (; x < len; x++) {
            callback.call(thisArg, this[x], x, this);
         }
      }
   }
   
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
    * Input constructor.
    */
   var Input = function (element, options) {
      this._element = element;
      
      this._validation = {};
      for (var name in VALIDATORS) {
         this._validation[name] = this._element.attr(name)
         this._element.removeAttr(name);
      }
      
      this._element.on("keyup keypress keydown", $.proxy(this._update, this, true));
      this._element.on("focus blur paste change", $.proxy(this._update, this, false));
      
      this._update(false, {});
      this._element.on("validjs.change", function(event, context) {
         context._changed = true;
      })
   };

   /**
    * Update the current stored value from the HTML DOM.
    */
   Input.prototype._update = function(checkKeyCode, e) {
      // To spare us having to go and get the value from the DOM every time, there are some actions
      // that we know are not value updating key strokes. If we are one of them right now, then skip.
      if (checkKeyCode) {
         if (NON_UPDATING_KEY_CODES[e.which]) {
            return;
         }
      }
      
      var v = this._element.val(),
          prev = this._val,
          changed = (prev || "") !== v;
      
      this._val = v
      
      if (changed) {
         this._element.trigger("validjs.change", [this, v, prev]);
      }
   };
   
   /**
    * Validate the current value of the input, returns true if all is valid.
    */
   Input.prototype._validate = function() {
      if (this._validated && this._validated.val === this._val) {
         return this._validated.valid;
      }
      
      var valid = true;
      
      for (var name in this._validation) {
         var validator = VALIDATORS[name];
         if (typeof validator === "function") {
            if (validator.call(this._element.get(0), this._val, this._validation[name]) === false) {
               valid = false;
               break;
            }
         }
      }
      
      var previousValid = this._validated && this._validated.valid;
      this._validated = {
         val : this._val,
         valid : valid
      };
      
      if (previousValid !== this._validated.valid) {
         this._element.trigger("validjs.validated", [this, valid, this._val]);
      }
      
      return valid;
   };
   
   /**
    * Form constructor
    */
   var Form = function (element, options) {
      this._element = element;
      
      this._submitters = this._element.find("button,input[type=submit]").prop("disabled", true);
      this._valid = false;
      
      this._element.on("submit", $.proxy(this._submission, this));
      
      var inputs = [],
         form = this;
      
      this._element.find("input[type!=submit][type!=reset],select,textarea").each(function() {
         var input = $(this);
         inputs.push(new Input(input));
         input.on("validjs.change", $.proxy(form._validate, form));
         input.on("validjs.validated", form._validateChangeHandler);
      });
      this._inputs = inputs;
      
      this._element.on("validjs.validated", this._validateChangeHandler);
   };
   
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
    * Validates all input fields within the FORM are valid
    */
   Form.prototype._validate = function() { 
      var valid = true;
      
      this._inputs.forEach(function(ele) {
         if (!ele._validate()) {
            valid = false;
         }
      });
      
      var previousValid = this._valid;
      this._valid = valid;
      
      if (previousValid !== valid) {
         this._element.trigger("validjs.validated", [this, valid])
      }
      
      return valid;
   };
   
   
   /**
    * Internal listener for when an element or the form changes it's validation state.
    */
   Form.prototype._validateChangeHandler = function(event, context, valid, val) {
      var e = $(context._element);
      
      if (context._changed) {
         e[valid ? "removeClass" : "addClass"]("error");
      }
      
      if (context._submitters) {
         context._submitters.prop("disabled", !valid);
      }
   };
   
   /**
    * Find any input in the document that has an validator attribute and fire up the Form validation for
    * it's closest FORM.
    */
   var findBy = "";
   for (name in VALIDATORS) {
      if (findBy.length > 0) {
         findBy += ","
      }
      
      findBy += "input[";
      findBy += name;
      findBy += "],textarea[";
      findBy += name;
      findBy += "],select[";
      findBy += name;
      findBy += "]";
   }
   
   $(document).find(findBy).each(function() {
      var ele = $(this).closest("form");
      var form = ele.data("jquery.validjs");
      if (!form) {
         form = new Form(ele);
         ele.data("jquery.validjs", form);
      }
   });

})(jQuery);