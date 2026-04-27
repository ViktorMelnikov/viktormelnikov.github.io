(function attachConsoleProbeTests(global) {
  "use strict";

  const DEFAULT_WAIT_MS = 50;

  const ERROR_CONSOLE_CALLS = [
    { method: "count", args: ["string", "error"] },
    { method: "countReset", args: ["string", "error"] },
    { method: "debug", args: ["string", "string", "error"] },
    { method: "dir", args: ["string", "error"] },
    { method: "dirxml", args: ["string", "string", "error"] },
    { method: "error", args: ["string", "string", "error"] },
    { method: "info", args: ["string", "string", "error"] },
    { method: "log", args: ["string", "string", "error"] },
    { method: "table", args: ["string", "string", "error"] },
    { method: "trace", args: ["string", "string", "error"] },
    { method: "warn", args: ["string", "string", "error"] }
  ];

  const STATIC_TESTS = [
    {
      id: "01-regexp-log-toString-value",
      group: "1",
      title: "console.log(RegExp) with own value toString",
      method: "log",
      signature: "console.log(regexp)",
      expectedSignals: ["toString-call"]
    },
    {
      id: "02-function-log-toString-and-call",
      group: "2",
      title: "console.log(Function) with own value toString and callable body",
      method: "log",
      signature: "console.log(fn)",
      expectedSignals: ["toString-call", "function-call"]
    },
    {
      id: "03-anchor-log-id-getter",
      group: "3",
      title: "console.log(HTMLAnchorElement) with id getter",
      method: "log",
      signature: "console.log(anchor)",
      expectedSignals: ["id-get"]
    }
  ];

  function now() {
    return global.performance && typeof global.performance.now === "function"
      ? global.performance.now()
      : Date.now();
  }

  function makeToken() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function summarize(hits) {
    return hits.reduce((acc, hit) => {
      const key = hit.test + ":" + hit.signal;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function countBy(values) {
    return values.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function unique(values) {
    return [...new Set(values)];
  }

  function makeErrorTestId(method) {
    return "04-error-" + method;
  }

  function makeErrorSignature(spec) {
    const args = spec.args
      .map((type, index) => {
        if (type === "error") return "error";
        return "string" + (index + 1);
      })
      .join(", ");

    return "console." + spec.method + "(" + args + ")";
  }

  function registerTest(state, definition) {
    state.tests.push({
      id: definition.id,
      group: definition.group,
      title: definition.title,
      method: definition.method,
      signature: definition.signature,
      expectedSignals: definition.expectedSignals.slice()
    });
  }

  function runConsoleMethod(method, args, state, testId) {
    const fn = console[method];
    const call = {
      testId,
      method,
      argc: args.length,
      skipped: typeof fn !== "function",
      startedAt: null,
      endedAt: null,
      durationMs: null,
      at: now()
    };

    state.calls.push(call);

    if (typeof fn !== "function") return;

    try {
      call.startedAt = now();
      fn.apply(console, args);
      call.endedAt = now();
      call.durationMs = call.endedAt - call.startedAt;
    } catch (error) {
      call.endedAt = now();
      call.durationMs =
        call.startedAt === null ? null : call.endedAt - call.startedAt;
      state.errors.push({
        testId,
        method,
        message: error && error.message ? error.message : String(error),
        at: now()
      });
    }
  }

  function safeDefine(target, prop, descriptor, state, test, testId) {
    try {
      Object.defineProperty(target, prop, descriptor);
      return true;
    } catch (error) {
      state.errors.push({
        testId,
        test,
        prop,
        message: error && error.message ? error.message : String(error),
        at: now()
      });
      return false;
    }
  }

  function makeHitRecorder(state, test, extra) {
    return function record(signal) {
      state.hits.push({
        test,
        signal,
        at: now(),
        ...(extra || {})
      });
    };
  }

  function makeRegExpProbe(state, token, testId) {
    const test = "regexp-toString-value";
    const record = makeHitRecorder(state, test, { testId, method: "log" });
    const regexp = new RegExp("console-probe-" + token);

    safeDefine(
      regexp,
      "toString",
      {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function regexpToStringProbe() {
          record("toString-call");
          return "/console-probe-" + token + "/";
        }
      },
      state,
      test,
      testId
    );

    return regexp;
  }

  function makeFunctionProbe(state, token, testId) {
    const test = "function-toString-and-call";
    const record = makeHitRecorder(state, test, { testId, method: "log" });

    function functionProbe() {
      record("function-call");
      return "function-probe-result-" + token;
    }

    safeDefine(
      functionProbe,
      "toString",
      {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function functionToStringProbe() {
          record("toString-call");
          return "function functionProbe() { [console-probe-" + token + "] }";
        }
      },
      state,
      test,
      testId
    );

    return functionProbe;
  }

  function makeAnchorProbe(state, token, testId) {
    const test = "anchor-id-getter";
    const record = makeHitRecorder(state, test, { testId, method: "log" });
    const anchor = document.createElement("a");

    anchor.href = "https://example.test/#" + token;

    safeDefine(
      anchor,
      "id",
      {
        configurable: true,
        enumerable: false,
        get: function anchorIdGetterProbe() {
          record("id-get");
          return "console-probe-anchor-" + token;
        }
      },
      state,
      test,
      testId
    );

    return anchor;
  }

  function makeErrorProbe(state, token, method, testId) {
    const test = "error-accessor";
    const record = makeHitRecorder(state, test, { testId, method });
    const error = new Error();

    function wrap(prop, value) {
      safeDefine(
        error,
        prop,
        {
          configurable: true,
          enumerable: false,
          get: function errorGetterProbe() {
            record(prop + "-get");
            return value;
          }
        },
        state,
        test,
        testId
      );
    }

    wrap("stack", "Error: console-probe-error-" + token);
    wrap("name", "ConsoleProbeError");
    wrap("message", "console-probe-error-" + token);

    return error;
  }

  function buildConsoleArgs(spec, state, token, testId) {
    return spec.args.map((type, index) => {
      if (type === "error") {
        return makeErrorProbe(state, token, spec.method, testId);
      }
      return "console-probe " + spec.method + " arg" + index + " " + token;
    });
  }

  function buildReport(state) {
    return state.tests.map((test) => {
      const hits = state.hits.filter((hit) => hit.testId === test.id);
      const errors = state.errors.filter((error) => error.testId === test.id);
      const call = state.calls.find((item) => item.testId === test.id);
      const hitSignals = unique(hits.map((hit) => hit.signal));
      const signalCounts = countBy(hits.map((hit) => hit.signal));
      const skipped = call ? call.skipped : true;
      const detected = hits.length > 0;
      let status = "not-detected";

      if (skipped) {
        status = "skipped";
      } else if (errors.length && detected) {
        status = "detected-with-error";
      } else if (errors.length) {
        status = "error";
      } else if (detected) {
        status = "detected";
      }

      return {
        id: test.id,
        group: test.group,
        title: test.title,
        signature: test.signature,
        method: test.method,
        argc: call ? call.argc : 0,
        durationMs: call ? call.durationMs : null,
        startedAt: call ? call.startedAt : null,
        endedAt: call ? call.endedAt : null,
        status,
        detected,
        skipped,
        expectedSignals: test.expectedSignals.slice(),
        hitSignals,
        signalCounts,
        hitCount: hits.length,
        hits,
        errors
      };
    });
  }

  function formatConsoleProbeReport(result) {
    const lines = [
      "Console probe report",
      "token: " + result.token,
      "detected: " + String(result.detected),
      ""
    ];

    for (const row of result.report) {
      const expected = row.expectedSignals.join(", ");
      const actual = row.hitSignals.length
        ? row.hitSignals
            .map((signal) => signal + " x" + row.signalCounts[signal])
            .join(", ")
        : "-";

      lines.push(
        row.group +
          ". " +
          row.signature +
          " -> " +
          row.status +
          " | expected: " +
          expected +
          " | actual: " +
          actual +
          " | duration: " +
          formatDurationMs(row.durationMs) +
          " | hits: " +
          row.hitCount
      );
    }

    if (result.errors.length) {
      lines.push("");
      lines.push("Errors:");
      for (const error of result.errors) {
        lines.push(
          "- " +
            (error.testId || error.method || "unknown") +
            ": " +
            error.message
        );
      }
    }

    return lines.join("\n");
  }

  function formatDurationMs(durationMs) {
    return typeof durationMs === "number" ? durationMs.toFixed(3) + " ms" : "-";
  }

  function printConsoleProbeReport(result) {
    const rows = result.report.map((row) => ({
      id: row.id,
      call: row.signature,
      status: row.status,
      duration: formatDurationMs(row.durationMs),
      expected: row.expectedSignals.join(", "),
      actual: row.hitSignals.length
        ? row.hitSignals
            .map((signal) => signal + " x" + row.signalCounts[signal])
            .join(", ")
        : "-",
      hits: row.hitCount
    }));

    if (typeof console.table === "function") {
      console.table(rows);
    } else {
      console.log(formatConsoleProbeReport(result));
    }
  }

  async function runConsoleProbeTests(options) {
    const settings = options || {};
    const token = settings.token || makeToken();
    const waitMs =
      typeof settings.waitMs === "number" ? settings.waitMs : DEFAULT_WAIT_MS;

    const state = {
      token,
      tests: [],
      calls: [],
      hits: [],
      errors: []
    };

    for (const test of STATIC_TESTS) {
      registerTest(state, test);
    }

    runConsoleMethod(
      "log",
      [makeRegExpProbe(state, token, STATIC_TESTS[0].id)],
      state,
      STATIC_TESTS[0].id
    );
    runConsoleMethod(
      "log",
      [makeFunctionProbe(state, token, STATIC_TESTS[1].id)],
      state,
      STATIC_TESTS[1].id
    );
    runConsoleMethod(
      "log",
      [makeAnchorProbe(state, token, STATIC_TESTS[2].id)],
      state,
      STATIC_TESTS[2].id
    );

    for (const spec of ERROR_CONSOLE_CALLS) {
      const testId = makeErrorTestId(spec.method);

      registerTest(state, {
        id: testId,
        group: "4",
        title:
          "console." +
          spec.method +
          " with Error stack/name/message getters",
        method: spec.method,
        signature: makeErrorSignature(spec),
        expectedSignals: ["stack-get", "name-get", "message-get"]
      });

      runConsoleMethod(
        spec.method,
        buildConsoleArgs(spec, state, token, testId),
        state,
        testId
      );
    }

    await new Promise((resolve) => setTimeout(resolve, waitMs));

    const result = {
      token,
      detected: state.hits.length > 0,
      calls: state.calls,
      hits: state.hits,
      report: buildReport(state),
      summary: summarize(state.hits),
      errors: state.errors
    };

    result.reportText = formatConsoleProbeReport(result);

    if (settings.print) {
      printConsoleProbeReport(result);
    }

    return result;
  }

  global.runConsoleProbeTests = runConsoleProbeTests;
  global.formatConsoleProbeReport = formatConsoleProbeReport;
  global.printConsoleProbeReport = printConsoleProbeReport;
  global.CONSOLE_PROBE_ERROR_CALLS = ERROR_CONSOLE_CALLS.slice();
})(typeof globalThis !== "undefined" ? globalThis : window);
