document.addEventListener("DOMContentLoaded", () => {

  history.pushState(null, null, location.href);

  window.addEventListener("popstate", () => {

    if (document.referrer &&
        document.referrer.startsWith(location.origin)) {

      history.back();

    } else {

      history.pushState(null, null, location.href);

    }

  });

});
