# Valid.js
Simple jQuery client side form validation.

Prevents a form from submitting until all input fields are valid.

---
## Install
[Download](https://github.com/georgelee1/Valid.js/release) the latest release of `Valid.js` and insert the CSS and JS into your page. `Valid.js` requires [jQuery](https://jquery.com/).

```html
    <head>
        <link rel="stylesheet" href="jquery.validjs.min.css" />
    </head>
    <body>
      <form class="validjs">
      ...
      </form>
      <script type="text/javascript" src="jquery.js"></script>
      <script type="text/javascript" src="jquery.validjs.min.js"></script>
    </body>
```

---
## Usage

That's it.

`Valid.js` will automatically look for `form`s with the class `validjs` and add functionality to that `form` to prevent it from submitting until all input fields within it are valid.

---
## Styling

You can include the CSS that comes with `Valid.js` this will add very simple styling to elements. To add you own styling the style class you want to target is `validjs-error`. When an element within the form is invalid, both that element and the form have the `validjs-error` class applied.

```html
   <form class="validjs validjs-error">
      <input type="text" pattern="[0-9]" value="test" class="validjs-error" />
      <input type="text" pattern="[0-9]" value="01" />
   </form>
```

---
## Additional
If you have a form whose subtree is dynamic then `Valid.js` will react accordingly to any DOM changes. However, this does require the user's browser to support `[MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)` which natively is supported in IE11+, Chrome 26+ and Firefox 14+. Support for older browsers may be possible with a polyfill.

If you are dynamically adding new `form` elements you will have to manually initialise.
```
   <script type="text/javascript">
      var myNewForm = $("<form></form>").addClass("validjs");
      myNewForm.appendTo(document.body);
      myNewForm.validJs();
   </script>
```
