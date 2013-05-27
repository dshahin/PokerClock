chrome.app.runtime.onLaunched.addListener(function() {

  chrome.app.window.create('html/index.html', {
    'width': 1000,
    'height': 400,
    'frame' : 'chrome'
  });
});

