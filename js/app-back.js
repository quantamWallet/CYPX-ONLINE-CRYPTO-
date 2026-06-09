document.addEventListener("deviceready", () => {

  if (window.Capacitor?.Plugins?.App) {

    window.Capacitor.Plugins.App.addListener("backButton", () => {

      if (window.history.length > 1) {
        window.history.back();
      }

    });

  }

});
