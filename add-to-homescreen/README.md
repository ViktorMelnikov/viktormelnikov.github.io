# Add to Homescreen call out

Script for mobile devices, it automatically shows an overlaying message encouraging to add the web app to the homescreen. Compatible with iOS 6+ and Chrome for Android (soon WinPhone).

## Installation

Add `addtohomescreen.css` and `addtohomescreen.js` to the head of your projects index file. Then, call `addToHomescreen();` as soon as possible. For example:

```html
<head>
<title>Add To Home</title>
...
<link rel="stylesheet" type="text/css" href="../../style/addtohomescreen.css">
<script src="../../src/addtohomescreen.js"></script>
<script>
addToHomescreen({
    //options
});
</script>
</head>
```

## Options

There are multiple properties used to determine if the prompt can be displayed. They are created so you can control when the prompt is diplayed, mostly based on number of page views (sessions) and time.

You can use the customCriteria property to set your own value. The library checks to see if this property is true (default) or false. If the value is true it will use the other rules accordingly.

You can set this property either to a boolean (true|false) or a custom function that will execute your own logic.

A good example for this is when determining if a user is authenticated first. Your custom method can check your authentication token for validity.

Note: you can define rules for each page in your site as they may change from page to page. For example you would not want to distract a customer from paying for an order or when they are creating an account.

* 	**mandatory**: you can't proceed if you don't add the app to the homescreen
* 	**autostart**: show the message automatically
* 	**skipFirstVisit**: show only to returning visitors (ie: skip the first time you visit)
* 	**minSessions**: show only after minimum number of page views
* 	**startDelay**: display the message after that many seconds from page load
* 	**lifespan**: life of the message in seconds
* 	**displayPace**: 1440, minutes before the message is shown again (0: display every time, default 24 hours)
*  	**displayNextPrime**: A fun 'algorithm' I added to trigger the prompt based on page views that are prime numbers
*  	**customCriteria**: A hook for you to provide either a custom method or a simple true|false value to control when it prompts

### Hooking into the Event Pipeline

You can hook into the event pipeline to trigger your own callback methods. This can be usefule when debugging issues with your logic or possibly triggering other activities in your user experience or possibly logging activity to your analytics service.

```javascript
var ath = addToHomescreen( {
    onShow: function () {
        console.log( "showing" );
    },
    onInit: function () {
        console.log( "initializing" );
    },
    onAdd: function () {
        console.log( "adding" );
    },
    onInstall: function () {
        console.log( "Installing" );
    },
    onCancel: function () {
        console.log( "Cancelling" );
    }
} );
```

### Customizing the Prompt

These are the properties you can set to define the CSS selectors and classes used to drive the prompt banner. 

The PrompDlg properties are used to define targets for resources to be set or injected by the library at runtime.

The action properties for ok and cancel correspond to the buttons on the prompt. This is the text you want used.

```javascript
athWrapper: ".ath-container",
athGuidance: "ath-guidance",
showClasses: [ "animated", "d-flex" ],
showClass: "d-flex",   
hideClass: "d-none",
promptDlg: {
   title: ".ath-banner-title",
   body: ".ath-banner",
   logo: ".ath-prompt-logo",
   cancel: ".btn-cancel",
   install: ".btn-install",
   action: {
      "ok": "Install",
      "cancel": "Not Now"
   }
```



For more, consult the [blog post](https://love2dev.com/pwa/add-to-homescreen-library/).

## License

Copyright (c) 2014 Matteo Spinelli, http://cubiq.org/
Copyright (c) 2019 Chris Love, http://love2dev.com/

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
