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
        <script type="text/javascript" src="jquery.js"></script>
        <script type="text/javascript" src="jquery.validjs.min.js"></script>
    </body>
```

---
## Usage

That's it.

`Valid.js` will automatically look for `input`, `textarea` and `select` elements that have the `required` or `pattern` attributes and add functionality to the containing `form` to prevent it from submitting until input fields within it are valid.

---
## Styling

You can include the CSS that comes with `Valid.js` this will add very simple styling to elements. To add you own styling the style class you want to target is `error`. When an element within the form is invalid, both that element and the form have the `error` class applied.

```html
   <form class="error">
      <input type="text" pattern="[0-9]" value="test" class="error" />
      <input type="text" pattern="[0-9]" value="01" />
   </form>
```
