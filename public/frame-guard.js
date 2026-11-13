// A meta CSP cannot set frame-ancestors on GitHub Pages; refuse to run inside a frame.
if (window.top !== window.self) { document.documentElement.innerHTML = ''; window.top.location = window.self.location; }
