chrome.app.runtime.onLaunched.addListener(function() {

  chrome.app.window.create('html/index.html', {
    'width': 1200,
    'height': 800,
    'minWidth' : 600,
    'minHeight' : 400,
    'frame' : 'chrome'
  });
});

