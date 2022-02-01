window.__MathJax_State__ = {
    isReady: false,
    promise: new Promise(resolve => {

      window.MathJax = {
        // MathJax can be configured as desired in addition to these options.
        startup: {
          // Don't perform an initial typeset of the page when MathJax loads.
          // Our React components will trigger typsetting as needed.
          typeset: false,
          ready: () => {
            // Do whatever MathJax would normally do at this point.
            MathJax.startup.defaultReady();
            // Set the flag and resolve the promise.
            window.__MathJax_State__.isReady = true;
            resolve();
          }
        }
      };

    })
  };
