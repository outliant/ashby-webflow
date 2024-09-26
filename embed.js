if (!window.__ashbyBaseJobBoardUrl) {
  window.__ashbyBaseJobBoardUrl = "https://jobs.ashbyhq.com/outliant";
}
("use strict");
!(function () {
  try {
    var e =
        "undefined" != typeof window
          ? window
          : "undefined" != typeof global
          ? global
          : "undefined" != typeof self
          ? self
          : {},
      n = new Error().stack;
    n &&
      ((e._sentryDebugIds = e._sentryDebugIds || {}),
      (e._sentryDebugIds[n] = "8e7841b4-98b3-5cdb-92e2-b8bd1d276317"));
  } catch (e) {}
})();
// No imports should be used in this script.
var _a;
var AshbyFilterParamName;
(function (AshbyFilterParamName) {
  AshbyFilterParamName["Department"] = "ashby_department_id";
  AshbyFilterParamName["Location"] = "ashby_location_id";
  AshbyFilterParamName["EmploymentType"] = "ashby_employment_type";
})(AshbyFilterParamName || (AshbyFilterParamName = {}));
var __Ashby = {
  // These are the default settings that Ashby defines in case the user does not set a value.
  // This is a complete list of settings.
  defaultSettings: {
    // If true, the iframe will be inserted with no intervention
    // Should be turned off for single page apps (SPAs)
    autoLoad: true,
    // If true, the page will scroll to the iframe when specific events happen
    autoScroll: true,
    // One of:
    // "full-job-board" - render the full job board, with list and options
    // "application-form-only" - render only the application form, without any description, or other elements.
    displayMode: "full-job-board",
    // If provided, a custom css file can be injected into the iframe.
    customCssUrl: undefined,
    // The base job board url.
    ashbyBaseJobBoardUrl: undefined,
    // Only needed if rendering a specific application.
    // Can be overwritten if the jid parameter is set in the url.
    jobPostingId: undefined,
    // Only respected if displayMode = "full-job-board"
    // Will show a specific page.
    pageToShow: undefined,
    // If defined, will source a candidate to the provided Ashby source.
    utmSource: undefined,
    // If true, the embed will be rendered without extra navigational and design elements
    noChrome: false,
    // If true, the embed script will log extra information about your configuration to the console.
    // This can help debug issues.
    verboseLogging: false,
    // This function will be called whenever a new posting or job board is loaded.
    // Note: this can be triggered multiple times if .load is called directly to change job postings.
    onEmbedLoaded: function (settings) {
      // By default, do nothing. This can be overridden by a custom provided function.
    },
  },
  // This will be initially populated with the user's settings. To set these, a script should be run prior to this one
  // with content like:
  // window._Ashby = { settings: { ashbyBaseJobBardUrl: "myURL" } };
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Please fix this if you're altering this file.
  settings:
    ((_a = window.__Ashby) === null || _a === void 0 ? void 0 : _a.settings) ||
    {},
  constants: {
    // The id of the iframe element
    IFRAME_ELEMENT_ID: "ashby_embed_iframe",
    // The id of the iframe container, placed on the page by the customer
    // The iframe will be placed inside this container
    IFRAME_CONTAINER_ID: "ashby_embed",
    JOB_POSTING_ID_PARAM_NAME: "ashby_jid",
  },
  autoLoadIframeTimerID: null,
  buildIFrameUrl: function (settings, filters) {
    window.__Ashby.throwIfNotInitialized();
    // Get the base job board url, from some set parameters.
    var baseJobBoardUrl = settings.ashbyBaseJobBoardUrl;
    if (!baseJobBoardUrl) {
      throw new Error("Could not find base job board url");
    }
    switch (settings.displayMode) {
      case "application-form-only":
        if (settings.jobPostingId) {
          baseJobBoardUrl = ""
            .concat(baseJobBoardUrl, "/")
            .concat(encodeURIComponent(settings.jobPostingId), "/application");
        } else {
          throw new Error(
            'Must provide jobPostingId to use "application-form-only" display mode.'
          );
        }
        break;
      case "full-job-board":
        if (settings.jobPostingId) {
          baseJobBoardUrl = ""
            .concat(baseJobBoardUrl, "/")
            .concat(encodeURIComponent(settings.jobPostingId))
            .concat(
              settings.pageToShow === "application" ? "/application" : ""
            );
        }
        break;
      default:
        throw new Error(
          "Unsupported display mode: ".concat(
            settings.displayMode,
            ". Supported modes: ['application-form-only', 'full-job-board']"
          )
        );
    }
    // Build the url for the embed
    var urlForIframe = new URL(baseJobBoardUrl);
    // If a source has been set, put it in the url.
    if (settings.utmSource) {
      urlForIframe.searchParams.set(
        "utm_source",
        encodeURIComponent(settings.utmSource)
      );
    }
    // This will always be set
    urlForIframe.searchParams.set("embed", "js");
    // Only set the display mode if it's not the default
    if (settings.displayMode !== "full-job-board") {
      urlForIframe.searchParams.set("displayMode", settings.displayMode);
    }
    if (settings.customCssUrl) {
      urlForIframe.searchParams.set("customCssUrl", settings.customCssUrl);
    }
    // Set to hide chrome elements like back button, headers, and sidebar
    if (settings.noChrome) {
      urlForIframe.searchParams.set("noChrome", "true");
    }
    // Pass any filter parameters to the iframe
    for (var _i = 0, _a = Object.entries(filters); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        value = _b[1];
      if (value) {
        urlForIframe.searchParams.set(key, value);
      }
    }
    return urlForIframe.href;
  },
  log: function (_a) {
    var message = _a.message,
      _b = _a.isError,
      isError = _b === void 0 ? false : _b;
    if (isError) {
      console.error("[Ashby Embed Script] ".concat(message));
    } else if (window.__Ashby.settings.verboseLogging === true) {
      console.log("[Ashby Embed Script] ".concat(message));
    }
  },
  // Will be set to true as soon as the initialization function is called (which should happen automatically)
  isInitialized: false,
  throwIfNotInitialized: function () {
    if (window.__Ashby.isInitialized === false) {
      throw new Error(
        "The __Ashby window object has not been initialized. This is a fatal error, please reach out to Ashby support if you need help debugging."
      );
    }
  },
  // Initialize the __Ashby window object.
  // Read in settings that are defined by the user, as well as default settings.
  initialize: function () {
    if (window.__Ashby.isInitialized) {
      return;
    }
    var settingsFromUrlParameters =
      window.__Ashby.getSettingsFromSearchParams();
    // Apply any user-defined settings on top of the defaults set.
    window.__Ashby.settings = Object.assign(
      // This empty value will prevent their from being extra assignment of the target.
      {},
      window.__Ashby.defaultSettings,
      settingsFromUrlParameters,
      // At time of initialization, any setting here has been set by the user, and should override default settings.
      window.__Ashby.settings,
      // This parameter is only for backwards compatibility. All other and new settings should be defined by the user
      // on the window.__Ashby.settings object.
      // This is kept to make the full job board embedding as simple as possible (and backwards compatible).
      window.__ashbyBaseJobBoardUrl
        ? {
            ashbyBaseJobBoardUrl: window.__ashbyBaseJobBoardUrl,
          }
        : {}
    );
    window.__Ashby.isInitialized = true;
    window.__Ashby.log({
      message:
        "After applying defaults, script loaded with initial configuration ".concat(
          JSON.stringify(window.__Ashby.settings),
          ". Note, this does not include parameters set on the embed container. These will be applied just before loading the script."
        ),
    });
    if (window.__Ashby.settings.autoLoad === true) {
      // If auto-load = true and the iframe does not exist, load it.
      if (!window.__Ashby.iFrame().doesExist()) {
        window.__Ashby.iFrame().load();
        // Set a timer to try loading it again every 100 ms, unless we suddenly find it.
        window.__Ashby.autoLoadIframeTimerID = window.setInterval(function () {
          if (!window.__Ashby.iFrame().doesExist()) {
            window.__Ashby.iFrame().load();
          } else {
            if (window.__Ashby.autoLoadIframeTimerID != null) {
              window.clearInterval(window.__Ashby.autoLoadIframeTimerID);
            }
          }
        }, 100);
      }
    }
    return;
  },
  setJidInURL: function (jid) {
    var currentUrl = new URL(window.location.href);
    if (jid) {
      currentUrl.searchParams.set(
        window.__Ashby.constants.JOB_POSTING_ID_PARAM_NAME,
        jid
      );
    } else {
      currentUrl.searchParams.delete(
        window.__Ashby.constants.JOB_POSTING_ID_PARAM_NAME
      );
    }
    window.history.replaceState(null, "", currentUrl.href);
    return;
  },
  setFiltersInURL: function (filters) {
    var currentUrl = new URL(window.location.href);
    function updateCurrentUrl(params, internalParam, externalParam) {
      var value = params[internalParam];
      if (value) {
        currentUrl.searchParams.set(externalParam, value);
      } else {
        currentUrl.searchParams.delete(externalParam);
      }
    }
    try {
      var params = JSON.parse(filters);
      updateCurrentUrl(params, "departmentId", AshbyFilterParamName.Department);
      updateCurrentUrl(params, "locationId", AshbyFilterParamName.Location);
      updateCurrentUrl(
        params,
        "employmentType",
        AshbyFilterParamName.EmploymentType
      );
      window.history.replaceState(null, "", currentUrl.href);
    } catch (e) {
      window.__Ashby.log({
        message: 'Unable to parse filters: "'.concat(filters, '".'),
        isError: true,
      });
    }
    return;
  },
  // Get settings which can be defined on the window
  getSettingsFromSearchParams: function () {
    var urlParams = new URLSearchParams(window.location.search);
    var settings = {};
    if (urlParams.get(window.__Ashby.constants.JOB_POSTING_ID_PARAM_NAME)) {
      settings.jobPostingId = urlParams.get(
        window.__Ashby.constants.JOB_POSTING_ID_PARAM_NAME
      );
    }
    if (urlParams.get("utm_source")) {
      settings.utmSource = urlParams.get("utm_source");
    }
    return settings;
  },
  getFiltersFromSearchParams: function () {
    var urlParams = new URLSearchParams(window.location.search);
    var params = {};
    function updateParam(internalParam, externalParam) {
      if (urlParams.get(externalParam)) {
        params[internalParam] = urlParams.get(externalParam);
      }
    }
    updateParam("departmentId", AshbyFilterParamName.Department);
    updateParam("locationId", AshbyFilterParamName.Location);
    updateParam("employmentType", AshbyFilterParamName.EmploymentType);
    return params;
  },
  registeredMessageHandler: null,
  handleIncomingMessage: function (e) {
    var _a, _b, _c;
    var iframe = window.__Ashby.iFrame().getIframeElement();
    var container = window.__Ashby.iFrame().getContainerElement();
    window.__Ashby.log({
      message: "Handling incoming message event: "
        .concat(JSON.stringify(e), ". Data: ")
        .concat(JSON.stringify(e.data)),
    });
    if (container && iframe && e.data) {
      var data = e.data;
      if (
        data === "apply_for_job_tapped" ||
        data === "job_tapped" ||
        data === "application_submitted" ||
        data === "application_errored"
      ) {
        if (window.__Ashby.settings.autoScroll) {
          container.scrollIntoView(true);
        }
      }
      if (typeof data === "number") {
        // A resize event. Sometimes the height we receive from the resize observer
        // is lower than the actual iframe height. Having an extra height ensures
        // we're not cutting the content and rendering the whole iframe.
        var extraHeight = 32;
        var height = data + extraHeight;
        // To avoid layout shift as the iframe shows a small loading state, enforce
        // a minimum size we will resize to. Both a full job board and posting are
        // bigger than this.
        var minimumHeight = 150;
        if (height > minimumHeight) {
          iframe.setAttribute("height", height.toString());
        }
      }
      if (data === "reset_jid") {
        window.__Ashby.setJidInURL(null);
        (_a = iframe.contentWindow) === null || _a === void 0
          ? void 0
          : _a.postMessage("ack_reset_jid", "*");
      } else if (typeof data === "string" && data.startsWith("set_jid=")) {
        if (!container.getAttribute("data-jid")) {
          // don't set jid, if it's being set via the data- attribute
          var jobId = data.slice(8);
          window.__Ashby.setJidInURL(jobId);
          (_b = iframe.contentWindow) === null || _b === void 0
            ? void 0
            : _b.postMessage("ack_set_jid=".concat(jobId), "*");
        }
        if (window.__Ashby.settings.autoScroll) {
          container.scrollIntoView(true);
        }
      } else if (typeof data === "string" && data.startsWith("set_filters=")) {
        var filters = data.split("=")[1];
        window.__Ashby.setFiltersInURL(filters);
        (_c = iframe.contentWindow) === null || _c === void 0
          ? void 0
          : _c.postMessage("ack_set_filters=".concat(filters), "*");
      }
    }
  },
  iFrame: function () {
    return {
      getIframeElement: function () {
        return document.getElementById(
          window.__Ashby.constants.IFRAME_ELEMENT_ID
        );
      },
      getContainerElement: function () {
        return document.getElementById(
          window.__Ashby.constants.IFRAME_CONTAINER_ID
        );
      },
      getSettingsFromContainer: function () {
        var container = window.__Ashby.iFrame().getContainerElement();
        var settings = {};
        if (container == null) {
          return settings;
        }
        if (container.getAttribute("data-jid")) {
          settings.jobPostingId = container.getAttribute("data-jid");
        }
        if (container.getAttribute("data-tab")) {
          settings.pageToShow =
            container.getAttribute("data-tab") === "application"
              ? "application"
              : "job-board";
        }
        if (container.getAttribute("data-noChrome")) {
          settings.noChrome =
            container.getAttribute("data-noChrome") === "true";
        }
        return settings;
      },
      doesExist: function () {
        var container = window.__Ashby.iFrame().getContainerElement();
        var iframe = window.__Ashby.iFrame().getIframeElement();
        return container != null && iframe != null;
      },
      load: function (settingsOverrides) {
        window.__Ashby.throwIfNotInitialized();
        var container = window.__Ashby.iFrame().getContainerElement();
        if (container == null) {
          console.error(
            new Error(
              "[Ashby] Could not find container for iframe. Container ID = ".concat(
                window.__Ashby.constants.IFRAME_CONTAINER_ID
              )
            )
          );
          return;
        }
        // At time of loading, read in any extra settings that may have been set via url parameters or on the container.
        var urlParameterSettings = window.__Ashby.getSettingsFromSearchParams();
        var filterParams = window.__Ashby.getFiltersFromSearchParams();
        var containerSettings = window.__Ashby
          .iFrame()
          .getSettingsFromContainer();
        var settings = Object.assign(
          window.__Ashby.settings,
          urlParameterSettings,
          containerSettings,
          settingsOverrides
        );
        window.__Ashby.log({
          message: "Loading embed with settings ".concat(
            JSON.stringify(settings),
            ". This will be used to build all options."
          ),
        });
        container.innerHTML = "";
        var iframe = document.createElement("iframe");
        iframe.setAttribute("id", window.__Ashby.constants.IFRAME_ELEMENT_ID);
        iframe.setAttribute(
          "src",
          window.__Ashby.buildIFrameUrl(settings, filterParams)
        );
        iframe.setAttribute("title", "Ashby Job Board");
        iframe.setAttribute("width", "100%");
        iframe.setAttribute("height", "1000");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("scrolling", "no");
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Please fix this if you're altering this file.
        if (window.ResizeObserver == null || window.addEventListener == null) {
          iframe.setAttribute("scrolling", "auto");
        }
        container.appendChild(iframe);
        // Add message listener so that messages can be sent to the iframe
        var previouslyRegisteredPostMessageHandler =
          window.__Ashby.registeredMessageHandler;
        if (previouslyRegisteredPostMessageHandler) {
          window.removeEventListener(
            "message",
            previouslyRegisteredPostMessageHandler
          );
        }
        window.addEventListener(
          "message",
          window.__Ashby.handleIncomingMessage
        );
        window.__Ashby.registeredMessageHandler =
          window.__Ashby.handleIncomingMessage;
        // Call user-defined function that new embed has been loaded. Provide the settings with which it has been loaded.
        window.__Ashby.settings.onEmbedLoaded(settings);
      },
    };
  },
};
window.__Ashby = __Ashby;
// The main listener. Either initialize, or register a callback for when the page is loaded.
(function () {
  if (document.readyState === "complete") {
    window.__Ashby.initialize();
  } else {
    addEventListener("DOMContentLoaded", window.__Ashby.initialize);
    addEventListener("load", window.__Ashby.initialize);
  }
})();
//# debugId=8e7841b4-98b3-5cdb-92e2-b8bd1d276317
//# sourceMappingURL=job_board_embed_script_v2.js.map
