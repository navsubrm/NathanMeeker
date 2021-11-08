var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* toIterator(parts, clone2 = true) {
  for (let part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else if (ArrayBuffer.isView(part)) {
      if (clone2) {
        let position = part.byteOffset;
        let end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    } else {
      let position = 0;
      while (position !== part.size) {
        const chunk = part.slice(position, Math.min(part.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    length += isBlob(value) ? value.size : Buffer.byteLength(String(value));
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = import_stream.default.Readable.from(body.stream());
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const error2 = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(error2);
        throw error2;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    const error_ = error2 instanceof FetchBaseError ? error2 : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    throw error_;
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (error2) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${error2.message}`, "system", error2));
      finalize();
    });
    fixResponseChunkedTransferBadEnding(request_, (error2) => {
      response.body.destroy(error2);
    });
    if (process.version < "v14") {
      request_.on("socket", (s2) => {
        let endedWithEventsCount;
        s2.prependListener("end", () => {
          endedWithEventsCount = s2._eventsCount;
        });
        s2.prependListener("close", (hadError) => {
          if (response && endedWithEventsCount < s2._eventsCount && !hadError) {
            const error2 = new Error("Premature close");
            error2.code = "ERR_STREAM_PREMATURE_CLOSE";
            response.body.emit("error", error2);
          }
        });
      });
    }
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              headers.set("Location", locationURL);
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
          default:
            return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      if (signal) {
        response_.once("end", () => {
          signal.removeEventListener("abort", abortAndFinalize);
        });
      }
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
        raw.once("data", (chunk) => {
          body = (chunk[0] & 15) === 8 ? (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), reject) : (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), reject);
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
  const LAST_CHUNK = Buffer.from("0\r\n\r\n");
  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;
  request.on("response", (response) => {
    const { headers } = response;
    isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
  });
  request.on("socket", (socket) => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error2 = new Error("Premature close");
        error2.code = "ERR_STREAM_PREMATURE_CLOSE";
        errorCallback(error2);
      }
    };
    socket.prependListener("close", onSocketClose);
    request.on("abort", () => {
      socket.removeListener("close", onSocketClose);
    });
    socket.on("data", (buf) => {
      properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
      }
      previousChunk = buf;
    });
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, commonjsGlobal, src, dataUriToBuffer$1, ponyfill_es2018, POOL_SIZE$1, POOL_SIZE, _Blob, Blob2, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ponyfill_es2018 = { exports: {} };
    (function(module2, exports) {
      (function(global2, factory) {
        factory(exports);
      })(commonjsGlobal, function(exports2) {
        const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description) => `Symbol(${description})`;
        function noop2() {
          return void 0;
        }
        function getGlobals() {
          if (typeof self !== "undefined") {
            return self;
          } else if (typeof window !== "undefined") {
            return window;
          } else if (typeof commonjsGlobal !== "undefined") {
            return commonjsGlobal;
          }
          return void 0;
        }
        const globals = getGlobals();
        function typeIsObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        const rethrowAssertionErrorRejection = noop2;
        const originalPromise = Promise;
        const originalPromiseThen = Promise.prototype.then;
        const originalPromiseResolve = Promise.resolve.bind(originalPromise);
        const originalPromiseReject = Promise.reject.bind(originalPromise);
        function newPromise(executor) {
          return new originalPromise(executor);
        }
        function promiseResolvedWith(value) {
          return originalPromiseResolve(value);
        }
        function promiseRejectedWith(reason) {
          return originalPromiseReject(reason);
        }
        function PerformPromiseThen(promise, onFulfilled, onRejected) {
          return originalPromiseThen.call(promise, onFulfilled, onRejected);
        }
        function uponPromise(promise, onFulfilled, onRejected) {
          PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), void 0, rethrowAssertionErrorRejection);
        }
        function uponFulfillment(promise, onFulfilled) {
          uponPromise(promise, onFulfilled);
        }
        function uponRejection(promise, onRejected) {
          uponPromise(promise, void 0, onRejected);
        }
        function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
          return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
        }
        function setPromiseIsHandledToTrue(promise) {
          PerformPromiseThen(promise, void 0, rethrowAssertionErrorRejection);
        }
        const queueMicrotask = (() => {
          const globalQueueMicrotask = globals && globals.queueMicrotask;
          if (typeof globalQueueMicrotask === "function") {
            return globalQueueMicrotask;
          }
          const resolvedPromise = promiseResolvedWith(void 0);
          return (fn) => PerformPromiseThen(resolvedPromise, fn);
        })();
        function reflectCall(F, V, args) {
          if (typeof F !== "function") {
            throw new TypeError("Argument is not a function");
          }
          return Function.prototype.apply.call(F, V, args);
        }
        function promiseCall(F, V, args) {
          try {
            return promiseResolvedWith(reflectCall(F, V, args));
          } catch (value) {
            return promiseRejectedWith(value);
          }
        }
        const QUEUE_MAX_ARRAY_SIZE = 16384;
        class SimpleQueue {
          constructor() {
            this._cursor = 0;
            this._size = 0;
            this._front = {
              _elements: [],
              _next: void 0
            };
            this._back = this._front;
            this._cursor = 0;
            this._size = 0;
          }
          get length() {
            return this._size;
          }
          push(element) {
            const oldBack = this._back;
            let newBack = oldBack;
            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
              newBack = {
                _elements: [],
                _next: void 0
              };
            }
            oldBack._elements.push(element);
            if (newBack !== oldBack) {
              this._back = newBack;
              oldBack._next = newBack;
            }
            ++this._size;
          }
          shift() {
            const oldFront = this._front;
            let newFront = oldFront;
            const oldCursor = this._cursor;
            let newCursor = oldCursor + 1;
            const elements = oldFront._elements;
            const element = elements[oldCursor];
            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
              newFront = oldFront._next;
              newCursor = 0;
            }
            --this._size;
            this._cursor = newCursor;
            if (oldFront !== newFront) {
              this._front = newFront;
            }
            elements[oldCursor] = void 0;
            return element;
          }
          forEach(callback) {
            let i = this._cursor;
            let node = this._front;
            let elements = node._elements;
            while (i !== elements.length || node._next !== void 0) {
              if (i === elements.length) {
                node = node._next;
                elements = node._elements;
                i = 0;
                if (elements.length === 0) {
                  break;
                }
              }
              callback(elements[i]);
              ++i;
            }
          }
          peek() {
            const front = this._front;
            const cursor = this._cursor;
            return front._elements[cursor];
          }
        }
        function ReadableStreamReaderGenericInitialize(reader, stream) {
          reader._ownerReadableStream = stream;
          stream._reader = reader;
          if (stream._state === "readable") {
            defaultReaderClosedPromiseInitialize(reader);
          } else if (stream._state === "closed") {
            defaultReaderClosedPromiseInitializeAsResolved(reader);
          } else {
            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
          }
        }
        function ReadableStreamReaderGenericCancel(reader, reason) {
          const stream = reader._ownerReadableStream;
          return ReadableStreamCancel(stream, reason);
        }
        function ReadableStreamReaderGenericRelease(reader) {
          if (reader._ownerReadableStream._state === "readable") {
            defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          } else {
            defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          }
          reader._ownerReadableStream._reader = void 0;
          reader._ownerReadableStream = void 0;
        }
        function readerLockException(name) {
          return new TypeError("Cannot " + name + " a stream using a released reader");
        }
        function defaultReaderClosedPromiseInitialize(reader) {
          reader._closedPromise = newPromise((resolve2, reject) => {
            reader._closedPromise_resolve = resolve2;
            reader._closedPromise_reject = reject;
          });
        }
        function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseReject(reader, reason);
        }
        function defaultReaderClosedPromiseInitializeAsResolved(reader) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseResolve(reader);
        }
        function defaultReaderClosedPromiseReject(reader, reason) {
          if (reader._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(reader._closedPromise);
          reader._closedPromise_reject(reason);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        function defaultReaderClosedPromiseResetToRejected(reader, reason) {
          defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
        }
        function defaultReaderClosedPromiseResolve(reader) {
          if (reader._closedPromise_resolve === void 0) {
            return;
          }
          reader._closedPromise_resolve(void 0);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
        const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
        const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
        const PullSteps = SymbolPolyfill("[[PullSteps]]");
        const NumberIsFinite = Number.isFinite || function(x) {
          return typeof x === "number" && isFinite(x);
        };
        const MathTrunc = Math.trunc || function(v) {
          return v < 0 ? Math.ceil(v) : Math.floor(v);
        };
        function isDictionary(x) {
          return typeof x === "object" || typeof x === "function";
        }
        function assertDictionary(obj, context) {
          if (obj !== void 0 && !isDictionary(obj)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertFunction(x, context) {
          if (typeof x !== "function") {
            throw new TypeError(`${context} is not a function.`);
          }
        }
        function isObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        function assertObject(x, context) {
          if (!isObject(x)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertRequiredArgument(x, position, context) {
          if (x === void 0) {
            throw new TypeError(`Parameter ${position} is required in '${context}'.`);
          }
        }
        function assertRequiredField(x, field, context) {
          if (x === void 0) {
            throw new TypeError(`${field} is required in '${context}'.`);
          }
        }
        function convertUnrestrictedDouble(value) {
          return Number(value);
        }
        function censorNegativeZero(x) {
          return x === 0 ? 0 : x;
        }
        function integerPart(x) {
          return censorNegativeZero(MathTrunc(x));
        }
        function convertUnsignedLongLongWithEnforceRange(value, context) {
          const lowerBound = 0;
          const upperBound = Number.MAX_SAFE_INTEGER;
          let x = Number(value);
          x = censorNegativeZero(x);
          if (!NumberIsFinite(x)) {
            throw new TypeError(`${context} is not a finite number`);
          }
          x = integerPart(x);
          if (x < lowerBound || x > upperBound) {
            throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
          }
          if (!NumberIsFinite(x) || x === 0) {
            return 0;
          }
          return x;
        }
        function assertReadableStream(x, context) {
          if (!IsReadableStream(x)) {
            throw new TypeError(`${context} is not a ReadableStream.`);
          }
        }
        function AcquireReadableStreamDefaultReader(stream) {
          return new ReadableStreamDefaultReader(stream);
        }
        function ReadableStreamAddReadRequest(stream, readRequest) {
          stream._reader._readRequests.push(readRequest);
        }
        function ReadableStreamFulfillReadRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readRequest = reader._readRequests.shift();
          if (done) {
            readRequest._closeSteps();
          } else {
            readRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadRequests(stream) {
          return stream._reader._readRequests.length;
        }
        function ReadableStreamHasDefaultReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamDefaultReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamDefaultReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("read"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: () => resolvePromise({ value: void 0, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamDefaultReaderRead(this, readRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamDefaultReader(this)) {
              throw defaultReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamDefaultReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultReader",
            configurable: true
          });
        }
        function IsReadableStreamDefaultReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readRequests")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultReader;
        }
        function ReadableStreamDefaultReaderRead(reader, readRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "closed") {
            readRequest._closeSteps();
          } else if (stream._state === "errored") {
            readRequest._errorSteps(stream._storedError);
          } else {
            stream._readableStreamController[PullSteps](readRequest);
          }
        }
        function defaultReaderBrandCheckException(name) {
          return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
        }
        const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
        }).prototype);
        class ReadableStreamAsyncIteratorImpl {
          constructor(reader, preventCancel) {
            this._ongoingPromise = void 0;
            this._isFinished = false;
            this._reader = reader;
            this._preventCancel = preventCancel;
          }
          next() {
            const nextSteps = () => this._nextSteps();
            this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
            return this._ongoingPromise;
          }
          return(value) {
            const returnSteps = () => this._returnSteps(value);
            return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
          }
          _nextSteps() {
            if (this._isFinished) {
              return Promise.resolve({ value: void 0, done: true });
            }
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("iterate"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => {
                this._ongoingPromise = void 0;
                queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
              },
              _closeSteps: () => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                resolvePromise({ value: void 0, done: true });
              },
              _errorSteps: (reason) => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                rejectPromise(reason);
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promise;
          }
          _returnSteps(value) {
            if (this._isFinished) {
              return Promise.resolve({ value, done: true });
            }
            this._isFinished = true;
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("finish iterating"));
            }
            if (!this._preventCancel) {
              const result = ReadableStreamReaderGenericCancel(reader, value);
              ReadableStreamReaderGenericRelease(reader);
              return transformPromiseWith(result, () => ({ value, done: true }));
            }
            ReadableStreamReaderGenericRelease(reader);
            return promiseResolvedWith({ value, done: true });
          }
        }
        const ReadableStreamAsyncIteratorPrototype = {
          next() {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
            }
            return this._asyncIteratorImpl.next();
          },
          return(value) {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
            }
            return this._asyncIteratorImpl.return(value);
          }
        };
        if (AsyncIteratorPrototype !== void 0) {
          Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
        }
        function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
          const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
          iterator._asyncIteratorImpl = impl;
          return iterator;
        }
        function IsReadableStreamAsyncIterator(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_asyncIteratorImpl")) {
            return false;
          }
          try {
            return x._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
          } catch (_a) {
            return false;
          }
        }
        function streamAsyncIteratorBrandCheckException(name) {
          return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
        }
        const NumberIsNaN = Number.isNaN || function(x) {
          return x !== x;
        };
        function CreateArrayFromList(elements) {
          return elements.slice();
        }
        function CopyDataBlockBytes(dest, destOffset, src2, srcOffset, n) {
          new Uint8Array(dest).set(new Uint8Array(src2, srcOffset, n), destOffset);
        }
        function TransferArrayBuffer(O) {
          return O;
        }
        function IsDetachedBuffer(O) {
          return false;
        }
        function ArrayBufferSlice(buffer, begin, end) {
          if (buffer.slice) {
            return buffer.slice(begin, end);
          }
          const length = end - begin;
          const slice = new ArrayBuffer(length);
          CopyDataBlockBytes(slice, 0, buffer, begin, length);
          return slice;
        }
        function IsNonNegativeNumber(v) {
          if (typeof v !== "number") {
            return false;
          }
          if (NumberIsNaN(v)) {
            return false;
          }
          if (v < 0) {
            return false;
          }
          return true;
        }
        function CloneAsUint8Array(O) {
          const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
          return new Uint8Array(buffer);
        }
        function DequeueValue(container) {
          const pair = container._queue.shift();
          container._queueTotalSize -= pair.size;
          if (container._queueTotalSize < 0) {
            container._queueTotalSize = 0;
          }
          return pair.value;
        }
        function EnqueueValueWithSize(container, value, size) {
          if (!IsNonNegativeNumber(size) || size === Infinity) {
            throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
          }
          container._queue.push({ value, size });
          container._queueTotalSize += size;
        }
        function PeekQueueValue(container) {
          const pair = container._queue.peek();
          return pair.value;
        }
        function ResetQueue(container) {
          container._queue = new SimpleQueue();
          container._queueTotalSize = 0;
        }
        class ReadableStreamBYOBRequest {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get view() {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("view");
            }
            return this._view;
          }
          respond(bytesWritten) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respond");
            }
            assertRequiredArgument(bytesWritten, 1, "respond");
            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(this._view.buffer))
              ;
            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
          }
          respondWithNewView(view) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respondWithNewView");
            }
            assertRequiredArgument(view, 1, "respondWithNewView");
            if (!ArrayBuffer.isView(view)) {
              throw new TypeError("You can only respond with array buffer views");
            }
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
          }
        }
        Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
          respond: { enumerable: true },
          respondWithNewView: { enumerable: true },
          view: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBRequest",
            configurable: true
          });
        }
        class ReadableByteStreamController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get byobRequest() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("byobRequest");
            }
            return ReadableByteStreamControllerGetBYOBRequest(this);
          }
          get desiredSize() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("desiredSize");
            }
            return ReadableByteStreamControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("close");
            }
            if (this._closeRequested) {
              throw new TypeError("The stream has already been closed; do not close it again!");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
            }
            ReadableByteStreamControllerClose(this);
          }
          enqueue(chunk) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("enqueue");
            }
            assertRequiredArgument(chunk, 1, "enqueue");
            if (!ArrayBuffer.isView(chunk)) {
              throw new TypeError("chunk must be an array buffer view");
            }
            if (chunk.byteLength === 0) {
              throw new TypeError("chunk must have non-zero byteLength");
            }
            if (chunk.buffer.byteLength === 0) {
              throw new TypeError(`chunk's buffer must have non-zero byteLength`);
            }
            if (this._closeRequested) {
              throw new TypeError("stream is closed or draining");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
            }
            ReadableByteStreamControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("error");
            }
            ReadableByteStreamControllerError(this, e);
          }
          [CancelSteps](reason) {
            ReadableByteStreamControllerClearPendingPullIntos(this);
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableByteStreamControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableByteStream;
            if (this._queueTotalSize > 0) {
              const entry = this._queue.shift();
              this._queueTotalSize -= entry.byteLength;
              ReadableByteStreamControllerHandleQueueDrain(this);
              const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
              readRequest._chunkSteps(view);
              return;
            }
            const autoAllocateChunkSize = this._autoAllocateChunkSize;
            if (autoAllocateChunkSize !== void 0) {
              let buffer;
              try {
                buffer = new ArrayBuffer(autoAllocateChunkSize);
              } catch (bufferE) {
                readRequest._errorSteps(bufferE);
                return;
              }
              const pullIntoDescriptor = {
                buffer,
                bufferByteLength: autoAllocateChunkSize,
                byteOffset: 0,
                byteLength: autoAllocateChunkSize,
                bytesFilled: 0,
                elementSize: 1,
                viewConstructor: Uint8Array,
                readerType: "default"
              };
              this._pendingPullIntos.push(pullIntoDescriptor);
            }
            ReadableStreamAddReadRequest(stream, readRequest);
            ReadableByteStreamControllerCallPullIfNeeded(this);
          }
        }
        Object.defineProperties(ReadableByteStreamController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          byobRequest: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableByteStreamController",
            configurable: true
          });
        }
        function IsReadableByteStreamController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableByteStream")) {
            return false;
          }
          return x instanceof ReadableByteStreamController;
        }
        function IsReadableStreamBYOBRequest(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_associatedReadableByteStreamController")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBRequest;
        }
        function ReadableByteStreamControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableByteStreamControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableByteStreamControllerError(controller, e);
          });
        }
        function ReadableByteStreamControllerClearPendingPullIntos(controller) {
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          controller._pendingPullIntos = new SimpleQueue();
        }
        function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
          let done = false;
          if (stream._state === "closed") {
            done = true;
          }
          const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
          if (pullIntoDescriptor.readerType === "default") {
            ReadableStreamFulfillReadRequest(stream, filledView, done);
          } else {
            ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
          }
        }
        function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
          const bytesFilled = pullIntoDescriptor.bytesFilled;
          const elementSize = pullIntoDescriptor.elementSize;
          return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
        }
        function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
          controller._queue.push({ buffer, byteOffset, byteLength });
          controller._queueTotalSize += byteLength;
        }
        function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
          const elementSize = pullIntoDescriptor.elementSize;
          const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
          const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
          const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
          const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
          let totalBytesToCopyRemaining = maxBytesToCopy;
          let ready = false;
          if (maxAlignedBytes > currentAlignedBytes) {
            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
            ready = true;
          }
          const queue = controller._queue;
          while (totalBytesToCopyRemaining > 0) {
            const headOfQueue = queue.peek();
            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
            if (headOfQueue.byteLength === bytesToCopy) {
              queue.shift();
            } else {
              headOfQueue.byteOffset += bytesToCopy;
              headOfQueue.byteLength -= bytesToCopy;
            }
            controller._queueTotalSize -= bytesToCopy;
            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
            totalBytesToCopyRemaining -= bytesToCopy;
          }
          return ready;
        }
        function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
          pullIntoDescriptor.bytesFilled += size;
        }
        function ReadableByteStreamControllerHandleQueueDrain(controller) {
          if (controller._queueTotalSize === 0 && controller._closeRequested) {
            ReadableByteStreamControllerClearAlgorithms(controller);
            ReadableStreamClose(controller._controlledReadableByteStream);
          } else {
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }
        }
        function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
          if (controller._byobRequest === null) {
            return;
          }
          controller._byobRequest._associatedReadableByteStreamController = void 0;
          controller._byobRequest._view = null;
          controller._byobRequest = null;
        }
        function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
          while (controller._pendingPullIntos.length > 0) {
            if (controller._queueTotalSize === 0) {
              return;
            }
            const pullIntoDescriptor = controller._pendingPullIntos.peek();
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
          const stream = controller._controlledReadableByteStream;
          let elementSize = 1;
          if (view.constructor !== DataView) {
            elementSize = view.constructor.BYTES_PER_ELEMENT;
          }
          const ctor = view.constructor;
          const buffer = TransferArrayBuffer(view.buffer);
          const pullIntoDescriptor = {
            buffer,
            bufferByteLength: buffer.byteLength,
            byteOffset: view.byteOffset,
            byteLength: view.byteLength,
            bytesFilled: 0,
            elementSize,
            viewConstructor: ctor,
            readerType: "byob"
          };
          if (controller._pendingPullIntos.length > 0) {
            controller._pendingPullIntos.push(pullIntoDescriptor);
            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
            return;
          }
          if (stream._state === "closed") {
            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
            readIntoRequest._closeSteps(emptyView);
            return;
          }
          if (controller._queueTotalSize > 0) {
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
              ReadableByteStreamControllerHandleQueueDrain(controller);
              readIntoRequest._chunkSteps(filledView);
              return;
            }
            if (controller._closeRequested) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              readIntoRequest._errorSteps(e);
              return;
            }
          }
          controller._pendingPullIntos.push(pullIntoDescriptor);
          ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
          const stream = controller._controlledReadableByteStream;
          if (ReadableStreamHasBYOBReader(stream)) {
            while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
              const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
          ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
          if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
            return;
          }
          ReadableByteStreamControllerShiftPendingPullInto(controller);
          const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
          if (remainderSize > 0) {
            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
          }
          pullIntoDescriptor.bytesFilled -= remainderSize;
          ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
          ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
        }
        function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            ReadableByteStreamControllerRespondInClosedState(controller);
          } else {
            ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerShiftPendingPullInto(controller) {
          const descriptor = controller._pendingPullIntos.shift();
          return descriptor;
        }
        function ReadableByteStreamControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return false;
          }
          if (controller._closeRequested) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableByteStreamControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
        }
        function ReadableByteStreamControllerClose(controller) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          if (controller._queueTotalSize > 0) {
            controller._closeRequested = true;
            return;
          }
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (firstPendingPullInto.bytesFilled > 0) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              throw e;
            }
          }
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamClose(stream);
        }
        function ReadableByteStreamControllerEnqueue(controller, chunk) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          const buffer = chunk.buffer;
          const byteOffset = chunk.byteOffset;
          const byteLength = chunk.byteLength;
          const transferredBuffer = TransferArrayBuffer(buffer);
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (IsDetachedBuffer(firstPendingPullInto.buffer))
              ;
            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
          }
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          if (ReadableStreamHasDefaultReader(stream)) {
            if (ReadableStreamGetNumReadRequests(stream) === 0) {
              ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            } else {
              const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
              ReadableStreamFulfillReadRequest(stream, transferredView, false);
            }
          } else if (ReadableStreamHasBYOBReader(stream)) {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
          } else {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerError(controller, e) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return;
          }
          ReadableByteStreamControllerClearPendingPullIntos(controller);
          ResetQueue(controller);
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableByteStreamControllerGetBYOBRequest(controller) {
          if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
            const firstDescriptor = controller._pendingPullIntos.peek();
            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
            controller._byobRequest = byobRequest;
          }
          return controller._byobRequest;
        }
        function ReadableByteStreamControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableByteStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableByteStreamControllerRespond(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (bytesWritten !== 0) {
              throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
            }
          } else {
            if (bytesWritten === 0) {
              throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
            }
            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
              throw new RangeError("bytesWritten out of range");
            }
          }
          firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
          ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
        }
        function ReadableByteStreamControllerRespondWithNewView(controller, view) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (view.byteLength !== 0) {
              throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
            }
          } else {
            if (view.byteLength === 0) {
              throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
            }
          }
          if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
            throw new RangeError("The region specified by view does not match byobRequest");
          }
          if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
            throw new RangeError("The buffer of view has different capacity than byobRequest");
          }
          if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
            throw new RangeError("The region specified by view is larger than byobRequest");
          }
          firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
          ReadableByteStreamControllerRespondInternal(controller, view.byteLength);
        }
        function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
          controller._controlledReadableByteStream = stream;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._byobRequest = null;
          controller._queue = controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._closeRequested = false;
          controller._started = false;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          controller._autoAllocateChunkSize = autoAllocateChunkSize;
          controller._pendingPullIntos = new SimpleQueue();
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableByteStreamControllerError(controller, r);
          });
        }
        function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
          const controller = Object.create(ReadableByteStreamController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingByteSource.start !== void 0) {
            startAlgorithm = () => underlyingByteSource.start(controller);
          }
          if (underlyingByteSource.pull !== void 0) {
            pullAlgorithm = () => underlyingByteSource.pull(controller);
          }
          if (underlyingByteSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingByteSource.cancel(reason);
          }
          const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
          if (autoAllocateChunkSize === 0) {
            throw new TypeError("autoAllocateChunkSize must be greater than 0");
          }
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
        }
        function SetUpReadableStreamBYOBRequest(request, controller, view) {
          request._associatedReadableByteStreamController = controller;
          request._view = view;
        }
        function byobRequestBrandCheckException(name) {
          return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
        }
        function byteStreamControllerBrandCheckException(name) {
          return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
        }
        function AcquireReadableStreamBYOBReader(stream) {
          return new ReadableStreamBYOBReader(stream);
        }
        function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
          stream._reader._readIntoRequests.push(readIntoRequest);
        }
        function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readIntoRequest = reader._readIntoRequests.shift();
          if (done) {
            readIntoRequest._closeSteps(chunk);
          } else {
            readIntoRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadIntoRequests(stream) {
          return stream._reader._readIntoRequests.length;
        }
        function ReadableStreamHasBYOBReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamBYOBReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamBYOBReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            if (!IsReadableByteStreamController(stream._readableStreamController)) {
              throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readIntoRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read(view) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("read"));
            }
            if (!ArrayBuffer.isView(view)) {
              return promiseRejectedWith(new TypeError("view must be an array buffer view"));
            }
            if (view.byteLength === 0) {
              return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
            }
            if (view.buffer.byteLength === 0) {
              return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readIntoRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: (chunk) => resolvePromise({ value: chunk, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamBYOBReader(this)) {
              throw byobReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readIntoRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamBYOBReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBReader",
            configurable: true
          });
        }
        function IsReadableStreamBYOBReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readIntoRequests")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBReader;
        }
        function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "errored") {
            readIntoRequest._errorSteps(stream._storedError);
          } else {
            ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
          }
        }
        function byobReaderBrandCheckException(name) {
          return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
        }
        function ExtractHighWaterMark(strategy, defaultHWM) {
          const { highWaterMark } = strategy;
          if (highWaterMark === void 0) {
            return defaultHWM;
          }
          if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
            throw new RangeError("Invalid highWaterMark");
          }
          return highWaterMark;
        }
        function ExtractSizeAlgorithm(strategy) {
          const { size } = strategy;
          if (!size) {
            return () => 1;
          }
          return size;
        }
        function convertQueuingStrategy(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          const size = init2 === null || init2 === void 0 ? void 0 : init2.size;
          return {
            highWaterMark: highWaterMark === void 0 ? void 0 : convertUnrestrictedDouble(highWaterMark),
            size: size === void 0 ? void 0 : convertQueuingStrategySize(size, `${context} has member 'size' that`)
          };
        }
        function convertQueuingStrategySize(fn, context) {
          assertFunction(fn, context);
          return (chunk) => convertUnrestrictedDouble(fn(chunk));
        }
        function convertUnderlyingSink(original, context) {
          assertDictionary(original, context);
          const abort = original === null || original === void 0 ? void 0 : original.abort;
          const close = original === null || original === void 0 ? void 0 : original.close;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          const write = original === null || original === void 0 ? void 0 : original.write;
          return {
            abort: abort === void 0 ? void 0 : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
            close: close === void 0 ? void 0 : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
            write: write === void 0 ? void 0 : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
            type
          };
        }
        function convertUnderlyingSinkAbortCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSinkCloseCallback(fn, original, context) {
          assertFunction(fn, context);
          return () => promiseCall(fn, original, []);
        }
        function convertUnderlyingSinkStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertUnderlyingSinkWriteCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        function assertWritableStream(x, context) {
          if (!IsWritableStream(x)) {
            throw new TypeError(`${context} is not a WritableStream.`);
          }
        }
        function isAbortSignal2(value) {
          if (typeof value !== "object" || value === null) {
            return false;
          }
          try {
            return typeof value.aborted === "boolean";
          } catch (_a) {
            return false;
          }
        }
        const supportsAbortController = typeof AbortController === "function";
        function createAbortController() {
          if (supportsAbortController) {
            return new AbortController();
          }
          return void 0;
        }
        class WritableStream {
          constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
            if (rawUnderlyingSink === void 0) {
              rawUnderlyingSink = null;
            } else {
              assertObject(rawUnderlyingSink, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
            InitializeWritableStream(this);
            const type = underlyingSink.type;
            if (type !== void 0) {
              throw new RangeError("Invalid type is specified");
            }
            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
            const highWaterMark = ExtractHighWaterMark(strategy, 1);
            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
          }
          get locked() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("locked");
            }
            return IsWritableStreamLocked(this);
          }
          abort(reason = void 0) {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("abort"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
            }
            return WritableStreamAbort(this, reason);
          }
          close() {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("close"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
            }
            if (WritableStreamCloseQueuedOrInFlight(this)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamClose(this);
          }
          getWriter() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("getWriter");
            }
            return AcquireWritableStreamDefaultWriter(this);
          }
        }
        Object.defineProperties(WritableStream.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          getWriter: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStream",
            configurable: true
          });
        }
        function AcquireWritableStreamDefaultWriter(stream) {
          return new WritableStreamDefaultWriter(stream);
        }
        function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(WritableStream.prototype);
          InitializeWritableStream(stream);
          const controller = Object.create(WritableStreamDefaultController.prototype);
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function InitializeWritableStream(stream) {
          stream._state = "writable";
          stream._storedError = void 0;
          stream._writer = void 0;
          stream._writableStreamController = void 0;
          stream._writeRequests = new SimpleQueue();
          stream._inFlightWriteRequest = void 0;
          stream._closeRequest = void 0;
          stream._inFlightCloseRequest = void 0;
          stream._pendingAbortRequest = void 0;
          stream._backpressure = false;
        }
        function IsWritableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_writableStreamController")) {
            return false;
          }
          return x instanceof WritableStream;
        }
        function IsWritableStreamLocked(stream) {
          if (stream._writer === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamAbort(stream, reason) {
          var _a;
          if (stream._state === "closed" || stream._state === "errored") {
            return promiseResolvedWith(void 0);
          }
          stream._writableStreamController._abortReason = reason;
          (_a = stream._writableStreamController._abortController) === null || _a === void 0 ? void 0 : _a.abort();
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseResolvedWith(void 0);
          }
          if (stream._pendingAbortRequest !== void 0) {
            return stream._pendingAbortRequest._promise;
          }
          let wasAlreadyErroring = false;
          if (state === "erroring") {
            wasAlreadyErroring = true;
            reason = void 0;
          }
          const promise = newPromise((resolve2, reject) => {
            stream._pendingAbortRequest = {
              _promise: void 0,
              _resolve: resolve2,
              _reject: reject,
              _reason: reason,
              _wasAlreadyErroring: wasAlreadyErroring
            };
          });
          stream._pendingAbortRequest._promise = promise;
          if (!wasAlreadyErroring) {
            WritableStreamStartErroring(stream, reason);
          }
          return promise;
        }
        function WritableStreamClose(stream) {
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
          }
          const promise = newPromise((resolve2, reject) => {
            const closeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._closeRequest = closeRequest;
          });
          const writer = stream._writer;
          if (writer !== void 0 && stream._backpressure && state === "writable") {
            defaultWriterReadyPromiseResolve(writer);
          }
          WritableStreamDefaultControllerClose(stream._writableStreamController);
          return promise;
        }
        function WritableStreamAddWriteRequest(stream) {
          const promise = newPromise((resolve2, reject) => {
            const writeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._writeRequests.push(writeRequest);
          });
          return promise;
        }
        function WritableStreamDealWithRejection(stream, error2) {
          const state = stream._state;
          if (state === "writable") {
            WritableStreamStartErroring(stream, error2);
            return;
          }
          WritableStreamFinishErroring(stream);
        }
        function WritableStreamStartErroring(stream, reason) {
          const controller = stream._writableStreamController;
          stream._state = "erroring";
          stream._storedError = reason;
          const writer = stream._writer;
          if (writer !== void 0) {
            WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
          }
          if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
            WritableStreamFinishErroring(stream);
          }
        }
        function WritableStreamFinishErroring(stream) {
          stream._state = "errored";
          stream._writableStreamController[ErrorSteps]();
          const storedError = stream._storedError;
          stream._writeRequests.forEach((writeRequest) => {
            writeRequest._reject(storedError);
          });
          stream._writeRequests = new SimpleQueue();
          if (stream._pendingAbortRequest === void 0) {
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const abortRequest = stream._pendingAbortRequest;
          stream._pendingAbortRequest = void 0;
          if (abortRequest._wasAlreadyErroring) {
            abortRequest._reject(storedError);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
          uponPromise(promise, () => {
            abortRequest._resolve();
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          }, (reason) => {
            abortRequest._reject(reason);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          });
        }
        function WritableStreamFinishInFlightWrite(stream) {
          stream._inFlightWriteRequest._resolve(void 0);
          stream._inFlightWriteRequest = void 0;
        }
        function WritableStreamFinishInFlightWriteWithError(stream, error2) {
          stream._inFlightWriteRequest._reject(error2);
          stream._inFlightWriteRequest = void 0;
          WritableStreamDealWithRejection(stream, error2);
        }
        function WritableStreamFinishInFlightClose(stream) {
          stream._inFlightCloseRequest._resolve(void 0);
          stream._inFlightCloseRequest = void 0;
          const state = stream._state;
          if (state === "erroring") {
            stream._storedError = void 0;
            if (stream._pendingAbortRequest !== void 0) {
              stream._pendingAbortRequest._resolve();
              stream._pendingAbortRequest = void 0;
            }
          }
          stream._state = "closed";
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseResolve(writer);
          }
        }
        function WritableStreamFinishInFlightCloseWithError(stream, error2) {
          stream._inFlightCloseRequest._reject(error2);
          stream._inFlightCloseRequest = void 0;
          if (stream._pendingAbortRequest !== void 0) {
            stream._pendingAbortRequest._reject(error2);
            stream._pendingAbortRequest = void 0;
          }
          WritableStreamDealWithRejection(stream, error2);
        }
        function WritableStreamCloseQueuedOrInFlight(stream) {
          if (stream._closeRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamHasOperationMarkedInFlight(stream) {
          if (stream._inFlightWriteRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamMarkCloseRequestInFlight(stream) {
          stream._inFlightCloseRequest = stream._closeRequest;
          stream._closeRequest = void 0;
        }
        function WritableStreamMarkFirstWriteRequestInFlight(stream) {
          stream._inFlightWriteRequest = stream._writeRequests.shift();
        }
        function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
          if (stream._closeRequest !== void 0) {
            stream._closeRequest._reject(stream._storedError);
            stream._closeRequest = void 0;
          }
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseReject(writer, stream._storedError);
          }
        }
        function WritableStreamUpdateBackpressure(stream, backpressure) {
          const writer = stream._writer;
          if (writer !== void 0 && backpressure !== stream._backpressure) {
            if (backpressure) {
              defaultWriterReadyPromiseReset(writer);
            } else {
              defaultWriterReadyPromiseResolve(writer);
            }
          }
          stream._backpressure = backpressure;
        }
        class WritableStreamDefaultWriter {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
            assertWritableStream(stream, "First parameter");
            if (IsWritableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive writing by another writer");
            }
            this._ownerWritableStream = stream;
            stream._writer = this;
            const state = stream._state;
            if (state === "writable") {
              if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
                defaultWriterReadyPromiseInitialize(this);
              } else {
                defaultWriterReadyPromiseInitializeAsResolved(this);
              }
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "erroring") {
              defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "closed") {
              defaultWriterReadyPromiseInitializeAsResolved(this);
              defaultWriterClosedPromiseInitializeAsResolved(this);
            } else {
              const storedError = stream._storedError;
              defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
              defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
            }
          }
          get closed() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          get desiredSize() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("desiredSize");
            }
            if (this._ownerWritableStream === void 0) {
              throw defaultWriterLockException("desiredSize");
            }
            return WritableStreamDefaultWriterGetDesiredSize(this);
          }
          get ready() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
            }
            return this._readyPromise;
          }
          abort(reason = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("abort"));
            }
            return WritableStreamDefaultWriterAbort(this, reason);
          }
          close() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("close"));
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("close"));
            }
            if (WritableStreamCloseQueuedOrInFlight(stream)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamDefaultWriterClose(this);
          }
          releaseLock() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("releaseLock");
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return;
            }
            WritableStreamDefaultWriterRelease(this);
          }
          write(chunk = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("write"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("write to"));
            }
            return WritableStreamDefaultWriterWrite(this, chunk);
          }
        }
        Object.defineProperties(WritableStreamDefaultWriter.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          releaseLock: { enumerable: true },
          write: { enumerable: true },
          closed: { enumerable: true },
          desiredSize: { enumerable: true },
          ready: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultWriter",
            configurable: true
          });
        }
        function IsWritableStreamDefaultWriter(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_ownerWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultWriter;
        }
        function WritableStreamDefaultWriterAbort(writer, reason) {
          const stream = writer._ownerWritableStream;
          return WritableStreamAbort(stream, reason);
        }
        function WritableStreamDefaultWriterClose(writer) {
          const stream = writer._ownerWritableStream;
          return WritableStreamClose(stream);
        }
        function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          return WritableStreamDefaultWriterClose(writer);
        }
        function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error2) {
          if (writer._closedPromiseState === "pending") {
            defaultWriterClosedPromiseReject(writer, error2);
          } else {
            defaultWriterClosedPromiseResetToRejected(writer, error2);
          }
        }
        function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error2) {
          if (writer._readyPromiseState === "pending") {
            defaultWriterReadyPromiseReject(writer, error2);
          } else {
            defaultWriterReadyPromiseResetToRejected(writer, error2);
          }
        }
        function WritableStreamDefaultWriterGetDesiredSize(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (state === "errored" || state === "erroring") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
        }
        function WritableStreamDefaultWriterRelease(writer) {
          const stream = writer._ownerWritableStream;
          const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
          WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
          WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
          stream._writer = void 0;
          writer._ownerWritableStream = void 0;
        }
        function WritableStreamDefaultWriterWrite(writer, chunk) {
          const stream = writer._ownerWritableStream;
          const controller = stream._writableStreamController;
          const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
          if (stream !== writer._ownerWritableStream) {
            return promiseRejectedWith(defaultWriterLockException("write to"));
          }
          const state = stream._state;
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
          }
          if (state === "erroring") {
            return promiseRejectedWith(stream._storedError);
          }
          const promise = WritableStreamAddWriteRequest(stream);
          WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
          return promise;
        }
        const closeSentinel = {};
        class WritableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get abortReason() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("abortReason");
            }
            return this._abortReason;
          }
          get signal() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("signal");
            }
            if (this._abortController === void 0) {
              throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
            }
            return this._abortController.signal;
          }
          error(e = void 0) {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("error");
            }
            const state = this._controlledWritableStream._state;
            if (state !== "writable") {
              return;
            }
            WritableStreamDefaultControllerError(this, e);
          }
          [AbortSteps](reason) {
            const result = this._abortAlgorithm(reason);
            WritableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [ErrorSteps]() {
            ResetQueue(this);
          }
        }
        Object.defineProperties(WritableStreamDefaultController.prototype, {
          error: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultController",
            configurable: true
          });
        }
        function IsWritableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultController;
        }
        function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledWritableStream = stream;
          stream._writableStreamController = controller;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._abortReason = void 0;
          controller._abortController = createAbortController();
          controller._started = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._writeAlgorithm = writeAlgorithm;
          controller._closeAlgorithm = closeAlgorithm;
          controller._abortAlgorithm = abortAlgorithm;
          const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
          WritableStreamUpdateBackpressure(stream, backpressure);
          const startResult = startAlgorithm();
          const startPromise = promiseResolvedWith(startResult);
          uponPromise(startPromise, () => {
            controller._started = true;
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (r) => {
            controller._started = true;
            WritableStreamDealWithRejection(stream, r);
          });
        }
        function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(WritableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let writeAlgorithm = () => promiseResolvedWith(void 0);
          let closeAlgorithm = () => promiseResolvedWith(void 0);
          let abortAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSink.start !== void 0) {
            startAlgorithm = () => underlyingSink.start(controller);
          }
          if (underlyingSink.write !== void 0) {
            writeAlgorithm = (chunk) => underlyingSink.write(chunk, controller);
          }
          if (underlyingSink.close !== void 0) {
            closeAlgorithm = () => underlyingSink.close();
          }
          if (underlyingSink.abort !== void 0) {
            abortAlgorithm = (reason) => underlyingSink.abort(reason);
          }
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function WritableStreamDefaultControllerClearAlgorithms(controller) {
          controller._writeAlgorithm = void 0;
          controller._closeAlgorithm = void 0;
          controller._abortAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function WritableStreamDefaultControllerClose(controller) {
          EnqueueValueWithSize(controller, closeSentinel, 0);
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
          try {
            return controller._strategySizeAlgorithm(chunk);
          } catch (chunkSizeE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
            return 1;
          }
        }
        function WritableStreamDefaultControllerGetDesiredSize(controller) {
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
          try {
            EnqueueValueWithSize(controller, chunk, chunkSize);
          } catch (enqueueE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
            return;
          }
          const stream = controller._controlledWritableStream;
          if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
            WritableStreamUpdateBackpressure(stream, backpressure);
          }
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
          const stream = controller._controlledWritableStream;
          if (!controller._started) {
            return;
          }
          if (stream._inFlightWriteRequest !== void 0) {
            return;
          }
          const state = stream._state;
          if (state === "erroring") {
            WritableStreamFinishErroring(stream);
            return;
          }
          if (controller._queue.length === 0) {
            return;
          }
          const value = PeekQueueValue(controller);
          if (value === closeSentinel) {
            WritableStreamDefaultControllerProcessClose(controller);
          } else {
            WritableStreamDefaultControllerProcessWrite(controller, value);
          }
        }
        function WritableStreamDefaultControllerErrorIfNeeded(controller, error2) {
          if (controller._controlledWritableStream._state === "writable") {
            WritableStreamDefaultControllerError(controller, error2);
          }
        }
        function WritableStreamDefaultControllerProcessClose(controller) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkCloseRequestInFlight(stream);
          DequeueValue(controller);
          const sinkClosePromise = controller._closeAlgorithm();
          WritableStreamDefaultControllerClearAlgorithms(controller);
          uponPromise(sinkClosePromise, () => {
            WritableStreamFinishInFlightClose(stream);
          }, (reason) => {
            WritableStreamFinishInFlightCloseWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkFirstWriteRequestInFlight(stream);
          const sinkWritePromise = controller._writeAlgorithm(chunk);
          uponPromise(sinkWritePromise, () => {
            WritableStreamFinishInFlightWrite(stream);
            const state = stream._state;
            DequeueValue(controller);
            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
              const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
              WritableStreamUpdateBackpressure(stream, backpressure);
            }
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (reason) => {
            if (stream._state === "writable") {
              WritableStreamDefaultControllerClearAlgorithms(controller);
            }
            WritableStreamFinishInFlightWriteWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerGetBackpressure(controller) {
          const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
          return desiredSize <= 0;
        }
        function WritableStreamDefaultControllerError(controller, error2) {
          const stream = controller._controlledWritableStream;
          WritableStreamDefaultControllerClearAlgorithms(controller);
          WritableStreamStartErroring(stream, error2);
        }
        function streamBrandCheckException$2(name) {
          return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
        }
        function defaultControllerBrandCheckException$2(name) {
          return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
        }
        function defaultWriterBrandCheckException(name) {
          return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
        }
        function defaultWriterLockException(name) {
          return new TypeError("Cannot " + name + " a stream using a released writer");
        }
        function defaultWriterClosedPromiseInitialize(writer) {
          writer._closedPromise = newPromise((resolve2, reject) => {
            writer._closedPromise_resolve = resolve2;
            writer._closedPromise_reject = reject;
            writer._closedPromiseState = "pending";
          });
        }
        function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseReject(writer, reason);
        }
        function defaultWriterClosedPromiseInitializeAsResolved(writer) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseResolve(writer);
        }
        function defaultWriterClosedPromiseReject(writer, reason) {
          if (writer._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._closedPromise);
          writer._closedPromise_reject(reason);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "rejected";
        }
        function defaultWriterClosedPromiseResetToRejected(writer, reason) {
          defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterClosedPromiseResolve(writer) {
          if (writer._closedPromise_resolve === void 0) {
            return;
          }
          writer._closedPromise_resolve(void 0);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "resolved";
        }
        function defaultWriterReadyPromiseInitialize(writer) {
          writer._readyPromise = newPromise((resolve2, reject) => {
            writer._readyPromise_resolve = resolve2;
            writer._readyPromise_reject = reject;
          });
          writer._readyPromiseState = "pending";
        }
        function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseReject(writer, reason);
        }
        function defaultWriterReadyPromiseInitializeAsResolved(writer) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseResolve(writer);
        }
        function defaultWriterReadyPromiseReject(writer, reason) {
          if (writer._readyPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._readyPromise);
          writer._readyPromise_reject(reason);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "rejected";
        }
        function defaultWriterReadyPromiseReset(writer) {
          defaultWriterReadyPromiseInitialize(writer);
        }
        function defaultWriterReadyPromiseResetToRejected(writer, reason) {
          defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterReadyPromiseResolve(writer) {
          if (writer._readyPromise_resolve === void 0) {
            return;
          }
          writer._readyPromise_resolve(void 0);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "fulfilled";
        }
        const NativeDOMException = typeof DOMException !== "undefined" ? DOMException : void 0;
        function isDOMExceptionConstructor(ctor) {
          if (!(typeof ctor === "function" || typeof ctor === "object")) {
            return false;
          }
          try {
            new ctor();
            return true;
          } catch (_a) {
            return false;
          }
        }
        function createDOMExceptionPolyfill() {
          const ctor = function DOMException2(message, name) {
            this.message = message || "";
            this.name = name || "Error";
            if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
            }
          };
          ctor.prototype = Object.create(Error.prototype);
          Object.defineProperty(ctor.prototype, "constructor", { value: ctor, writable: true, configurable: true });
          return ctor;
        }
        const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();
        function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
          const reader = AcquireReadableStreamDefaultReader(source);
          const writer = AcquireWritableStreamDefaultWriter(dest);
          source._disturbed = true;
          let shuttingDown = false;
          let currentWrite = promiseResolvedWith(void 0);
          return newPromise((resolve2, reject) => {
            let abortAlgorithm;
            if (signal !== void 0) {
              abortAlgorithm = () => {
                const error2 = new DOMException$1("Aborted", "AbortError");
                const actions = [];
                if (!preventAbort) {
                  actions.push(() => {
                    if (dest._state === "writable") {
                      return WritableStreamAbort(dest, error2);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                if (!preventCancel) {
                  actions.push(() => {
                    if (source._state === "readable") {
                      return ReadableStreamCancel(source, error2);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                shutdownWithAction(() => Promise.all(actions.map((action) => action())), true, error2);
              };
              if (signal.aborted) {
                abortAlgorithm();
                return;
              }
              signal.addEventListener("abort", abortAlgorithm);
            }
            function pipeLoop() {
              return newPromise((resolveLoop, rejectLoop) => {
                function next(done) {
                  if (done) {
                    resolveLoop();
                  } else {
                    PerformPromiseThen(pipeStep(), next, rejectLoop);
                  }
                }
                next(false);
              });
            }
            function pipeStep() {
              if (shuttingDown) {
                return promiseResolvedWith(true);
              }
              return PerformPromiseThen(writer._readyPromise, () => {
                return newPromise((resolveRead, rejectRead) => {
                  ReadableStreamDefaultReaderRead(reader, {
                    _chunkSteps: (chunk) => {
                      currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), void 0, noop2);
                      resolveRead(false);
                    },
                    _closeSteps: () => resolveRead(true),
                    _errorSteps: rejectRead
                  });
                });
              });
            }
            isOrBecomesErrored(source, reader._closedPromise, (storedError) => {
              if (!preventAbort) {
                shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesErrored(dest, writer._closedPromise, (storedError) => {
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesClosed(source, reader._closedPromise, () => {
              if (!preventClose) {
                shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
              } else {
                shutdown();
              }
            });
            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
              const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
              } else {
                shutdown(true, destClosed);
              }
            }
            setPromiseIsHandledToTrue(pipeLoop());
            function waitForWritesToFinish() {
              const oldCurrentWrite = currentWrite;
              return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : void 0);
            }
            function isOrBecomesErrored(stream, promise, action) {
              if (stream._state === "errored") {
                action(stream._storedError);
              } else {
                uponRejection(promise, action);
              }
            }
            function isOrBecomesClosed(stream, promise, action) {
              if (stream._state === "closed") {
                action();
              } else {
                uponFulfillment(promise, action);
              }
            }
            function shutdownWithAction(action, originalIsError, originalError) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), doTheRest);
              } else {
                doTheRest();
              }
              function doTheRest() {
                uponPromise(action(), () => finalize(originalIsError, originalError), (newError) => finalize(true, newError));
              }
            }
            function shutdown(isError, error2) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error2));
              } else {
                finalize(isError, error2);
              }
            }
            function finalize(isError, error2) {
              WritableStreamDefaultWriterRelease(writer);
              ReadableStreamReaderGenericRelease(reader);
              if (signal !== void 0) {
                signal.removeEventListener("abort", abortAlgorithm);
              }
              if (isError) {
                reject(error2);
              } else {
                resolve2(void 0);
              }
            }
          });
        }
        class ReadableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("desiredSize");
            }
            return ReadableStreamDefaultControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("close");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits close");
            }
            ReadableStreamDefaultControllerClose(this);
          }
          enqueue(chunk = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("enqueue");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits enqueue");
            }
            return ReadableStreamDefaultControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("error");
            }
            ReadableStreamDefaultControllerError(this, e);
          }
          [CancelSteps](reason) {
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableStream;
            if (this._queue.length > 0) {
              const chunk = DequeueValue(this);
              if (this._closeRequested && this._queue.length === 0) {
                ReadableStreamDefaultControllerClearAlgorithms(this);
                ReadableStreamClose(stream);
              } else {
                ReadableStreamDefaultControllerCallPullIfNeeded(this);
              }
              readRequest._chunkSteps(chunk);
            } else {
              ReadableStreamAddReadRequest(stream, readRequest);
              ReadableStreamDefaultControllerCallPullIfNeeded(this);
            }
          }
        }
        Object.defineProperties(ReadableStreamDefaultController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultController",
            configurable: true
          });
        }
        function IsReadableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableStream")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultController;
        }
        function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableStreamDefaultControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableStreamDefaultControllerError(controller, e);
          });
        }
        function ReadableStreamDefaultControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableStream;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableStreamDefaultControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function ReadableStreamDefaultControllerClose(controller) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          controller._closeRequested = true;
          if (controller._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(controller);
            ReadableStreamClose(stream);
          }
        }
        function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            ReadableStreamFulfillReadRequest(stream, chunk, false);
          } else {
            let chunkSize;
            try {
              chunkSize = controller._strategySizeAlgorithm(chunk);
            } catch (chunkSizeE) {
              ReadableStreamDefaultControllerError(controller, chunkSizeE);
              throw chunkSizeE;
            }
            try {
              EnqueueValueWithSize(controller, chunk, chunkSize);
            } catch (enqueueE) {
              ReadableStreamDefaultControllerError(controller, enqueueE);
              throw enqueueE;
            }
          }
          ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
        function ReadableStreamDefaultControllerError(controller, e) {
          const stream = controller._controlledReadableStream;
          if (stream._state !== "readable") {
            return;
          }
          ResetQueue(controller);
          ReadableStreamDefaultControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableStreamDefaultControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableStreamDefaultControllerHasBackpressure(controller) {
          if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
            return false;
          }
          return true;
        }
        function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
          const state = controller._controlledReadableStream._state;
          if (!controller._closeRequested && state === "readable") {
            return true;
          }
          return false;
        }
        function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledReadableStream = stream;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._started = false;
          controller._closeRequested = false;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableStreamDefaultControllerError(controller, r);
          });
        }
        function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSource.start !== void 0) {
            startAlgorithm = () => underlyingSource.start(controller);
          }
          if (underlyingSource.pull !== void 0) {
            pullAlgorithm = () => underlyingSource.pull(controller);
          }
          if (underlyingSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingSource.cancel(reason);
          }
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function defaultControllerBrandCheckException$1(name) {
          return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
        }
        function ReadableStreamTee(stream, cloneForBranch2) {
          if (IsReadableByteStreamController(stream._readableStreamController)) {
            return ReadableByteStreamTee(stream);
          }
          return ReadableStreamDefaultTee(stream);
        }
        function ReadableStreamDefaultTee(stream, cloneForBranch2) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function pullAlgorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  const chunk2 = chunk;
                  if (!canceled1) {
                    ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
          }
          branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
          branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
          uponRejection(reader._closedPromise, (r) => {
            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          });
          return [branch1, branch2];
        }
        function ReadableByteStreamTee(stream) {
          let reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function forwardReaderError(thisReader) {
            uponRejection(thisReader._closedPromise, (r) => {
              if (thisReader !== reader) {
                return;
              }
              ReadableByteStreamControllerError(branch1._readableStreamController, r);
              ReadableByteStreamControllerError(branch2._readableStreamController, r);
              if (!canceled1 || !canceled2) {
                resolveCancelPromise(void 0);
              }
            });
          }
          function pullWithDefaultReader() {
            if (IsReadableStreamBYOBReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamDefaultReader(stream);
              forwardReaderError(reader);
            }
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  let chunk2 = chunk;
                  if (!canceled1 && !canceled2) {
                    try {
                      chunk2 = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                  }
                  if (!canceled1) {
                    ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableByteStreamControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableByteStreamControllerClose(branch2._readableStreamController);
                }
                if (branch1._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
                }
                if (branch2._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
          }
          function pullWithBYOBReader(view, forBranch2) {
            if (IsReadableStreamDefaultReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamBYOBReader(stream);
              forwardReaderError(reader);
            }
            const byobBranch = forBranch2 ? branch2 : branch1;
            const otherBranch = forBranch2 ? branch1 : branch2;
            const readIntoRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const byobCanceled = forBranch2 ? canceled2 : canceled1;
                  const otherCanceled = forBranch2 ? canceled1 : canceled2;
                  if (!otherCanceled) {
                    let clonedChunk;
                    try {
                      clonedChunk = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                    if (!byobCanceled) {
                      ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                    }
                    ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
                  } else if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                });
              },
              _closeSteps: (chunk) => {
                reading = false;
                const byobCanceled = forBranch2 ? canceled2 : canceled1;
                const otherCanceled = forBranch2 ? canceled1 : canceled2;
                if (!byobCanceled) {
                  ReadableByteStreamControllerClose(byobBranch._readableStreamController);
                }
                if (!otherCanceled) {
                  ReadableByteStreamControllerClose(otherBranch._readableStreamController);
                }
                if (chunk !== void 0) {
                  if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                  if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                    ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
                  }
                }
                if (!byobCanceled || !otherCanceled) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
          }
          function pull1Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, false);
            }
            return promiseResolvedWith(void 0);
          }
          function pull2Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, true);
            }
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
            return;
          }
          branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
          branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
          forwardReaderError(reader);
          return [branch1, branch2];
        }
        function convertUnderlyingDefaultOrByteSource(source, context) {
          assertDictionary(source, context);
          const original = source;
          const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
          const cancel = original === null || original === void 0 ? void 0 : original.cancel;
          const pull = original === null || original === void 0 ? void 0 : original.pull;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          return {
            autoAllocateChunkSize: autoAllocateChunkSize === void 0 ? void 0 : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
            cancel: cancel === void 0 ? void 0 : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
            pull: pull === void 0 ? void 0 : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
            type: type === void 0 ? void 0 : convertReadableStreamType(type, `${context} has member 'type' that`)
          };
        }
        function convertUnderlyingSourceCancelCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSourcePullCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertUnderlyingSourceStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertReadableStreamType(type, context) {
          type = `${type}`;
          if (type !== "bytes") {
            throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
          }
          return type;
        }
        function convertReaderOptions(options2, context) {
          assertDictionary(options2, context);
          const mode = options2 === null || options2 === void 0 ? void 0 : options2.mode;
          return {
            mode: mode === void 0 ? void 0 : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
          };
        }
        function convertReadableStreamReaderMode(mode, context) {
          mode = `${mode}`;
          if (mode !== "byob") {
            throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
          }
          return mode;
        }
        function convertIteratorOptions(options2, context) {
          assertDictionary(options2, context);
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          return { preventCancel: Boolean(preventCancel) };
        }
        function convertPipeOptions(options2, context) {
          assertDictionary(options2, context);
          const preventAbort = options2 === null || options2 === void 0 ? void 0 : options2.preventAbort;
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          const preventClose = options2 === null || options2 === void 0 ? void 0 : options2.preventClose;
          const signal = options2 === null || options2 === void 0 ? void 0 : options2.signal;
          if (signal !== void 0) {
            assertAbortSignal(signal, `${context} has member 'signal' that`);
          }
          return {
            preventAbort: Boolean(preventAbort),
            preventCancel: Boolean(preventCancel),
            preventClose: Boolean(preventClose),
            signal
          };
        }
        function assertAbortSignal(signal, context) {
          if (!isAbortSignal2(signal)) {
            throw new TypeError(`${context} is not an AbortSignal.`);
          }
        }
        function convertReadableWritablePair(pair, context) {
          assertDictionary(pair, context);
          const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
          assertRequiredField(readable, "readable", "ReadableWritablePair");
          assertReadableStream(readable, `${context} has member 'readable' that`);
          const writable2 = pair === null || pair === void 0 ? void 0 : pair.writable;
          assertRequiredField(writable2, "writable", "ReadableWritablePair");
          assertWritableStream(writable2, `${context} has member 'writable' that`);
          return { readable, writable: writable2 };
        }
        class ReadableStream2 {
          constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
            if (rawUnderlyingSource === void 0) {
              rawUnderlyingSource = null;
            } else {
              assertObject(rawUnderlyingSource, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
            InitializeReadableStream(this);
            if (underlyingSource.type === "bytes") {
              if (strategy.size !== void 0) {
                throw new RangeError("The strategy for a byte stream cannot have a size function");
              }
              const highWaterMark = ExtractHighWaterMark(strategy, 0);
              SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
            } else {
              const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
              const highWaterMark = ExtractHighWaterMark(strategy, 1);
              SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
            }
          }
          get locked() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("locked");
            }
            return IsReadableStreamLocked(this);
          }
          cancel(reason = void 0) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("cancel"));
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
            }
            return ReadableStreamCancel(this, reason);
          }
          getReader(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("getReader");
            }
            const options2 = convertReaderOptions(rawOptions, "First parameter");
            if (options2.mode === void 0) {
              return AcquireReadableStreamDefaultReader(this);
            }
            return AcquireReadableStreamBYOBReader(this);
          }
          pipeThrough(rawTransform, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("pipeThrough");
            }
            assertRequiredArgument(rawTransform, 1, "pipeThrough");
            const transform = convertReadableWritablePair(rawTransform, "First parameter");
            const options2 = convertPipeOptions(rawOptions, "Second parameter");
            if (IsReadableStreamLocked(this)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
            }
            if (IsWritableStreamLocked(transform.writable)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
            }
            const promise = ReadableStreamPipeTo(this, transform.writable, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
            setPromiseIsHandledToTrue(promise);
            return transform.readable;
          }
          pipeTo(destination, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
            }
            if (destination === void 0) {
              return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
            }
            if (!IsWritableStream(destination)) {
              return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
            }
            let options2;
            try {
              options2 = convertPipeOptions(rawOptions, "Second parameter");
            } catch (e) {
              return promiseRejectedWith(e);
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
            }
            if (IsWritableStreamLocked(destination)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
            }
            return ReadableStreamPipeTo(this, destination, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
          }
          tee() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("tee");
            }
            const branches = ReadableStreamTee(this);
            return CreateArrayFromList(branches);
          }
          values(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("values");
            }
            const options2 = convertIteratorOptions(rawOptions, "First parameter");
            return AcquireReadableStreamAsyncIterator(this, options2.preventCancel);
          }
        }
        Object.defineProperties(ReadableStream2.prototype, {
          cancel: { enumerable: true },
          getReader: { enumerable: true },
          pipeThrough: { enumerable: true },
          pipeTo: { enumerable: true },
          tee: { enumerable: true },
          values: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStream",
            configurable: true
          });
        }
        if (typeof SymbolPolyfill.asyncIterator === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.asyncIterator, {
            value: ReadableStream2.prototype.values,
            writable: true,
            configurable: true
          });
        }
        function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableByteStreamController.prototype);
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, void 0);
          return stream;
        }
        function InitializeReadableStream(stream) {
          stream._state = "readable";
          stream._reader = void 0;
          stream._storedError = void 0;
          stream._disturbed = false;
        }
        function IsReadableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readableStreamController")) {
            return false;
          }
          return x instanceof ReadableStream2;
        }
        function IsReadableStreamLocked(stream) {
          if (stream._reader === void 0) {
            return false;
          }
          return true;
        }
        function ReadableStreamCancel(stream, reason) {
          stream._disturbed = true;
          if (stream._state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (stream._state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          ReadableStreamClose(stream);
          const reader = stream._reader;
          if (reader !== void 0 && IsReadableStreamBYOBReader(reader)) {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._closeSteps(void 0);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
          const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
          return transformPromiseWith(sourceCancelPromise, noop2);
        }
        function ReadableStreamClose(stream) {
          stream._state = "closed";
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseResolve(reader);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._closeSteps();
            });
            reader._readRequests = new SimpleQueue();
          }
        }
        function ReadableStreamError(stream, e) {
          stream._state = "errored";
          stream._storedError = e;
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseReject(reader, e);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._errorSteps(e);
            });
            reader._readRequests = new SimpleQueue();
          } else {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._errorSteps(e);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
        }
        function streamBrandCheckException$1(name) {
          return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
        }
        function convertQueuingStrategyInit(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
          return {
            highWaterMark: convertUnrestrictedDouble(highWaterMark)
          };
        }
        const byteLengthSizeFunction = (chunk) => {
          return chunk.byteLength;
        };
        Object.defineProperty(byteLengthSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class ByteLengthQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "ByteLengthQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._byteLengthQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("highWaterMark");
            }
            return this._byteLengthQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("size");
            }
            return byteLengthSizeFunction;
          }
        }
        Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "ByteLengthQueuingStrategy",
            configurable: true
          });
        }
        function byteLengthBrandCheckException(name) {
          return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
        }
        function IsByteLengthQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_byteLengthQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof ByteLengthQueuingStrategy;
        }
        const countSizeFunction = () => {
          return 1;
        };
        Object.defineProperty(countSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class CountQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "CountQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._countQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("highWaterMark");
            }
            return this._countQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("size");
            }
            return countSizeFunction;
          }
        }
        Object.defineProperties(CountQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "CountQueuingStrategy",
            configurable: true
          });
        }
        function countBrandCheckException(name) {
          return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
        }
        function IsCountQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_countQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof CountQueuingStrategy;
        }
        function convertTransformer(original, context) {
          assertDictionary(original, context);
          const flush = original === null || original === void 0 ? void 0 : original.flush;
          const readableType = original === null || original === void 0 ? void 0 : original.readableType;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const transform = original === null || original === void 0 ? void 0 : original.transform;
          const writableType = original === null || original === void 0 ? void 0 : original.writableType;
          return {
            flush: flush === void 0 ? void 0 : convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
            readableType,
            start: start === void 0 ? void 0 : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
            transform: transform === void 0 ? void 0 : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
            writableType
          };
        }
        function convertTransformerFlushCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertTransformerStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertTransformerTransformCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        class TransformStream {
          constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
            if (rawTransformer === void 0) {
              rawTransformer = null;
            }
            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
            const transformer = convertTransformer(rawTransformer, "First parameter");
            if (transformer.readableType !== void 0) {
              throw new RangeError("Invalid readableType specified");
            }
            if (transformer.writableType !== void 0) {
              throw new RangeError("Invalid writableType specified");
            }
            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
            let startPromise_resolve;
            const startPromise = newPromise((resolve2) => {
              startPromise_resolve = resolve2;
            });
            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
            if (transformer.start !== void 0) {
              startPromise_resolve(transformer.start(this._transformStreamController));
            } else {
              startPromise_resolve(void 0);
            }
          }
          get readable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("readable");
            }
            return this._readable;
          }
          get writable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("writable");
            }
            return this._writable;
          }
        }
        Object.defineProperties(TransformStream.prototype, {
          readable: { enumerable: true },
          writable: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStream",
            configurable: true
          });
        }
        function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
          function startAlgorithm() {
            return startPromise;
          }
          function writeAlgorithm(chunk) {
            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
          }
          function abortAlgorithm(reason) {
            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
          }
          function closeAlgorithm() {
            return TransformStreamDefaultSinkCloseAlgorithm(stream);
          }
          stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
          function pullAlgorithm() {
            return TransformStreamDefaultSourcePullAlgorithm(stream);
          }
          function cancelAlgorithm(reason) {
            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
            return promiseResolvedWith(void 0);
          }
          stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
          stream._backpressure = void 0;
          stream._backpressureChangePromise = void 0;
          stream._backpressureChangePromise_resolve = void 0;
          TransformStreamSetBackpressure(stream, true);
          stream._transformStreamController = void 0;
        }
        function IsTransformStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_transformStreamController")) {
            return false;
          }
          return x instanceof TransformStream;
        }
        function TransformStreamError(stream, e) {
          ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
          TransformStreamErrorWritableAndUnblockWrite(stream, e);
        }
        function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
          TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
          WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
          if (stream._backpressure) {
            TransformStreamSetBackpressure(stream, false);
          }
        }
        function TransformStreamSetBackpressure(stream, backpressure) {
          if (stream._backpressureChangePromise !== void 0) {
            stream._backpressureChangePromise_resolve();
          }
          stream._backpressureChangePromise = newPromise((resolve2) => {
            stream._backpressureChangePromise_resolve = resolve2;
          });
          stream._backpressure = backpressure;
        }
        class TransformStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("desiredSize");
            }
            const readableController = this._controlledTransformStream._readable._readableStreamController;
            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
          }
          enqueue(chunk = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("enqueue");
            }
            TransformStreamDefaultControllerEnqueue(this, chunk);
          }
          error(reason = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("error");
            }
            TransformStreamDefaultControllerError(this, reason);
          }
          terminate() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("terminate");
            }
            TransformStreamDefaultControllerTerminate(this);
          }
        }
        Object.defineProperties(TransformStreamDefaultController.prototype, {
          enqueue: { enumerable: true },
          error: { enumerable: true },
          terminate: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStreamDefaultController",
            configurable: true
          });
        }
        function IsTransformStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledTransformStream")) {
            return false;
          }
          return x instanceof TransformStreamDefaultController;
        }
        function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
          controller._controlledTransformStream = stream;
          stream._transformStreamController = controller;
          controller._transformAlgorithm = transformAlgorithm;
          controller._flushAlgorithm = flushAlgorithm;
        }
        function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
          const controller = Object.create(TransformStreamDefaultController.prototype);
          let transformAlgorithm = (chunk) => {
            try {
              TransformStreamDefaultControllerEnqueue(controller, chunk);
              return promiseResolvedWith(void 0);
            } catch (transformResultE) {
              return promiseRejectedWith(transformResultE);
            }
          };
          let flushAlgorithm = () => promiseResolvedWith(void 0);
          if (transformer.transform !== void 0) {
            transformAlgorithm = (chunk) => transformer.transform(chunk, controller);
          }
          if (transformer.flush !== void 0) {
            flushAlgorithm = () => transformer.flush(controller);
          }
          SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
        }
        function TransformStreamDefaultControllerClearAlgorithms(controller) {
          controller._transformAlgorithm = void 0;
          controller._flushAlgorithm = void 0;
        }
        function TransformStreamDefaultControllerEnqueue(controller, chunk) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
            throw new TypeError("Readable side is not in a state that permits enqueue");
          }
          try {
            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
          } catch (e) {
            TransformStreamErrorWritableAndUnblockWrite(stream, e);
            throw stream._readable._storedError;
          }
          const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
          if (backpressure !== stream._backpressure) {
            TransformStreamSetBackpressure(stream, true);
          }
        }
        function TransformStreamDefaultControllerError(controller, e) {
          TransformStreamError(controller._controlledTransformStream, e);
        }
        function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
          const transformPromise = controller._transformAlgorithm(chunk);
          return transformPromiseWith(transformPromise, void 0, (r) => {
            TransformStreamError(controller._controlledTransformStream, r);
            throw r;
          });
        }
        function TransformStreamDefaultControllerTerminate(controller) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          ReadableStreamDefaultControllerClose(readableController);
          const error2 = new TypeError("TransformStream terminated");
          TransformStreamErrorWritableAndUnblockWrite(stream, error2);
        }
        function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
          const controller = stream._transformStreamController;
          if (stream._backpressure) {
            const backpressureChangePromise = stream._backpressureChangePromise;
            return transformPromiseWith(backpressureChangePromise, () => {
              const writable2 = stream._writable;
              const state = writable2._state;
              if (state === "erroring") {
                throw writable2._storedError;
              }
              return TransformStreamDefaultControllerPerformTransform(controller, chunk);
            });
          }
          return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        }
        function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
          TransformStreamError(stream, reason);
          return promiseResolvedWith(void 0);
        }
        function TransformStreamDefaultSinkCloseAlgorithm(stream) {
          const readable = stream._readable;
          const controller = stream._transformStreamController;
          const flushPromise = controller._flushAlgorithm();
          TransformStreamDefaultControllerClearAlgorithms(controller);
          return transformPromiseWith(flushPromise, () => {
            if (readable._state === "errored") {
              throw readable._storedError;
            }
            ReadableStreamDefaultControllerClose(readable._readableStreamController);
          }, (r) => {
            TransformStreamError(stream, r);
            throw readable._storedError;
          });
        }
        function TransformStreamDefaultSourcePullAlgorithm(stream) {
          TransformStreamSetBackpressure(stream, false);
          return stream._backpressureChangePromise;
        }
        function defaultControllerBrandCheckException(name) {
          return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
        }
        function streamBrandCheckException(name) {
          return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
        }
        exports2.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
        exports2.CountQueuingStrategy = CountQueuingStrategy;
        exports2.ReadableByteStreamController = ReadableByteStreamController;
        exports2.ReadableStream = ReadableStream2;
        exports2.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
        exports2.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
        exports2.ReadableStreamDefaultController = ReadableStreamDefaultController;
        exports2.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
        exports2.TransformStream = TransformStream;
        exports2.TransformStreamDefaultController = TransformStreamDefaultController;
        exports2.WritableStream = WritableStream;
        exports2.WritableStreamDefaultController = WritableStreamDefaultController;
        exports2.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    })(ponyfill_es2018, ponyfill_es2018.exports);
    POOL_SIZE$1 = 65536;
    if (!globalThis.ReadableStream) {
      try {
        Object.assign(globalThis, require("stream/web"));
      } catch (error2) {
        Object.assign(globalThis, ponyfill_es2018.exports);
      }
    }
    try {
      const { Blob: Blob3 } = require("buffer");
      if (Blob3 && !Blob3.prototype.stream) {
        Blob3.prototype.stream = function name(params) {
          let position = 0;
          const blob = this;
          return new ReadableStream({
            type: "bytes",
            async pull(ctrl) {
              const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE$1));
              const buffer = await chunk.arrayBuffer();
              position += buffer.byteLength;
              ctrl.enqueue(new Uint8Array(buffer));
              if (position === blob.size) {
                ctrl.close();
              }
            }
          });
        };
      }
    } catch (error2) {
    }
    POOL_SIZE = 65536;
    _Blob = class Blob {
      #parts = [];
      #type = "";
      #size = 0;
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let part;
          if (ArrayBuffer.isView(element)) {
            part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
          } else if (element instanceof ArrayBuffer) {
            part = new Uint8Array(element.slice(0));
          } else if (element instanceof Blob) {
            part = element;
          } else {
            part = new TextEncoder().encode(element);
          }
          size += ArrayBuffer.isView(part) ? part.byteLength : part.size;
          return part;
        });
        const type = options2.type === void 0 ? "" : String(options2.type);
        this.#type = /[^\u0020-\u007E]/.test(type) ? "" : type;
        this.#size = size;
        this.#parts = parts;
      }
      get size() {
        return this.#size;
      }
      get type() {
        return this.#type;
      }
      async text() {
        const decoder = new TextDecoder();
        let str = "";
        for await (let part of toIterator(this.#parts, false)) {
          str += decoder.decode(part, { stream: true });
        }
        str += decoder.decode();
        return str;
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of toIterator(this.#parts, false)) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        const it = toIterator(this.#parts, true);
        return new ReadableStream({
          type: "bytes",
          async pull(ctrl) {
            const chunk = await it.next();
            chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
          }
        });
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = this.#parts;
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          if (added >= span) {
            break;
          }
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            let chunk;
            if (ArrayBuffer.isView(part)) {
              chunk = part.subarray(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.byteLength;
            } else {
              chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.size;
            }
            blobParts.push(chunk);
            relativeStart = 0;
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        blob.#size = span;
        blob.#parts = blobParts;
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(_Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    Blob2 = _Blob;
    Blob$1 = Blob2;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (error_) => {
            const error2 = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
            this[INTERNALS$2].error = error2;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        import_stream.default.Readable.from(body.stream()).pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const error2 = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(error2, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw error2;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const error2 = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(error2, "code", { value: "ERR_INVALID_CHAR" });
        throw error2;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback, thisArg = void 0) {
        for (const name of this.keys()) {
          Reflect.apply(callback, thisArg, [this.get(name), name, this]);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status != null ? options2.status : 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          type: "default",
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get type() {
        return this[INTERNALS$1].type;
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          type: this.type,
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      static error() {
        const response = new Response(null, { status: 0, statusText: "" });
        response[INTERNALS$1].type = "error";
        return response;
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      type: { enumerable: true },
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal != null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/email-validator/index.js
var require_email_validator = __commonJS({
  "node_modules/email-validator/index.js"(exports) {
    init_shims();
    "use strict";
    var tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    exports.validate = function(email) {
      if (!email)
        return false;
      if (email.length > 254)
        return false;
      var valid = tester.test(email);
      if (!valid)
        return false;
      var parts = email.split("@");
      if (parts[0].length > 64)
        return false;
      var domainParts = parts[1].split(".");
      if (domainParts.some(function(part) {
        return part.length > 63;
      }))
        return false;
      return true;
    };
  }
});

// node_modules/dompurify/dist/purify.cjs.js
var require_purify_cjs = __commonJS({
  "node_modules/dompurify/dist/purify.cjs.js"(exports, module2) {
    init_shims();
    "use strict";
    function _toConsumableArray(arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
          arr2[i] = arr[i];
        }
        return arr2;
      } else {
        return Array.from(arr);
      }
    }
    var hasOwnProperty = Object.hasOwnProperty;
    var setPrototypeOf = Object.setPrototypeOf;
    var isFrozen = Object.isFrozen;
    var getPrototypeOf = Object.getPrototypeOf;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var freeze = Object.freeze;
    var seal = Object.seal;
    var create = Object.create;
    var _ref = typeof Reflect !== "undefined" && Reflect;
    var apply = _ref.apply;
    var construct = _ref.construct;
    if (!apply) {
      apply = function apply2(fun, thisValue, args) {
        return fun.apply(thisValue, args);
      };
    }
    if (!freeze) {
      freeze = function freeze2(x) {
        return x;
      };
    }
    if (!seal) {
      seal = function seal2(x) {
        return x;
      };
    }
    if (!construct) {
      construct = function construct2(Func, args) {
        return new (Function.prototype.bind.apply(Func, [null].concat(_toConsumableArray(args))))();
      };
    }
    var arrayForEach = unapply(Array.prototype.forEach);
    var arrayPop = unapply(Array.prototype.pop);
    var arrayPush = unapply(Array.prototype.push);
    var stringToLowerCase = unapply(String.prototype.toLowerCase);
    var stringMatch = unapply(String.prototype.match);
    var stringReplace = unapply(String.prototype.replace);
    var stringIndexOf = unapply(String.prototype.indexOf);
    var stringTrim = unapply(String.prototype.trim);
    var regExpTest = unapply(RegExp.prototype.test);
    var typeErrorCreate = unconstruct(TypeError);
    function unapply(func) {
      return function(thisArg) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        return apply(func, thisArg, args);
      };
    }
    function unconstruct(func) {
      return function() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return construct(func, args);
      };
    }
    function addToSet(set, array) {
      if (setPrototypeOf) {
        setPrototypeOf(set, null);
      }
      var l = array.length;
      while (l--) {
        var element = array[l];
        if (typeof element === "string") {
          var lcElement = stringToLowerCase(element);
          if (lcElement !== element) {
            if (!isFrozen(array)) {
              array[l] = lcElement;
            }
            element = lcElement;
          }
        }
        set[element] = true;
      }
      return set;
    }
    function clone2(object) {
      var newObject = create(null);
      var property = void 0;
      for (property in object) {
        if (apply(hasOwnProperty, object, [property])) {
          newObject[property] = object[property];
        }
      }
      return newObject;
    }
    function lookupGetter(object, prop) {
      while (object !== null) {
        var desc = getOwnPropertyDescriptor(object, prop);
        if (desc) {
          if (desc.get) {
            return unapply(desc.get);
          }
          if (typeof desc.value === "function") {
            return unapply(desc.value);
          }
        }
        object = getPrototypeOf(object);
      }
      function fallbackValue(element) {
        console.warn("fallback value for", element);
        return null;
      }
      return fallbackValue;
    }
    var html = freeze(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]);
    var svg = freeze(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]);
    var svgFilters = freeze(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]);
    var svgDisallowed = freeze(["animate", "color-profile", "cursor", "discard", "fedropshadow", "feimage", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]);
    var mathMl = freeze(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover"]);
    var mathMlDisallowed = freeze(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]);
    var text = freeze(["#text"]);
    var html$1 = freeze(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "xmlns", "slot"]);
    var svg$1 = freeze(["accent-height", "accumulate", "additive", "alignment-baseline", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "targetx", "targety", "transform", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]);
    var mathMl$1 = freeze(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]);
    var xml = freeze(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]);
    var MUSTACHE_EXPR = seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm);
    var ERB_EXPR = seal(/<%[\s\S]*|[\s\S]*%>/gm);
    var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/);
    var ARIA_ATTR = seal(/^aria-[\-\w]+$/);
    var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i);
    var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
    var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g);
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    function _toConsumableArray$1(arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
          arr2[i] = arr[i];
        }
        return arr2;
      } else {
        return Array.from(arr);
      }
    }
    var getGlobal = function getGlobal2() {
      return typeof window === "undefined" ? null : window;
    };
    var _createTrustedTypesPolicy = function _createTrustedTypesPolicy2(trustedTypes, document2) {
      if ((typeof trustedTypes === "undefined" ? "undefined" : _typeof(trustedTypes)) !== "object" || typeof trustedTypes.createPolicy !== "function") {
        return null;
      }
      var suffix = null;
      var ATTR_NAME = "data-tt-policy-suffix";
      if (document2.currentScript && document2.currentScript.hasAttribute(ATTR_NAME)) {
        suffix = document2.currentScript.getAttribute(ATTR_NAME);
      }
      var policyName = "dompurify" + (suffix ? "#" + suffix : "");
      try {
        return trustedTypes.createPolicy(policyName, {
          createHTML: function createHTML(html$$1) {
            return html$$1;
          }
        });
      } catch (_) {
        console.warn("TrustedTypes policy " + policyName + " could not be created.");
        return null;
      }
    };
    function createDOMPurify() {
      var window2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : getGlobal();
      var DOMPurify = function DOMPurify2(root) {
        return createDOMPurify(root);
      };
      DOMPurify.version = "2.3.3";
      DOMPurify.removed = [];
      if (!window2 || !window2.document || window2.document.nodeType !== 9) {
        DOMPurify.isSupported = false;
        return DOMPurify;
      }
      var originalDocument = window2.document;
      var document2 = window2.document;
      var DocumentFragment = window2.DocumentFragment, HTMLTemplateElement = window2.HTMLTemplateElement, Node = window2.Node, Element = window2.Element, NodeFilter = window2.NodeFilter, _window$NamedNodeMap = window2.NamedNodeMap, NamedNodeMap = _window$NamedNodeMap === void 0 ? window2.NamedNodeMap || window2.MozNamedAttrMap : _window$NamedNodeMap, Text = window2.Text, Comment = window2.Comment, DOMParser = window2.DOMParser, trustedTypes = window2.trustedTypes;
      var ElementPrototype = Element.prototype;
      var cloneNode = lookupGetter(ElementPrototype, "cloneNode");
      var getNextSibling = lookupGetter(ElementPrototype, "nextSibling");
      var getChildNodes = lookupGetter(ElementPrototype, "childNodes");
      var getParentNode = lookupGetter(ElementPrototype, "parentNode");
      if (typeof HTMLTemplateElement === "function") {
        var template2 = document2.createElement("template");
        if (template2.content && template2.content.ownerDocument) {
          document2 = template2.content.ownerDocument;
        }
      }
      var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);
      var emptyHTML = trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML("") : "";
      var _document = document2, implementation = _document.implementation, createNodeIterator = _document.createNodeIterator, createDocumentFragment = _document.createDocumentFragment, getElementsByTagName = _document.getElementsByTagName;
      var importNode = originalDocument.importNode;
      var documentMode = {};
      try {
        documentMode = clone2(document2).documentMode ? document2.documentMode : {};
      } catch (_) {
      }
      var hooks = {};
      DOMPurify.isSupported = typeof getParentNode === "function" && implementation && typeof implementation.createHTMLDocument !== "undefined" && documentMode !== 9;
      var MUSTACHE_EXPR$$1 = MUSTACHE_EXPR, ERB_EXPR$$1 = ERB_EXPR, DATA_ATTR$$1 = DATA_ATTR, ARIA_ATTR$$1 = ARIA_ATTR, IS_SCRIPT_OR_DATA$$1 = IS_SCRIPT_OR_DATA, ATTR_WHITESPACE$$1 = ATTR_WHITESPACE;
      var IS_ALLOWED_URI$$1 = IS_ALLOWED_URI;
      var ALLOWED_TAGS = null;
      var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(html), _toConsumableArray$1(svg), _toConsumableArray$1(svgFilters), _toConsumableArray$1(mathMl), _toConsumableArray$1(text)));
      var ALLOWED_ATTR = null;
      var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray$1(html$1), _toConsumableArray$1(svg$1), _toConsumableArray$1(mathMl$1), _toConsumableArray$1(xml)));
      var FORBID_TAGS = null;
      var FORBID_ATTR = null;
      var ALLOW_ARIA_ATTR = true;
      var ALLOW_DATA_ATTR = true;
      var ALLOW_UNKNOWN_PROTOCOLS = false;
      var SAFE_FOR_TEMPLATES = false;
      var WHOLE_DOCUMENT = false;
      var SET_CONFIG = false;
      var FORCE_BODY = false;
      var RETURN_DOM = false;
      var RETURN_DOM_FRAGMENT = false;
      var RETURN_DOM_IMPORT = true;
      var RETURN_TRUSTED_TYPE = false;
      var SANITIZE_DOM = true;
      var KEEP_CONTENT = true;
      var IN_PLACE = false;
      var USE_PROFILES = {};
      var FORBID_CONTENTS = null;
      var DEFAULT_FORBID_CONTENTS = addToSet({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
      var DATA_URI_TAGS = null;
      var DEFAULT_DATA_URI_TAGS = addToSet({}, ["audio", "video", "img", "source", "image", "track"]);
      var URI_SAFE_ATTRIBUTES = null;
      var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]);
      var MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
      var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
      var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
      var NAMESPACE = HTML_NAMESPACE;
      var IS_EMPTY_INPUT = false;
      var PARSER_MEDIA_TYPE = void 0;
      var SUPPORTED_PARSER_MEDIA_TYPES = ["application/xhtml+xml", "text/html"];
      var DEFAULT_PARSER_MEDIA_TYPE = "text/html";
      var transformCaseFunc = void 0;
      var CONFIG = null;
      var formElement = document2.createElement("form");
      var _parseConfig = function _parseConfig2(cfg) {
        if (CONFIG && CONFIG === cfg) {
          return;
        }
        if (!cfg || (typeof cfg === "undefined" ? "undefined" : _typeof(cfg)) !== "object") {
          cfg = {};
        }
        cfg = clone2(cfg);
        ALLOWED_TAGS = "ALLOWED_TAGS" in cfg ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
        ALLOWED_ATTR = "ALLOWED_ATTR" in cfg ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
        URI_SAFE_ATTRIBUTES = "ADD_URI_SAFE_ATTR" in cfg ? addToSet(clone2(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR) : DEFAULT_URI_SAFE_ATTRIBUTES;
        DATA_URI_TAGS = "ADD_DATA_URI_TAGS" in cfg ? addToSet(clone2(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS) : DEFAULT_DATA_URI_TAGS;
        FORBID_CONTENTS = "FORBID_CONTENTS" in cfg ? addToSet({}, cfg.FORBID_CONTENTS) : DEFAULT_FORBID_CONTENTS;
        FORBID_TAGS = "FORBID_TAGS" in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
        FORBID_ATTR = "FORBID_ATTR" in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
        USE_PROFILES = "USE_PROFILES" in cfg ? cfg.USE_PROFILES : false;
        ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false;
        ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false;
        ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false;
        SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false;
        WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false;
        RETURN_DOM = cfg.RETURN_DOM || false;
        RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false;
        RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT !== false;
        RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false;
        FORCE_BODY = cfg.FORCE_BODY || false;
        SANITIZE_DOM = cfg.SANITIZE_DOM !== false;
        KEEP_CONTENT = cfg.KEEP_CONTENT !== false;
        IN_PLACE = cfg.IN_PLACE || false;
        IS_ALLOWED_URI$$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$$1;
        NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
        PARSER_MEDIA_TYPE = SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? PARSER_MEDIA_TYPE = DEFAULT_PARSER_MEDIA_TYPE : PARSER_MEDIA_TYPE = cfg.PARSER_MEDIA_TYPE;
        transformCaseFunc = PARSER_MEDIA_TYPE === "application/xhtml+xml" ? function(x) {
          return x;
        } : stringToLowerCase;
        if (SAFE_FOR_TEMPLATES) {
          ALLOW_DATA_ATTR = false;
        }
        if (RETURN_DOM_FRAGMENT) {
          RETURN_DOM = true;
        }
        if (USE_PROFILES) {
          ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(text)));
          ALLOWED_ATTR = [];
          if (USE_PROFILES.html === true) {
            addToSet(ALLOWED_TAGS, html);
            addToSet(ALLOWED_ATTR, html$1);
          }
          if (USE_PROFILES.svg === true) {
            addToSet(ALLOWED_TAGS, svg);
            addToSet(ALLOWED_ATTR, svg$1);
            addToSet(ALLOWED_ATTR, xml);
          }
          if (USE_PROFILES.svgFilters === true) {
            addToSet(ALLOWED_TAGS, svgFilters);
            addToSet(ALLOWED_ATTR, svg$1);
            addToSet(ALLOWED_ATTR, xml);
          }
          if (USE_PROFILES.mathMl === true) {
            addToSet(ALLOWED_TAGS, mathMl);
            addToSet(ALLOWED_ATTR, mathMl$1);
            addToSet(ALLOWED_ATTR, xml);
          }
        }
        if (cfg.ADD_TAGS) {
          if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
            ALLOWED_TAGS = clone2(ALLOWED_TAGS);
          }
          addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
        }
        if (cfg.ADD_ATTR) {
          if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
            ALLOWED_ATTR = clone2(ALLOWED_ATTR);
          }
          addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
        }
        if (cfg.ADD_URI_SAFE_ATTR) {
          addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
        }
        if (cfg.FORBID_CONTENTS) {
          if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
            FORBID_CONTENTS = clone2(FORBID_CONTENTS);
          }
          addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS);
        }
        if (KEEP_CONTENT) {
          ALLOWED_TAGS["#text"] = true;
        }
        if (WHOLE_DOCUMENT) {
          addToSet(ALLOWED_TAGS, ["html", "head", "body"]);
        }
        if (ALLOWED_TAGS.table) {
          addToSet(ALLOWED_TAGS, ["tbody"]);
          delete FORBID_TAGS.tbody;
        }
        if (freeze) {
          freeze(cfg);
        }
        CONFIG = cfg;
      };
      var MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ["mi", "mo", "mn", "ms", "mtext"]);
      var HTML_INTEGRATION_POINTS = addToSet({}, ["foreignobject", "desc", "title", "annotation-xml"]);
      var ALL_SVG_TAGS = addToSet({}, svg);
      addToSet(ALL_SVG_TAGS, svgFilters);
      addToSet(ALL_SVG_TAGS, svgDisallowed);
      var ALL_MATHML_TAGS = addToSet({}, mathMl);
      addToSet(ALL_MATHML_TAGS, mathMlDisallowed);
      var _checkValidNamespace = function _checkValidNamespace2(element) {
        var parent = getParentNode(element);
        if (!parent || !parent.tagName) {
          parent = {
            namespaceURI: HTML_NAMESPACE,
            tagName: "template"
          };
        }
        var tagName = stringToLowerCase(element.tagName);
        var parentTagName = stringToLowerCase(parent.tagName);
        if (element.namespaceURI === SVG_NAMESPACE) {
          if (parent.namespaceURI === HTML_NAMESPACE) {
            return tagName === "svg";
          }
          if (parent.namespaceURI === MATHML_NAMESPACE) {
            return tagName === "svg" && (parentTagName === "annotation-xml" || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
          }
          return Boolean(ALL_SVG_TAGS[tagName]);
        }
        if (element.namespaceURI === MATHML_NAMESPACE) {
          if (parent.namespaceURI === HTML_NAMESPACE) {
            return tagName === "math";
          }
          if (parent.namespaceURI === SVG_NAMESPACE) {
            return tagName === "math" && HTML_INTEGRATION_POINTS[parentTagName];
          }
          return Boolean(ALL_MATHML_TAGS[tagName]);
        }
        if (element.namespaceURI === HTML_NAMESPACE) {
          if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
            return false;
          }
          if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
            return false;
          }
          var commonSvgAndHTMLElements = addToSet({}, ["title", "style", "font", "a", "script"]);
          return !ALL_MATHML_TAGS[tagName] && (commonSvgAndHTMLElements[tagName] || !ALL_SVG_TAGS[tagName]);
        }
        return false;
      };
      var _forceRemove = function _forceRemove2(node) {
        arrayPush(DOMPurify.removed, { element: node });
        try {
          node.parentNode.removeChild(node);
        } catch (_) {
          try {
            node.outerHTML = emptyHTML;
          } catch (_2) {
            node.remove();
          }
        }
      };
      var _removeAttribute = function _removeAttribute2(name, node) {
        try {
          arrayPush(DOMPurify.removed, {
            attribute: node.getAttributeNode(name),
            from: node
          });
        } catch (_) {
          arrayPush(DOMPurify.removed, {
            attribute: null,
            from: node
          });
        }
        node.removeAttribute(name);
        if (name === "is" && !ALLOWED_ATTR[name]) {
          if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
            try {
              _forceRemove(node);
            } catch (_) {
            }
          } else {
            try {
              node.setAttribute(name, "");
            } catch (_) {
            }
          }
        }
      };
      var _initDocument = function _initDocument2(dirty) {
        var doc = void 0;
        var leadingWhitespace = void 0;
        if (FORCE_BODY) {
          dirty = "<remove></remove>" + dirty;
        } else {
          var matches = stringMatch(dirty, /^[\r\n\t ]+/);
          leadingWhitespace = matches && matches[0];
        }
        if (PARSER_MEDIA_TYPE === "application/xhtml+xml") {
          dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + "</body></html>";
        }
        var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
        if (NAMESPACE === HTML_NAMESPACE) {
          try {
            doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
          } catch (_) {
          }
        }
        if (!doc || !doc.documentElement) {
          doc = implementation.createDocument(NAMESPACE, "template", null);
          try {
            doc.documentElement.innerHTML = IS_EMPTY_INPUT ? "" : dirtyPayload;
          } catch (_) {
          }
        }
        var body = doc.body || doc.documentElement;
        if (dirty && leadingWhitespace) {
          body.insertBefore(document2.createTextNode(leadingWhitespace), body.childNodes[0] || null);
        }
        if (NAMESPACE === HTML_NAMESPACE) {
          return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? "html" : "body")[0];
        }
        return WHOLE_DOCUMENT ? doc.documentElement : body;
      };
      var _createIterator = function _createIterator2(root) {
        return createNodeIterator.call(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, null, false);
      };
      var _isClobbered = function _isClobbered2(elm) {
        if (elm instanceof Text || elm instanceof Comment) {
          return false;
        }
        if (typeof elm.nodeName !== "string" || typeof elm.textContent !== "string" || typeof elm.removeChild !== "function" || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== "function" || typeof elm.setAttribute !== "function" || typeof elm.namespaceURI !== "string" || typeof elm.insertBefore !== "function") {
          return true;
        }
        return false;
      };
      var _isNode = function _isNode2(object) {
        return (typeof Node === "undefined" ? "undefined" : _typeof(Node)) === "object" ? object instanceof Node : object && (typeof object === "undefined" ? "undefined" : _typeof(object)) === "object" && typeof object.nodeType === "number" && typeof object.nodeName === "string";
      };
      var _executeHook = function _executeHook2(entryPoint, currentNode, data) {
        if (!hooks[entryPoint]) {
          return;
        }
        arrayForEach(hooks[entryPoint], function(hook) {
          hook.call(DOMPurify, currentNode, data, CONFIG);
        });
      };
      var _sanitizeElements = function _sanitizeElements2(currentNode) {
        var content = void 0;
        _executeHook("beforeSanitizeElements", currentNode, null);
        if (_isClobbered(currentNode)) {
          _forceRemove(currentNode);
          return true;
        }
        if (stringMatch(currentNode.nodeName, /[\u0080-\uFFFF]/)) {
          _forceRemove(currentNode);
          return true;
        }
        var tagName = transformCaseFunc(currentNode.nodeName);
        _executeHook("uponSanitizeElement", currentNode, {
          tagName,
          allowedTags: ALLOWED_TAGS
        });
        if (!_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
          _forceRemove(currentNode);
          return true;
        }
        if (tagName === "select" && regExpTest(/<template/i, currentNode.innerHTML)) {
          _forceRemove(currentNode);
          return true;
        }
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
            var parentNode = getParentNode(currentNode) || currentNode.parentNode;
            var childNodes = getChildNodes(currentNode) || currentNode.childNodes;
            if (childNodes && parentNode) {
              var childCount = childNodes.length;
              for (var i = childCount - 1; i >= 0; --i) {
                parentNode.insertBefore(cloneNode(childNodes[i], true), getNextSibling(currentNode));
              }
            }
          }
          _forceRemove(currentNode);
          return true;
        }
        if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
          _forceRemove(currentNode);
          return true;
        }
        if ((tagName === "noscript" || tagName === "noembed") && regExpTest(/<\/no(script|embed)/i, currentNode.innerHTML)) {
          _forceRemove(currentNode);
          return true;
        }
        if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
          content = currentNode.textContent;
          content = stringReplace(content, MUSTACHE_EXPR$$1, " ");
          content = stringReplace(content, ERB_EXPR$$1, " ");
          if (currentNode.textContent !== content) {
            arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
            currentNode.textContent = content;
          }
        }
        _executeHook("afterSanitizeElements", currentNode, null);
        return false;
      };
      var _isValidAttribute = function _isValidAttribute2(lcTag, lcName, value) {
        if (SANITIZE_DOM && (lcName === "id" || lcName === "name") && (value in document2 || value in formElement)) {
          return false;
        }
        if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR$$1, lcName))
          ;
        else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$$1, lcName))
          ;
        else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
          return false;
        } else if (URI_SAFE_ATTRIBUTES[lcName])
          ;
        else if (regExpTest(IS_ALLOWED_URI$$1, stringReplace(value, ATTR_WHITESPACE$$1, "")))
          ;
        else if ((lcName === "src" || lcName === "xlink:href" || lcName === "href") && lcTag !== "script" && stringIndexOf(value, "data:") === 0 && DATA_URI_TAGS[lcTag])
          ;
        else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$$1, stringReplace(value, ATTR_WHITESPACE$$1, "")))
          ;
        else if (!value)
          ;
        else {
          return false;
        }
        return true;
      };
      var _sanitizeAttributes = function _sanitizeAttributes2(currentNode) {
        var attr = void 0;
        var value = void 0;
        var lcName = void 0;
        var l = void 0;
        _executeHook("beforeSanitizeAttributes", currentNode, null);
        var attributes = currentNode.attributes;
        if (!attributes) {
          return;
        }
        var hookEvent = {
          attrName: "",
          attrValue: "",
          keepAttr: true,
          allowedAttributes: ALLOWED_ATTR
        };
        l = attributes.length;
        while (l--) {
          attr = attributes[l];
          var _attr = attr, name = _attr.name, namespaceURI = _attr.namespaceURI;
          value = stringTrim(attr.value);
          lcName = transformCaseFunc(name);
          hookEvent.attrName = lcName;
          hookEvent.attrValue = value;
          hookEvent.keepAttr = true;
          hookEvent.forceKeepAttr = void 0;
          _executeHook("uponSanitizeAttribute", currentNode, hookEvent);
          value = hookEvent.attrValue;
          if (hookEvent.forceKeepAttr) {
            continue;
          }
          _removeAttribute(name, currentNode);
          if (!hookEvent.keepAttr) {
            continue;
          }
          if (regExpTest(/\/>/i, value)) {
            _removeAttribute(name, currentNode);
            continue;
          }
          if (SAFE_FOR_TEMPLATES) {
            value = stringReplace(value, MUSTACHE_EXPR$$1, " ");
            value = stringReplace(value, ERB_EXPR$$1, " ");
          }
          var lcTag = transformCaseFunc(currentNode.nodeName);
          if (!_isValidAttribute(lcTag, lcName, value)) {
            continue;
          }
          try {
            if (namespaceURI) {
              currentNode.setAttributeNS(namespaceURI, name, value);
            } else {
              currentNode.setAttribute(name, value);
            }
            arrayPop(DOMPurify.removed);
          } catch (_) {
          }
        }
        _executeHook("afterSanitizeAttributes", currentNode, null);
      };
      var _sanitizeShadowDOM = function _sanitizeShadowDOM2(fragment) {
        var shadowNode = void 0;
        var shadowIterator = _createIterator(fragment);
        _executeHook("beforeSanitizeShadowDOM", fragment, null);
        while (shadowNode = shadowIterator.nextNode()) {
          _executeHook("uponSanitizeShadowNode", shadowNode, null);
          if (_sanitizeElements(shadowNode)) {
            continue;
          }
          if (shadowNode.content instanceof DocumentFragment) {
            _sanitizeShadowDOM2(shadowNode.content);
          }
          _sanitizeAttributes(shadowNode);
        }
        _executeHook("afterSanitizeShadowDOM", fragment, null);
      };
      DOMPurify.sanitize = function(dirty, cfg) {
        var body = void 0;
        var importedNode = void 0;
        var currentNode = void 0;
        var oldNode = void 0;
        var returnNode = void 0;
        IS_EMPTY_INPUT = !dirty;
        if (IS_EMPTY_INPUT) {
          dirty = "<!-->";
        }
        if (typeof dirty !== "string" && !_isNode(dirty)) {
          if (typeof dirty.toString !== "function") {
            throw typeErrorCreate("toString is not a function");
          } else {
            dirty = dirty.toString();
            if (typeof dirty !== "string") {
              throw typeErrorCreate("dirty is not a string, aborting");
            }
          }
        }
        if (!DOMPurify.isSupported) {
          if (_typeof(window2.toStaticHTML) === "object" || typeof window2.toStaticHTML === "function") {
            if (typeof dirty === "string") {
              return window2.toStaticHTML(dirty);
            }
            if (_isNode(dirty)) {
              return window2.toStaticHTML(dirty.outerHTML);
            }
          }
          return dirty;
        }
        if (!SET_CONFIG) {
          _parseConfig(cfg);
        }
        DOMPurify.removed = [];
        if (typeof dirty === "string") {
          IN_PLACE = false;
        }
        if (IN_PLACE)
          ;
        else if (dirty instanceof Node) {
          body = _initDocument("<!---->");
          importedNode = body.ownerDocument.importNode(dirty, true);
          if (importedNode.nodeType === 1 && importedNode.nodeName === "BODY") {
            body = importedNode;
          } else if (importedNode.nodeName === "HTML") {
            body = importedNode;
          } else {
            body.appendChild(importedNode);
          }
        } else {
          if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && dirty.indexOf("<") === -1) {
            return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
          }
          body = _initDocument(dirty);
          if (!body) {
            return RETURN_DOM ? null : emptyHTML;
          }
        }
        if (body && FORCE_BODY) {
          _forceRemove(body.firstChild);
        }
        var nodeIterator = _createIterator(IN_PLACE ? dirty : body);
        while (currentNode = nodeIterator.nextNode()) {
          if (currentNode.nodeType === 3 && currentNode === oldNode) {
            continue;
          }
          if (_sanitizeElements(currentNode)) {
            continue;
          }
          if (currentNode.content instanceof DocumentFragment) {
            _sanitizeShadowDOM(currentNode.content);
          }
          _sanitizeAttributes(currentNode);
          oldNode = currentNode;
        }
        oldNode = null;
        if (IN_PLACE) {
          return dirty;
        }
        if (RETURN_DOM) {
          if (RETURN_DOM_FRAGMENT) {
            returnNode = createDocumentFragment.call(body.ownerDocument);
            while (body.firstChild) {
              returnNode.appendChild(body.firstChild);
            }
          } else {
            returnNode = body;
          }
          if (RETURN_DOM_IMPORT) {
            returnNode = importNode.call(originalDocument, returnNode, true);
          }
          return returnNode;
        }
        var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
        if (SAFE_FOR_TEMPLATES) {
          serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$$1, " ");
          serializedHTML = stringReplace(serializedHTML, ERB_EXPR$$1, " ");
        }
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
      };
      DOMPurify.setConfig = function(cfg) {
        _parseConfig(cfg);
        SET_CONFIG = true;
      };
      DOMPurify.clearConfig = function() {
        CONFIG = null;
        SET_CONFIG = false;
      };
      DOMPurify.isValidAttribute = function(tag, attr, value) {
        if (!CONFIG) {
          _parseConfig({});
        }
        var lcTag = transformCaseFunc(tag);
        var lcName = transformCaseFunc(attr);
        return _isValidAttribute(lcTag, lcName, value);
      };
      DOMPurify.addHook = function(entryPoint, hookFunction) {
        if (typeof hookFunction !== "function") {
          return;
        }
        hooks[entryPoint] = hooks[entryPoint] || [];
        arrayPush(hooks[entryPoint], hookFunction);
      };
      DOMPurify.removeHook = function(entryPoint) {
        if (hooks[entryPoint]) {
          arrayPop(hooks[entryPoint]);
        }
      };
      DOMPurify.removeHooks = function(entryPoint) {
        if (hooks[entryPoint]) {
          hooks[entryPoint] = [];
        }
      };
      DOMPurify.removeAllHooks = function() {
        hooks = {};
      };
      return DOMPurify;
    }
    var purify = createDOMPurify();
    module2.exports = purify;
  }
});

// node_modules/emailjs-com/cjs/store/store.js
var require_store = __commonJS({
  "node_modules/emailjs-com/cjs/store/store.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.store = void 0;
    exports.store = {
      _origin: "https://api.emailjs.com"
    };
  }
});

// node_modules/emailjs-com/cjs/methods/init/init.js
var require_init = __commonJS({
  "node_modules/emailjs-com/cjs/methods/init/init.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    var store_1 = require_store();
    var init2 = (userID, origin = "https://api.emailjs.com") => {
      store_1.store._userID = userID;
      store_1.store._origin = origin;
    };
    exports.init = init2;
  }
});

// node_modules/emailjs-com/cjs/utils/validateParams.js
var require_validateParams = __commonJS({
  "node_modules/emailjs-com/cjs/utils/validateParams.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateParams = void 0;
    var validateParams = (userID, serviceID, templateID) => {
      if (!userID) {
        throw "The user ID is required. Visit https://dashboard.emailjs.com/admin/integration";
      }
      if (!serviceID) {
        throw "The service ID is required. Visit https://dashboard.emailjs.com/admin";
      }
      if (!templateID) {
        throw "The template ID is required. Visit https://dashboard.emailjs.com/admin/templates";
      }
      return true;
    };
    exports.validateParams = validateParams;
  }
});

// node_modules/emailjs-com/cjs/models/EmailJSResponseStatus.js
var require_EmailJSResponseStatus = __commonJS({
  "node_modules/emailjs-com/cjs/models/EmailJSResponseStatus.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmailJSResponseStatus = void 0;
    var EmailJSResponseStatus = class {
      constructor(httpResponse) {
        this.status = httpResponse.status;
        this.text = httpResponse.responseText;
      }
    };
    exports.EmailJSResponseStatus = EmailJSResponseStatus;
  }
});

// node_modules/emailjs-com/cjs/api/sendPost.js
var require_sendPost = __commonJS({
  "node_modules/emailjs-com/cjs/api/sendPost.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sendPost = void 0;
    var EmailJSResponseStatus_1 = require_EmailJSResponseStatus();
    var store_1 = require_store();
    var sendPost = (url, data, headers = {}) => {
      return new Promise((resolve2, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", ({ target }) => {
          const responseStatus = new EmailJSResponseStatus_1.EmailJSResponseStatus(target);
          if (responseStatus.status === 200 || responseStatus.text === "OK") {
            resolve2(responseStatus);
          } else {
            reject(responseStatus);
          }
        });
        xhr.addEventListener("error", ({ target }) => {
          reject(new EmailJSResponseStatus_1.EmailJSResponseStatus(target));
        });
        xhr.open("POST", store_1.store._origin + url, true);
        Object.keys(headers).forEach((key) => {
          xhr.setRequestHeader(key, headers[key]);
        });
        xhr.send(data);
      });
    };
    exports.sendPost = sendPost;
  }
});

// node_modules/emailjs-com/cjs/methods/send/send.js
var require_send = __commonJS({
  "node_modules/emailjs-com/cjs/methods/send/send.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.send = void 0;
    var store_1 = require_store();
    var validateParams_1 = require_validateParams();
    var sendPost_1 = require_sendPost();
    var send = (serviceID, templateID, templatePrams, userID) => {
      const uID = userID || store_1.store._userID;
      validateParams_1.validateParams(uID, serviceID, templateID);
      const params = {
        lib_version: "3.2.0",
        user_id: uID,
        service_id: serviceID,
        template_id: templateID,
        template_params: templatePrams
      };
      return sendPost_1.sendPost("/api/v1.0/email/send", JSON.stringify(params), {
        "Content-type": "application/json"
      });
    };
    exports.send = send;
  }
});

// node_modules/emailjs-com/cjs/methods/sendForm/sendForm.js
var require_sendForm = __commonJS({
  "node_modules/emailjs-com/cjs/methods/sendForm/sendForm.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sendForm = void 0;
    var store_1 = require_store();
    var validateParams_1 = require_validateParams();
    var sendPost_1 = require_sendPost();
    var findHTMLForm = (form) => {
      let currentForm;
      if (typeof form === "string") {
        currentForm = document.querySelector(form);
      } else {
        currentForm = form;
      }
      if (!currentForm || currentForm.nodeName !== "FORM") {
        throw "The 3rd parameter is expected to be the HTML form element or the style selector of form";
      }
      return currentForm;
    };
    var sendForm = (serviceID, templateID, form, userID) => {
      const uID = userID || store_1.store._userID;
      const currentForm = findHTMLForm(form);
      validateParams_1.validateParams(uID, serviceID, templateID);
      const formData = new FormData(currentForm);
      formData.append("lib_version", "3.2.0");
      formData.append("service_id", serviceID);
      formData.append("template_id", templateID);
      formData.append("user_id", uID);
      return sendPost_1.sendPost("/api/v1.0/email/send-form", formData);
    };
    exports.sendForm = sendForm;
  }
});

// node_modules/emailjs-com/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/emailjs-com/cjs/index.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sendForm = exports.send = exports.init = void 0;
    var init_1 = require_init();
    Object.defineProperty(exports, "init", { enumerable: true, get: function() {
      return init_1.init;
    } });
    var send_1 = require_send();
    Object.defineProperty(exports, "send", { enumerable: true, get: function() {
      return send_1.send;
    } });
    var sendForm_1 = require_sendForm();
    Object.defineProperty(exports, "sendForm", { enumerable: true, get: function() {
      return sendForm_1.sendForm;
    } });
    exports.default = {
      init: init_1.init,
      send: send_1.send,
      sendForm: sendForm_1.sendForm
    };
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();
var import_email_validator = __toModule(require_email_validator());
var import_dompurify = __toModule(require_purify_cjs());
var import_emailjs_com = __toModule(require_cjs());
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler2) {
    return;
  }
  const params = route.params(match);
  const response = await handler2({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
var escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page: page2
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2 && page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${page2 && page2.path ? try_serialize(page2.path, (error3) => {
      throw new Error(`Failed to serialize page.path: ${error3.message}`);
    }) : null},
						query: new URLSearchParams(${page2 && page2.query ? s$1(page2.query.toString()) : ""}),
						params: ${page2 && page2.params ? try_serialize(page2.params, (error3) => {
      throw new Error(`Failed to serialize page.params: ${error3.message}`);
    }) : null}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page2, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page2.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, _receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page: page2
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page: page2
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
Promise.resolve();
var escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$i = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\texport let props_3 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}>\\n\\t\\t\\t\\t\\t{#if components[3]}\\n\\t\\t\\t\\t\\t\\t<svelte:component this={components[3]} {...(props_3 || {})}/>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</svelte:component>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AA2DC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  let { props_3 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  if ($$props.props_3 === void 0 && $$bindings.props_3 && props_3 !== void 0)
    $$bindings.props_3(props_3);
  $$result.css.add(css$i);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {
        default: () => `${components[3] ? `${validate_component(components[3] || missing_component, "svelte:component").$$render($$result, Object.assign(props_3 || {}), {}, {})}` : ``}`
      })}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="preconnect" href="https://fonts.googleapis.com" />\n		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n		<link rel="preconnect" href="https://fonts.googleapis.com" />\n		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n		<link\n			href="https://fonts.googleapis.com/css2?family=Gochi+Hand&family=Roboto:ital,wght@0,300;0,400;0,700;1,100&display=swap"\n			rel="stylesheet"\n		/>\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-707897fa.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-707897fa.js", assets + "/_app/chunks/vendor-524e618c.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "FS0A5054.png", "size": 452177, "type": "image/png" }, { "file": "IMG_0261.png", "size": 469487, "type": "image/png" }, { "file": "IMG_1521.jpeg", "size": 315966, "type": "image/jpeg" }, { "file": "Loose_lips_might_sink_ships.jpeg", "size": 490531, "type": "image/jpeg" }, { "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "geo_at_sea.jpeg", "size": 30610, "type": "image/jpeg" }, { "file": "iconfinder_social-linkedin-circle_771370.png", "size": 16440, "type": "image/png" }, { "file": "pexels-pixabay-270373.jpg", "size": 953883, "type": "image/jpeg" }, { "file": "pexels-pixabay-60504.jpg", "size": 1152439, "type": "image/jpeg" }, { "file": "portfoliumIcon.png", "size": 11057, "type": "image/png" }, { "file": "satellite-svgrepo-com.svg", "size": 4561, "type": "image/svg+xml" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/experience\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/experience/__layout.svelte", "src/routes/experience/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/experience\/experienceComponents\/EducationCertifications\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/experience/__layout.svelte", "src/routes/experience/experienceComponents/EducationCertifications.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/experience\/experienceComponents\/SecurityManagement\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/experience/__layout.svelte", "src/routes/experience/experienceComponents/SecurityManagement.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/experience\/experienceComponents\/ExperienceHeader\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/experience/__layout.svelte", "src/routes/experience/experienceComponents/ExperienceHeader.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/experience\/experienceComponents\/ExperienceStyles\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/experience/__layout.svelte", "src/routes/experience/experienceComponents/ExperienceStyles.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/experience\/experienceComponents\/NetworkSecurity\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/experience/__layout.svelte", "src/routes/experience/experienceComponents/NetworkSecurity.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/experience\/experienceComponents\/GeneralContent\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/experience/__layout.svelte", "src/routes/experience/experienceComponents/GeneralContent.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/experience\/experienceComponents\/WebDevelopment\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/experience/__layout.svelte", "src/routes/experience/experienceComponents/WebDevelopment.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/experience\/experienceComponents\/GlobeText\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/experience/__layout.svelte", "src/routes/experience/experienceComponents/GlobeText.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/contact\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/contact.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/aboutComponents\/AboutBackstory\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about/aboutComponents/AboutBackstory.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/aboutComponents\/AboutStyles\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about/aboutComponents/AboutStyles.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/aboutComponents\/AboutBluf\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about/aboutComponents/AboutBluf.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout$1;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$2;
  }),
  "src/routes/experience/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/experience/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/experience/experienceComponents/EducationCertifications.svelte": () => Promise.resolve().then(function() {
    return EducationCertifications$1;
  }),
  "src/routes/experience/experienceComponents/SecurityManagement.svelte": () => Promise.resolve().then(function() {
    return SecurityManagement$1;
  }),
  "src/routes/experience/experienceComponents/ExperienceHeader.svelte": () => Promise.resolve().then(function() {
    return ExperienceHeader$1;
  }),
  "src/routes/experience/experienceComponents/ExperienceStyles.svelte": () => Promise.resolve().then(function() {
    return ExperienceStyles$1;
  }),
  "src/routes/experience/experienceComponents/NetworkSecurity.svelte": () => Promise.resolve().then(function() {
    return NetworkSecurity$1;
  }),
  "src/routes/experience/experienceComponents/GeneralContent.svelte": () => Promise.resolve().then(function() {
    return GeneralContent$1;
  }),
  "src/routes/experience/experienceComponents/WebDevelopment.svelte": () => Promise.resolve().then(function() {
    return WebDevelopment$1;
  }),
  "src/routes/experience/experienceComponents/GlobeText.svelte": () => Promise.resolve().then(function() {
    return GlobeText$1;
  }),
  "src/routes/contact.svelte": () => Promise.resolve().then(function() {
    return contact;
  }),
  "src/routes/about/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/about/aboutComponents/AboutBackstory.svelte": () => Promise.resolve().then(function() {
    return AboutBackstory$1;
  }),
  "src/routes/about/aboutComponents/AboutStyles.svelte": () => Promise.resolve().then(function() {
    return AboutStyles$1;
  }),
  "src/routes/about/aboutComponents/AboutBluf.svelte": () => Promise.resolve().then(function() {
    return AboutBluf$1;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-142ef78a.js", "css": ["assets/pages/__layout.svelte-2a51a5b2.css"], "js": ["pages/__layout.svelte-142ef78a.js", "chunks/vendor-524e618c.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-d3238427.js", "css": [], "js": ["error.svelte-d3238427.js", "chunks/vendor-524e618c.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-ee331045.js", "css": ["assets/pages/index.svelte-1c1f001f.css"], "js": ["pages/index.svelte-ee331045.js", "chunks/vendor-524e618c.js"], "styles": [] }, "src/routes/experience/__layout.svelte": { "entry": "pages/experience/__layout.svelte-f1314127.js", "css": ["assets/pages/experience/__layout.svelte-46660c57.css", "assets/pages/experience/experienceComponents/ExperienceHeader.svelte-02ab8d04.css", "assets/SubPageTitleBar-a261ac42.css", "assets/pages/experience/experienceComponents/GlobeText.svelte-e5fb246a.css"], "js": ["pages/experience/__layout.svelte-f1314127.js", "chunks/vendor-524e618c.js", "pages/experience/experienceComponents/ExperienceHeader.svelte-b0f5d481.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/experience/experienceComponents/GlobeText.svelte-6f803c78.js"], "styles": [] }, "src/routes/experience/index.svelte": { "entry": "pages/experience/index.svelte-d0ca400d.js", "css": ["assets/pages/experience/experienceComponents/GeneralContent.svelte-144bea4e.css", "assets/SubPageTitleBar-a261ac42.css", "assets/pages/experience/experienceComponents/ExperienceStyles.svelte-2e3152e8.css", "assets/pages/experience/experienceComponents/EducationCertifications.svelte-25a3a173.css", "assets/pages/experience/experienceComponents/NetworkSecurity.svelte-965d8728.css", "assets/pages/experience/experienceComponents/WebDevelopment.svelte-d6145475.css", "assets/pages/experience/experienceComponents/SecurityManagement.svelte-914e484e.css"], "js": ["pages/experience/index.svelte-d0ca400d.js", "chunks/vendor-524e618c.js", "pages/experience/experienceComponents/GeneralContent.svelte-7fcbc748.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/experience/experienceComponents/ExperienceStyles.svelte-6905a0c2.js", "pages/experience/experienceComponents/EducationCertifications.svelte-da27e55f.js", "pages/experience/experienceComponents/NetworkSecurity.svelte-5e93389a.js", "pages/experience/experienceComponents/WebDevelopment.svelte-1c1dfed1.js", "pages/experience/experienceComponents/SecurityManagement.svelte-da259e66.js"], "styles": [] }, "src/routes/experience/experienceComponents/EducationCertifications.svelte": { "entry": "pages/experience/experienceComponents/EducationCertifications.svelte-da27e55f.js", "css": ["assets/pages/experience/experienceComponents/EducationCertifications.svelte-25a3a173.css", "assets/SubPageTitleBar-a261ac42.css", "assets/pages/experience/experienceComponents/ExperienceStyles.svelte-2e3152e8.css"], "js": ["pages/experience/experienceComponents/EducationCertifications.svelte-da27e55f.js", "chunks/vendor-524e618c.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/experience/experienceComponents/ExperienceStyles.svelte-6905a0c2.js"], "styles": [] }, "src/routes/experience/experienceComponents/SecurityManagement.svelte": { "entry": "pages/experience/experienceComponents/SecurityManagement.svelte-da259e66.js", "css": ["assets/pages/experience/experienceComponents/SecurityManagement.svelte-914e484e.css", "assets/SubPageTitleBar-a261ac42.css", "assets/pages/experience/experienceComponents/ExperienceStyles.svelte-2e3152e8.css"], "js": ["pages/experience/experienceComponents/SecurityManagement.svelte-da259e66.js", "chunks/vendor-524e618c.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/experience/experienceComponents/ExperienceStyles.svelte-6905a0c2.js"], "styles": [] }, "src/routes/experience/experienceComponents/ExperienceHeader.svelte": { "entry": "pages/experience/experienceComponents/ExperienceHeader.svelte-b0f5d481.js", "css": ["assets/pages/experience/experienceComponents/ExperienceHeader.svelte-02ab8d04.css", "assets/SubPageTitleBar-a261ac42.css", "assets/pages/experience/experienceComponents/GlobeText.svelte-e5fb246a.css"], "js": ["pages/experience/experienceComponents/ExperienceHeader.svelte-b0f5d481.js", "chunks/vendor-524e618c.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/experience/experienceComponents/GlobeText.svelte-6f803c78.js"], "styles": [] }, "src/routes/experience/experienceComponents/ExperienceStyles.svelte": { "entry": "pages/experience/experienceComponents/ExperienceStyles.svelte-6905a0c2.js", "css": ["assets/pages/experience/experienceComponents/ExperienceStyles.svelte-2e3152e8.css"], "js": ["pages/experience/experienceComponents/ExperienceStyles.svelte-6905a0c2.js", "chunks/vendor-524e618c.js"], "styles": [] }, "src/routes/experience/experienceComponents/NetworkSecurity.svelte": { "entry": "pages/experience/experienceComponents/NetworkSecurity.svelte-5e93389a.js", "css": ["assets/pages/experience/experienceComponents/NetworkSecurity.svelte-965d8728.css", "assets/SubPageTitleBar-a261ac42.css", "assets/pages/experience/experienceComponents/ExperienceStyles.svelte-2e3152e8.css"], "js": ["pages/experience/experienceComponents/NetworkSecurity.svelte-5e93389a.js", "chunks/vendor-524e618c.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/experience/experienceComponents/ExperienceStyles.svelte-6905a0c2.js"], "styles": [] }, "src/routes/experience/experienceComponents/GeneralContent.svelte": { "entry": "pages/experience/experienceComponents/GeneralContent.svelte-7fcbc748.js", "css": ["assets/pages/experience/experienceComponents/GeneralContent.svelte-144bea4e.css", "assets/SubPageTitleBar-a261ac42.css", "assets/pages/experience/experienceComponents/ExperienceStyles.svelte-2e3152e8.css"], "js": ["pages/experience/experienceComponents/GeneralContent.svelte-7fcbc748.js", "chunks/vendor-524e618c.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/experience/experienceComponents/ExperienceStyles.svelte-6905a0c2.js"], "styles": [] }, "src/routes/experience/experienceComponents/WebDevelopment.svelte": { "entry": "pages/experience/experienceComponents/WebDevelopment.svelte-1c1dfed1.js", "css": ["assets/pages/experience/experienceComponents/WebDevelopment.svelte-d6145475.css", "assets/SubPageTitleBar-a261ac42.css", "assets/pages/experience/experienceComponents/ExperienceStyles.svelte-2e3152e8.css"], "js": ["pages/experience/experienceComponents/WebDevelopment.svelte-1c1dfed1.js", "chunks/vendor-524e618c.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/experience/experienceComponents/ExperienceStyles.svelte-6905a0c2.js"], "styles": [] }, "src/routes/experience/experienceComponents/GlobeText.svelte": { "entry": "pages/experience/experienceComponents/GlobeText.svelte-6f803c78.js", "css": ["assets/pages/experience/experienceComponents/GlobeText.svelte-e5fb246a.css"], "js": ["pages/experience/experienceComponents/GlobeText.svelte-6f803c78.js", "chunks/vendor-524e618c.js"], "styles": [] }, "src/routes/contact.svelte": { "entry": "pages/contact.svelte-7112fe6e.js", "css": ["assets/pages/contact.svelte-45c40de1.css", "assets/SubPageTitleBar-a261ac42.css"], "js": ["pages/contact.svelte-7112fe6e.js", "chunks/vendor-524e618c.js", "chunks/SubPageTitleBar-6d9d6234.js"], "styles": [] }, "src/routes/about/index.svelte": { "entry": "pages/about/index.svelte-e7dea548.js", "css": ["assets/SubPageTitleBar-a261ac42.css", "assets/pages/about/aboutComponents/AboutBluf.svelte-a21dd151.css", "assets/pages/about/aboutComponents/AboutStyles.svelte-c8def811.css", "assets/pages/about/aboutComponents/AboutBackstory.svelte-d2ea3931.css"], "js": ["pages/about/index.svelte-e7dea548.js", "chunks/vendor-524e618c.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/about/aboutComponents/AboutBluf.svelte-9d315288.js", "pages/about/aboutComponents/AboutStyles.svelte-295b2e96.js", "pages/about/aboutComponents/AboutBackstory.svelte-4e87dbd8.js"], "styles": [] }, "src/routes/about/aboutComponents/AboutBackstory.svelte": { "entry": "pages/about/aboutComponents/AboutBackstory.svelte-4e87dbd8.js", "css": ["assets/pages/about/aboutComponents/AboutBackstory.svelte-d2ea3931.css", "assets/SubPageTitleBar-a261ac42.css", "assets/pages/about/aboutComponents/AboutStyles.svelte-c8def811.css"], "js": ["pages/about/aboutComponents/AboutBackstory.svelte-4e87dbd8.js", "chunks/vendor-524e618c.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/about/aboutComponents/AboutStyles.svelte-295b2e96.js"], "styles": [] }, "src/routes/about/aboutComponents/AboutStyles.svelte": { "entry": "pages/about/aboutComponents/AboutStyles.svelte-295b2e96.js", "css": ["assets/pages/about/aboutComponents/AboutStyles.svelte-c8def811.css"], "js": ["pages/about/aboutComponents/AboutStyles.svelte-295b2e96.js", "chunks/vendor-524e618c.js"], "styles": [] }, "src/routes/about/aboutComponents/AboutBluf.svelte": { "entry": "pages/about/aboutComponents/AboutBluf.svelte-9d315288.js", "css": ["assets/pages/about/aboutComponents/AboutBluf.svelte-a21dd151.css", "assets/SubPageTitleBar-a261ac42.css", "assets/pages/about/aboutComponents/AboutStyles.svelte-c8def811.css"], "js": ["pages/about/aboutComponents/AboutBluf.svelte-9d315288.js", "chunks/vendor-524e618c.js", "chunks/SubPageTitleBar-6d9d6234.js", "pages/about/aboutComponents/AboutStyles.svelte-295b2e96.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
var page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
var css$h = {
  code: ".active.svelte-1pfdhft.svelte-1pfdhft{border-bottom:solid 1px black}.nav.svelte-1pfdhft.svelte-1pfdhft{position:sticky;top:0;width:100%;display:-webkit-box;display:-ms-flexbox;display:flex;height:7vh;z-index:10;background-color:white}.nav-menu.svelte-1pfdhft.svelte-1pfdhft{display:-webkit-box;display:-ms-flexbox;display:flex;width:100%;-webkit-box-pack:end;-ms-flex-pack:end;justify-content:flex-end}.nav-menu.svelte-1pfdhft ul.svelte-1pfdhft,.nav-menu.svelte-1pfdhft li.svelte-1pfdhft{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-ms-flex-direction:row;flex-direction:row;margin:5px 20px;-ms-flex-wrap:wrap;flex-wrap:wrap;-ms-flex-line-pack:space-evenly;align-content:space-evenly}.nav-menu.svelte-1pfdhft a.svelte-1pfdhft{text-decoration:none;font-weight:700;text-transform:uppercase}.nav-link.svelte-1pfdhft.svelte-1pfdhft{padding:5px 7px;border:transparent 2px #222121;color:#222121;-webkit-transition:border 0.5s;transition:border 0.5s;-webkit-transition:color 0.5s;transition:color 0.5s}.nav-link.svelte-1pfdhft.svelte-1pfdhft:hover{border:solid 2px;border-radius:0.25em;color:#222121;cursor:pointer}.nav-link.svelte-1pfdhft.svelte-1pfdhft:active{background-color:#cafafe}.nav-link.svelte-1pfdhft.svelte-1pfdhft:focus{border:solid;outline:none}.nav-link.svelte-1pfdhft.svelte-1pfdhft:inner-focus{outline:none}@media only screen and (max-width: 600px){.nav-menu.svelte-1pfdhft.svelte-1pfdhft{-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}}@media only screen and (max-width: 400px){.nav.svelte-1pfdhft ul li.svelte-1pfdhft{-webkit-box-pack:space-evenly;-ms-flex-pack:space-evenly;justify-content:space-evenly;-ms-flex-wrap:wrap;flex-wrap:wrap;margin:5px 0px}}@media only screen and (max-width: 600px){.nav.svelte-1pfdhft ul li.svelte-1pfdhft{margin:10px 0px}}",
  map: '{"version":3,"file":"NavBar.svelte","sources":["NavBar.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { page } from \'$app/stores\';\\n<\/script>\\n\\n<div class=\\"nav\\">\\n\\t<!-- Make the nav bar sticky to hold it at the top of the page.-->\\n\\t<nav class=\\"nav-menu\\">\\n\\t\\t<ul>\\n\\t\\t\\t<li class=\\"nav-link\\" class:active={$page.path === `/`}><a href=\\"/\\">home</a></li>\\n\\t\\t\\t<li class=\\"nav-link\\" class:active={$page.path === `/experience`}>\\n\\t\\t\\t\\t<a href=\\"/experience\\">experience</a>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"nav-link\\"><a href=\\"/about\\" class:active={$page.path === `/about`}>about</a></li>\\n\\t\\t\\t<li class=\\"nav-link\\">\\n\\t\\t\\t\\t<a href=\\"/contact\\" class:active={$page.path === `/contact`}>contact</a>\\n\\t\\t\\t</li>\\n\\t\\t</ul>\\n\\t</nav>\\n</div>\\n\\n<style>\\n\\t.active {\\n\\t\\tborder-bottom: solid 1px black;\\n\\t}\\n\\t.nav {\\n\\t\\tposition: sticky;\\n\\t\\ttop: 0;\\n\\t\\twidth: 100%;\\n\\t\\tdisplay: -webkit-box;\\n\\t\\tdisplay: -ms-flexbox;\\n\\t\\tdisplay: flex;\\n\\t\\theight: 7vh;\\n\\t\\tz-index: 10;\\n\\t\\tbackground-color: white;\\n\\t}\\n\\n\\t.nav-menu {\\n\\t\\tdisplay: -webkit-box;\\n\\t\\tdisplay: -ms-flexbox;\\n\\t\\tdisplay: flex;\\n\\t\\twidth: 100%;\\n\\t\\t-webkit-box-pack: end;\\n\\t\\t-ms-flex-pack: end;\\n\\t\\tjustify-content: flex-end;\\n\\t}\\n\\n\\t.nav-menu ul,\\n\\t.nav-menu li {\\n\\t\\tdisplay: -webkit-box;\\n\\t\\tdisplay: -ms-flexbox;\\n\\t\\tdisplay: flex;\\n\\t\\t-webkit-box-orient: horizontal;\\n\\t\\t-webkit-box-direction: normal;\\n\\t\\t-ms-flex-direction: row;\\n\\t\\tflex-direction: row;\\n\\t\\tmargin: 5px 20px;\\n\\t\\t-ms-flex-wrap: wrap;\\n\\t\\tflex-wrap: wrap;\\n\\t\\t-ms-flex-line-pack: space-evenly;\\n\\t\\talign-content: space-evenly;\\n\\t}\\n\\n\\t.nav-menu a {\\n\\t\\ttext-decoration: none;\\n\\t\\tfont-weight: 700;\\n\\t\\ttext-transform: uppercase;\\n\\t}\\n\\n\\t.nav-link {\\n\\t\\tpadding: 5px 7px;\\n\\t\\tborder: transparent 2px #222121;\\n\\t\\tcolor: #222121;\\n\\t\\t-webkit-transition: border 0.5s;\\n\\t\\ttransition: border 0.5s;\\n\\t\\t-webkit-transition: color 0.5s;\\n\\t\\ttransition: color 0.5s;\\n\\t}\\n\\n\\t.nav-link:hover {\\n\\t\\tborder: solid 2px;\\n\\t\\tborder-radius: 0.25em;\\n\\t\\tcolor: #222121;\\n\\t\\tcursor: pointer;\\n\\t}\\n\\n\\t.nav-link:active {\\n\\t\\tbackground-color: #cafafe;\\n\\t}\\n\\n\\t.nav-link:focus {\\n\\t\\tborder: solid;\\n\\t\\toutline: none;\\n\\t}\\n\\n\\t.nav-link:inner-focus {\\n\\t\\toutline: none;\\n\\t}\\n\\n\\t@media only screen and (max-width: 600px) {\\n\\t\\t.nav-menu {\\n\\t\\t\\t-webkit-box-pack: center;\\n\\t\\t\\t-ms-flex-pack: center;\\n\\t\\t\\tjustify-content: center;\\n\\t\\t}\\n\\t}\\n\\t@media only screen and (max-width: 400px) {\\n\\t\\t.nav ul li {\\n\\t\\t\\t-webkit-box-pack: space-evenly;\\n\\t\\t\\t-ms-flex-pack: space-evenly;\\n\\t\\t\\tjustify-content: space-evenly;\\n\\t\\t\\t-ms-flex-wrap: wrap;\\n\\t\\t\\tflex-wrap: wrap;\\n\\t\\t\\tmargin: 5px 0px;\\n\\t\\t}\\n\\t}\\n\\n\\t@media only screen and (max-width: 600px) {\\n\\t\\t.nav ul li {\\n\\t\\t\\tmargin: 10px 0px;\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"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"}'
};
var NavBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$result.css.add(css$h);
  $$unsubscribe_page();
  return `<div class="${"nav svelte-1pfdhft"}">
	<nav class="${"nav-menu svelte-1pfdhft"}"><ul class="${"svelte-1pfdhft"}"><li class="${["nav-link svelte-1pfdhft", $page.path === `/` ? "active" : ""].join(" ").trim()}"><a href="${"/"}" class="${"svelte-1pfdhft"}">home</a></li>
			<li class="${["nav-link svelte-1pfdhft", $page.path === `/experience` ? "active" : ""].join(" ").trim()}"><a href="${"/experience"}" class="${"svelte-1pfdhft"}">experience</a></li>
			<li class="${"nav-link svelte-1pfdhft"}"><a href="${"/about"}" class="${["svelte-1pfdhft", $page.path === `/about` ? "active" : ""].join(" ").trim()}">about</a></li>
			<li class="${"nav-link svelte-1pfdhft"}"><a href="${"/contact"}" class="${["svelte-1pfdhft", $page.path === `/contact` ? "active" : ""].join(" ").trim()}">contact</a></li></ul></nav>
</div>`;
});
var css$g = {
  code: "footer.svelte-1qq6957.svelte-1qq6957{bottom:0;position:relative;display:-webkit-box;display:-ms-flexbox;display:flex;min-height:5vh;margin-top:0 auto}.footer-left.svelte-1qq6957.svelte-1qq6957,.footer-right.svelte-1qq6957.svelte-1qq6957{position:relative;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;width:50%;background-color:#55bcc9}.footer-left.svelte-1qq6957 p.svelte-1qq6957,.footer-right.svelte-1qq6957 p.svelte-1qq6957{text-align:center}.footer-right-content.svelte-1qq6957.svelte-1qq6957{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:space-evenly;-ms-flex-pack:space-evenly;justify-content:space-evenly;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.footer-right.svelte-1qq6957 img.svelte-1qq6957{height:40px;padding:10px;cursor:pointer}",
  map: '{"version":3,"file":"FooterBar.svelte","sources":["FooterBar.svelte"],"sourcesContent":["<script>\\n<\/script>\\n\\n<footer class=\\"footer\\">\\n\\t<div class=\\"footer-left\\">\\n\\t\\t<div class=\\"footer-left-content\\">\\n\\t\\t\\t<p>Nathan Meeker, SFPC/PSC/Security+,</p>\\n\\t\\t</div>\\n\\t</div>\\n\\t<div class=\\"footer-right\\">\\n\\t\\t<div class=\\"footer-right-content\\">\\n\\t\\t\\t<p>Look me up on:</p>\\n\\t\\t\\t<a\\n\\t\\t\\t\\ttitle=\\"LinkedIn profile for Nathan Meeker.\\"\\n\\t\\t\\t\\thref=\\"https://www.linkedin.com/in/nathan-m-444055178/\\"\\n\\t\\t\\t\\t><img src=\\"/iconfinder_social-linkedin-circle_771370.png\\" alt=\\"LinkedIn Icon\\" /></a\\n\\t\\t\\t>\\n\\t\\t\\t<a title=\\"Portfolium profile for Nathan Meeker.\\" href=\\"https://portfolium.com/NathanMeeker2\\"\\n\\t\\t\\t\\t><img src=\\"/portfoliumIcon.png\\" alt=\\"Portfolium Icon\\" /></a\\n\\t\\t\\t>\\n\\t\\t</div>\\n\\t</div>\\n</footer>\\n\\n<style>\\n\\tfooter {\\n\\t\\tbottom: 0;\\n\\t\\tposition: relative;\\n\\t\\tdisplay: -webkit-box;\\n\\t\\tdisplay: -ms-flexbox;\\n\\t\\tdisplay: flex;\\n\\t\\tmin-height: 5vh;\\n\\t\\tmargin-top: 0 auto;\\n\\t}\\n\\n\\t.footer-left,\\n\\t.footer-right {\\n\\t\\tposition: relative;\\n\\t\\tdisplay: -webkit-box;\\n\\t\\tdisplay: -ms-flexbox;\\n\\t\\tdisplay: flex;\\n\\t\\t-webkit-box-pack: center;\\n\\t\\t-ms-flex-pack: center;\\n\\t\\tjustify-content: center;\\n\\t\\t-webkit-box-align: center;\\n\\t\\t-ms-flex-align: center;\\n\\t\\talign-items: center;\\n\\t\\twidth: 50%;\\n\\t\\tbackground-color: #55bcc9;\\n\\t}\\n\\n\\t.footer-left p,\\n\\t.footer-right p {\\n\\t\\ttext-align: center;\\n\\t}\\n\\n\\t.footer-right-content {\\n\\t\\tdisplay: -webkit-box;\\n\\t\\tdisplay: -ms-flexbox;\\n\\t\\tdisplay: flex;\\n\\t\\t-webkit-box-pack: space-evenly;\\n\\t\\t-ms-flex-pack: space-evenly;\\n\\t\\tjustify-content: space-evenly;\\n\\t\\t-webkit-box-align: center;\\n\\t\\t-ms-flex-align: center;\\n\\t\\talign-items: center;\\n\\t}\\n\\n\\t.footer-right img {\\n\\t\\theight: 40px;\\n\\t\\tpadding: 10px;\\n\\t\\tcursor: pointer;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAyBC,MAAM,8BAAC,CAAC,AACP,MAAM,CAAE,CAAC,CACT,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,WAAW,CACpB,OAAO,CAAE,WAAW,CACpB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,GAAG,CACf,UAAU,CAAE,CAAC,CAAC,IAAI,AACnB,CAAC,AAED,0CAAY,CACZ,aAAa,8BAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,WAAW,CACpB,OAAO,CAAE,WAAW,CACpB,OAAO,CAAE,IAAI,CACb,gBAAgB,CAAE,MAAM,CACxB,aAAa,CAAE,MAAM,CACrB,eAAe,CAAE,MAAM,CACvB,iBAAiB,CAAE,MAAM,CACzB,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,gBAAgB,CAAE,OAAO,AAC1B,CAAC,AAED,2BAAY,CAAC,gBAAC,CACd,4BAAa,CAAC,CAAC,eAAC,CAAC,AAChB,UAAU,CAAE,MAAM,AACnB,CAAC,AAED,qBAAqB,8BAAC,CAAC,AACtB,OAAO,CAAE,WAAW,CACpB,OAAO,CAAE,WAAW,CACpB,OAAO,CAAE,IAAI,CACb,gBAAgB,CAAE,YAAY,CAC9B,aAAa,CAAE,YAAY,CAC3B,eAAe,CAAE,YAAY,CAC7B,iBAAiB,CAAE,MAAM,CACzB,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,AACpB,CAAC,AAED,4BAAa,CAAC,GAAG,eAAC,CAAC,AAClB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,OAAO,AAChB,CAAC"}'
};
var FooterBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$g);
  return `<footer class="${"footer svelte-1qq6957"}"><div class="${"footer-left svelte-1qq6957"}"><div class="${"footer-left-content"}"><p class="${"svelte-1qq6957"}">Nathan Meeker, SFPC/PSC/Security+,</p></div></div>
	<div class="${"footer-right svelte-1qq6957"}"><div class="${"footer-right-content svelte-1qq6957"}"><p class="${"svelte-1qq6957"}">Look me up on:</p>
			<a title="${"LinkedIn profile for Nathan Meeker."}" href="${"https://www.linkedin.com/in/nathan-m-444055178/"}"><img src="${"/iconfinder_social-linkedin-circle_771370.png"}" alt="${"LinkedIn Icon"}" class="${"svelte-1qq6957"}"></a>
			<a title="${"Portfolium profile for Nathan Meeker."}" href="${"https://portfolium.com/NathanMeeker2"}"><img src="${"/portfoliumIcon.png"}" alt="${"Portfolium Icon"}" class="${"svelte-1qq6957"}"></a></div></div>
</footer>`;
});
var css$f = {
  code: ".layout-container.svelte-1j2vmps{min-height:90vh;width:100%}",
  map: `{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script>\\n\\timport '../global.css';\\n\\timport NavBar from '../components/NavBar.svelte';\\n\\timport FooterBar from '../components/FooterBar.svelte';\\n<\/script>\\n\\n<svelte:head>\\n\\t<link href=\\"https://fonts.googleapis.com/css?family=Roboto\\" rel=\\"stylesheet\\" />\\n</svelte:head>\\n\\n<NavBar />\\n<div class=\\"layout-container\\">\\n\\t<slot />\\n</div>\\n<FooterBar />\\n\\n<style>\\n\\t.layout-container {\\n\\t\\tmin-height: 90vh;\\n\\t\\twidth: 100%;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAiBC,iBAAiB,eAAC,CAAC,AAClB,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,IAAI,AACZ,CAAC"}`
};
var _layout$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$f);
  return `${$$result.head += `<link href="${"https://fonts.googleapis.com/css?family=Roboto"}" rel="${"stylesheet"}" data-svelte="svelte-us18fz">`, ""}

${validate_component(NavBar, "NavBar").$$render($$result, {}, {}, {})}
<div class="${"layout-container svelte-1j2vmps"}">${slots.default ? slots.default({}) : ``}</div>
${validate_component(FooterBar, "FooterBar").$$render($$result, {}, {}, {})}`;
});
var __layout$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout$1
});
function load({ error: error2, status }) {
  return { props: { error: error2, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var css$e = {
  code: ".main-container.svelte-1ah978p.svelte-1ah978p{position:relative}.title.svelte-1ah978p.svelte-1ah978p{position:relative;height:95vh;background-image:-webkit-gradient(\n				linear,\n				left top,\n				right top,\n				from(rgba(85, 188, 201, 0.3)),\n				to(rgba(63, 238, 230, 0.9))\n			),\n			url('/IMG_1521.jpeg');background-image:linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),\n			url('/IMG_1521.jpeg');background-repeat:no-repeat;background-size:cover;-webkit-animation:svelte-1ah978p-pictureReveal 1.5s linear 2s;animation:svelte-1ah978p-pictureReveal 1.5s linear 2s;-webkit-animation-fill-mode:backwards;animation-fill-mode:backwards;-webkit-clip-path:polygon(0 0, 100% 0, 100% 77%, 0 98%);clip-path:polygon(0 0, 100% 0, 100% 77%, 0 98%)}.title-block.svelte-1ah978p.svelte-1ah978p{position:absolute;top:40%;left:50%;width:100%;-webkit-transform:translate(-50%, -50%);transform:translate(-50%, -50%);text-align:center}.title-main.svelte-1ah978p.svelte-1ah978p{background-color:#1f2b62;background-image:linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);background-repeat:no-repeat;background-size:100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;text-transform:uppercase;display:block;font-size:8vmax;-webkit-animation:svelte-1ah978p-titleSwoop 1.5s linear;animation:svelte-1ah978p-titleSwoop 1.5s linear}.title-secondary.svelte-1ah978p.svelte-1ah978p{background-color:#1f2b62;background-image:linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);background-repeat:no-repeat;background-size:100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;text-transform:uppercase;display:block;line-height:1.5rem;letter-spacing:0.65rem;font-size:1.5vmax;margin-bottom:40px;text-align:center;-webkit-animation:svelte-1ah978p-subTitleSwoop 1.5s linear 3s;animation:svelte-1ah978p-subTitleSwoop 1.5s linear 3s;-webkit-animation-fill-mode:backwards;animation-fill-mode:backwards}@-webkit-keyframes svelte-1ah978p-pictureReveal{0%{background-image:-webkit-gradient(linear, left top, right top, from(#55bcc9), to(#3feee6)),\n				url('/IMG_1521.jpeg');background-image:linear-gradient(to right, #55bcc9, #3feee6), url('/IMG_1521.jpeg')}25%{background-image:-webkit-gradient(\n					linear,\n					left top,\n					right top,\n					from(rgba(85, 188, 201, 0.8)),\n					to(rgba(63, 238, 230, 0.97))\n				),\n				url('/IMG_1521.jpeg');background-image:linear-gradient(to right, rgba(85, 188, 201, 0.8), rgba(63, 238, 230, 0.97)),\n				url('/IMG_1521.jpeg')}50%{background-image:-webkit-gradient(\n					linear,\n					left top,\n					right top,\n					from(rgba(85, 188, 201, 0.6)),\n					to(rgba(63, 238, 230, 0.95))\n				),\n				url('/IMG_1521.jpeg');background-image:linear-gradient(to right, rgba(85, 188, 201, 0.6), rgba(63, 238, 230, 0.95)),\n				url('/IMG_1521.jpeg')}75%{background-image:-webkit-gradient(\n					linear,\n					left top,\n					right top,\n					from(rgba(85, 188, 201, 0.4)),\n					to(rgba(63, 238, 230, 0.93))\n				),\n				url('/IMG_1521.jpeg');background-image:linear-gradient(to right, rgba(85, 188, 201, 0.4), rgba(63, 238, 230, 0.93)),\n				url('/IMG_1521.jpeg')}100%{background-image:-webkit-gradient(\n					linear,\n					left top,\n					right top,\n					from(rgba(85, 188, 201, 0.3)),\n					to(rgba(63, 238, 230, 0.9))\n				),\n				url('/IMG_1521.jpeg');background-image:linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),\n				url('/IMG_1521.jpeg')}}@keyframes svelte-1ah978p-pictureReveal{0%{background-image:-webkit-gradient(linear, left top, right top, from(#55bcc9), to(#3feee6)),\n				url('/IMG_1521.jpeg');background-image:linear-gradient(to right, #55bcc9, #3feee6), url('/IMG_1521.jpeg')}25%{background-image:-webkit-gradient(\n					linear,\n					left top,\n					right top,\n					from(rgba(85, 188, 201, 0.8)),\n					to(rgba(63, 238, 230, 0.97))\n				),\n				url('/IMG_1521.jpeg');background-image:linear-gradient(to right, rgba(85, 188, 201, 0.8), rgba(63, 238, 230, 0.97)),\n				url('/IMG_1521.jpeg')}50%{background-image:-webkit-gradient(\n					linear,\n					left top,\n					right top,\n					from(rgba(85, 188, 201, 0.6)),\n					to(rgba(63, 238, 230, 0.95))\n				),\n				url('/IMG_1521.jpeg');background-image:linear-gradient(to right, rgba(85, 188, 201, 0.6), rgba(63, 238, 230, 0.95)),\n				url('/IMG_1521.jpeg')}75%{background-image:-webkit-gradient(\n					linear,\n					left top,\n					right top,\n					from(rgba(85, 188, 201, 0.4)),\n					to(rgba(63, 238, 230, 0.93))\n				),\n				url('/IMG_1521.jpeg');background-image:linear-gradient(to right, rgba(85, 188, 201, 0.4), rgba(63, 238, 230, 0.93)),\n				url('/IMG_1521.jpeg')}100%{background-image:-webkit-gradient(\n					linear,\n					left top,\n					right top,\n					from(rgba(85, 188, 201, 0.3)),\n					to(rgba(63, 238, 230, 0.9))\n				),\n				url('/IMG_1521.jpeg');background-image:linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),\n				url('/IMG_1521.jpeg')}}@-webkit-keyframes svelte-1ah978p-titleSwoop{0%{width:100vw;letter-spacing:3rem;opacity:0}100%{width:100vw;letter-spacing:2px;opacity:1}}@keyframes svelte-1ah978p-titleSwoop{0%{width:100vw;letter-spacing:3rem;opacity:0}100%{width:100vw;letter-spacing:2px;opacity:1}}@-webkit-keyframes svelte-1ah978p-subTitleSwoop{0%{-webkit-transform:translateY(-60px);transform:translateY(-60px);opacity:0}100%{-webkit-transform:translateY(0px);transform:translateY(0px);opacity:1}}@keyframes svelte-1ah978p-subTitleSwoop{0%{-webkit-transform:translateY(-60px);transform:translateY(-60px);opacity:0}100%{-webkit-transform:translateY(0px);transform:translateY(0px);opacity:1}}.card.svelte-1ah978p.svelte-1ah978p{width:100%}.card-layout.svelte-1ah978p.svelte-1ah978p{position:absolute;width:100%;height:20vh;-webkit-clip-path:polygon(0 100%, 100% 0, 100% 20%, 20% 100%);clip-path:polygon(0 100%, 100% 0, 100% 20%, 20% 100%)}.card-container.svelte-1ah978p.svelte-1ah978p{position:absolute;bottom:1vh;height:20vh;width:100%;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;color:#3feee6;overflow:hidden;-webkit-clip-path:polygon(0 100%, 100% 0, 100% 100%, 100% 100%);clip-path:polygon(0 100%, 100% 0, 100% 100%, 100% 100%)}.card-title.svelte-1ah978p.svelte-1ah978p{position:absolute;right:10px;text-align:right;font-size:1.7vmax;text-transform:uppercase;width:100%;top:53%;-webkit-transform:rotate(var(--sub-container-diagonal));transform:rotate(var(--sub-container-diagonal));color:#222121;cursor:pointer;background-color:#1f2b62;background-image:linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);background-repeat:no-repeat;background-size:100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}.experience.svelte-1ah978p.svelte-1ah978p{background-color:var(--orange)}.experience.svelte-1ah978p .card-title.svelte-1ah978p{-webkit-animation:svelte-1ah978p-cardTitleText 3s linear infinite;animation:svelte-1ah978p-cardTitleText 3s linear infinite}.about.svelte-1ah978p.svelte-1ah978p{background-color:var(--blue);-webkit-transform:translateY(5vh);transform:translateY(5vh)}.about.svelte-1ah978p .card-title.svelte-1ah978p{-webkit-animation:svelte-1ah978p-cardTitleText 3s linear 0.5s infinite;animation:svelte-1ah978p-cardTitleText 3s linear 0.5s infinite}.contact.svelte-1ah978p.svelte-1ah978p{background-color:var(--light-blue);-webkit-transform:translateY(10vh);transform:translateY(10vh)}.contact.svelte-1ah978p .card-title.svelte-1ah978p{-webkit-animation:svelte-1ah978p-cardTitleText 3s linear 1s infinite;animation:svelte-1ah978p-cardTitleText 3s linear 1s infinite}.extra.svelte-1ah978p.svelte-1ah978p{background-color:var(--black);-webkit-clip-path:polygon(0 20vh, 100% 0, 100% 100%, 0% 100%);clip-path:polygon(0 20vh, 100% 0, 100% 100%, 0% 100%);-webkit-transform:translateY(15vh);transform:translateY(15vh)}@-webkit-keyframes svelte-1ah978p-cardTitleText{0%{background-image:linear-gradient(-43deg, #222121 100%, #ffffff 100%)}5%{background-image:linear-gradient(43deg, #222121 94%, #ffffff 100%)}10%{background-image:linear-gradient(43deg, #222121 94%, #ffffff 100%)}15%{background-image:linear-gradient(-43deg, #222121 100%, #ffffff 100%)}100%{background-image:linear-gradient(-43deg, #222121 100%, #ffffff 100%)}}@keyframes svelte-1ah978p-cardTitleText{0%{background-image:linear-gradient(-43deg, #222121 100%, #ffffff 100%)}5%{background-image:linear-gradient(43deg, #222121 94%, #ffffff 100%)}10%{background-image:linear-gradient(43deg, #222121 94%, #ffffff 100%)}15%{background-image:linear-gradient(-43deg, #222121 100%, #ffffff 100%)}100%{background-image:linear-gradient(-43deg, #222121 100%, #ffffff 100%)}}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { onMount } from 'svelte';\\nimport { fly, fade } from 'svelte/transition';\\nlet textAngle;\\nonMount(() => adjustText(textAngle));\\nconst adjustText = (node) => {\\n    const sideA = node.clientHeight; //Height\\n    const sideB = node.clientWidth; //Width\\n    const angle = Math.atan2(sideA, sideB); //tangent of a/b gives angle in radians\\n    document.documentElement.style.setProperty('--top-calc', \`\${650}%\`);\\n    document.documentElement.style.setProperty('--sub-container-diagonal', \`-\${angle}rad\`);\\n};\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>Nathan Meeker || Home</title>\\n</svelte:head>\\n\\n<svelte:window\\n\\ton:resize={() => {\\n\\t\\tadjustText(textAngle);\\n\\t}}\\n/>\\n\\n<div class=\\"main-container\\" in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>\\n\\t<div class=\\"title\\">\\n\\t\\t<div>\\n\\t\\t\\t<div class=\\"animated-text\\">\\n\\t\\t\\t\\t<div class=\\"title-block\\">\\n\\t\\t\\t\\t\\t<span class=\\"title-main gradient-text\\">Nathan Meeker</span>\\n\\t\\t\\t\\t\\t<span class=\\"title-secondary gradient-text\\">Come See the Whole Picture</span>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t</div>\\n\\t<div id=\\"card-container\\" class=\\"card card-container\\">\\n\\t\\t<div class=\\"card-layout experience experience-btn\\" bind:this={textAngle}>\\n\\t\\t\\t<h1 class=\\"card-title\\"><a href=\\"/experience\\">Experience</a></h1>\\n\\t\\t</div>\\n\\t\\t<div class=\\"card-layout about about-btn\\">\\n\\t\\t\\t<h1 class=\\"card-title\\"><a href=\\"/about\\">About</a></h1>\\n\\t\\t</div>\\n\\t\\t<div class=\\"card-layout contact contact-btn\\">\\n\\t\\t\\t<h1 class=\\"card-title\\"><a href=\\"/contact\\">Contact</a></h1>\\n\\t\\t</div>\\n\\t\\t<div class=\\"card-layout extra extra-btn\\" />\\n\\t</div>\\n</div>\\n\\n<style>\\n\\t.main-container {\\n\\t\\tposition: relative;\\n\\t}\\n\\t.title {\\n\\t\\tposition: relative;\\n\\t\\theight: 95vh;\\n\\t\\tbackground-image: -webkit-gradient(\\n\\t\\t\\t\\tlinear,\\n\\t\\t\\t\\tleft top,\\n\\t\\t\\t\\tright top,\\n\\t\\t\\t\\tfrom(rgba(85, 188, 201, 0.3)),\\n\\t\\t\\t\\tto(rgba(63, 238, 230, 0.9))\\n\\t\\t\\t),\\n\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\tbackground-image: linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),\\n\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\tbackground-repeat: no-repeat;\\n\\t\\tbackground-size: cover;\\n\\t\\t-webkit-animation: pictureReveal 1.5s linear 2s;\\n\\t\\tanimation: pictureReveal 1.5s linear 2s;\\n\\t\\t-webkit-animation-fill-mode: backwards;\\n\\t\\tanimation-fill-mode: backwards;\\n\\t\\t-webkit-clip-path: polygon(0 0, 100% 0, 100% 77%, 0 98%);\\n\\t\\tclip-path: polygon(0 0, 100% 0, 100% 77%, 0 98%);\\n\\t}\\n\\n\\t.title-block {\\n\\t\\tposition: absolute;\\n\\t\\ttop: 40%;\\n\\t\\tleft: 50%;\\n\\t\\twidth: 100%;\\n\\t\\t-webkit-transform: translate(-50%, -50%);\\n\\t\\ttransform: translate(-50%, -50%);\\n\\t\\ttext-align: center;\\n\\t}\\n\\n\\t.title-main {\\n\\t\\tbackground-color: #1f2b62;\\n\\t\\tbackground-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);\\n\\t\\tbackground-repeat: no-repeat;\\n\\t\\tbackground-size: 100%;\\n\\t\\t-webkit-background-clip: text;\\n\\t\\tbackground-clip: text;\\n\\t\\tcolor: transparent;\\n\\t\\t-webkit-text-fill-color: transparent;\\n\\t\\ttext-transform: uppercase;\\n\\t\\tdisplay: block;\\n\\t\\tfont-size: 8vmax;\\n\\t\\t-webkit-animation: titleSwoop 1.5s linear;\\n\\t\\tanimation: titleSwoop 1.5s linear;\\n\\t}\\n\\n\\t.title-secondary {\\n\\t\\tbackground-color: #1f2b62;\\n\\t\\tbackground-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);\\n\\t\\tbackground-repeat: no-repeat;\\n\\t\\tbackground-size: 100%;\\n\\t\\t-webkit-background-clip: text;\\n\\t\\tbackground-clip: text;\\n\\t\\tcolor: transparent;\\n\\t\\t-webkit-text-fill-color: transparent;\\n\\t\\ttext-transform: uppercase;\\n\\t\\tdisplay: block;\\n\\t\\tline-height: 1.5rem;\\n\\t\\tletter-spacing: 0.65rem;\\n\\t\\tfont-size: 1.5vmax;\\n\\t\\tmargin-bottom: 40px;\\n\\t\\ttext-align: center;\\n\\t\\t-webkit-animation: subTitleSwoop 1.5s linear 3s;\\n\\t\\tanimation: subTitleSwoop 1.5s linear 3s;\\n\\t\\t-webkit-animation-fill-mode: backwards;\\n\\t\\tanimation-fill-mode: backwards;\\n\\t}\\n\\n\\t@-webkit-keyframes pictureReveal {\\n\\t\\t0% {\\n\\t\\t\\tbackground-image: -webkit-gradient(linear, left top, right top, from(#55bcc9), to(#3feee6)),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t\\tbackground-image: linear-gradient(to right, #55bcc9, #3feee6), url('/IMG_1521.jpeg');\\n\\t\\t}\\n\\t\\t25% {\\n\\t\\t\\tbackground-image: -webkit-gradient(\\n\\t\\t\\t\\t\\tlinear,\\n\\t\\t\\t\\t\\tleft top,\\n\\t\\t\\t\\t\\tright top,\\n\\t\\t\\t\\t\\tfrom(rgba(85, 188, 201, 0.8)),\\n\\t\\t\\t\\t\\tto(rgba(63, 238, 230, 0.97))\\n\\t\\t\\t\\t),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t\\tbackground-image: linear-gradient(to right, rgba(85, 188, 201, 0.8), rgba(63, 238, 230, 0.97)),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t}\\n\\t\\t50% {\\n\\t\\t\\tbackground-image: -webkit-gradient(\\n\\t\\t\\t\\t\\tlinear,\\n\\t\\t\\t\\t\\tleft top,\\n\\t\\t\\t\\t\\tright top,\\n\\t\\t\\t\\t\\tfrom(rgba(85, 188, 201, 0.6)),\\n\\t\\t\\t\\t\\tto(rgba(63, 238, 230, 0.95))\\n\\t\\t\\t\\t),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t\\tbackground-image: linear-gradient(to right, rgba(85, 188, 201, 0.6), rgba(63, 238, 230, 0.95)),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t}\\n\\t\\t75% {\\n\\t\\t\\tbackground-image: -webkit-gradient(\\n\\t\\t\\t\\t\\tlinear,\\n\\t\\t\\t\\t\\tleft top,\\n\\t\\t\\t\\t\\tright top,\\n\\t\\t\\t\\t\\tfrom(rgba(85, 188, 201, 0.4)),\\n\\t\\t\\t\\t\\tto(rgba(63, 238, 230, 0.93))\\n\\t\\t\\t\\t),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t\\tbackground-image: linear-gradient(to right, rgba(85, 188, 201, 0.4), rgba(63, 238, 230, 0.93)),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\tbackground-image: -webkit-gradient(\\n\\t\\t\\t\\t\\tlinear,\\n\\t\\t\\t\\t\\tleft top,\\n\\t\\t\\t\\t\\tright top,\\n\\t\\t\\t\\t\\tfrom(rgba(85, 188, 201, 0.3)),\\n\\t\\t\\t\\t\\tto(rgba(63, 238, 230, 0.9))\\n\\t\\t\\t\\t),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t\\tbackground-image: linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t}\\n\\t}\\n\\n\\t@keyframes pictureReveal {\\n\\t\\t0% {\\n\\t\\t\\tbackground-image: -webkit-gradient(linear, left top, right top, from(#55bcc9), to(#3feee6)),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t\\tbackground-image: linear-gradient(to right, #55bcc9, #3feee6), url('/IMG_1521.jpeg');\\n\\t\\t}\\n\\t\\t25% {\\n\\t\\t\\tbackground-image: -webkit-gradient(\\n\\t\\t\\t\\t\\tlinear,\\n\\t\\t\\t\\t\\tleft top,\\n\\t\\t\\t\\t\\tright top,\\n\\t\\t\\t\\t\\tfrom(rgba(85, 188, 201, 0.8)),\\n\\t\\t\\t\\t\\tto(rgba(63, 238, 230, 0.97))\\n\\t\\t\\t\\t),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t\\tbackground-image: linear-gradient(to right, rgba(85, 188, 201, 0.8), rgba(63, 238, 230, 0.97)),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t}\\n\\t\\t50% {\\n\\t\\t\\tbackground-image: -webkit-gradient(\\n\\t\\t\\t\\t\\tlinear,\\n\\t\\t\\t\\t\\tleft top,\\n\\t\\t\\t\\t\\tright top,\\n\\t\\t\\t\\t\\tfrom(rgba(85, 188, 201, 0.6)),\\n\\t\\t\\t\\t\\tto(rgba(63, 238, 230, 0.95))\\n\\t\\t\\t\\t),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t\\tbackground-image: linear-gradient(to right, rgba(85, 188, 201, 0.6), rgba(63, 238, 230, 0.95)),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t}\\n\\t\\t75% {\\n\\t\\t\\tbackground-image: -webkit-gradient(\\n\\t\\t\\t\\t\\tlinear,\\n\\t\\t\\t\\t\\tleft top,\\n\\t\\t\\t\\t\\tright top,\\n\\t\\t\\t\\t\\tfrom(rgba(85, 188, 201, 0.4)),\\n\\t\\t\\t\\t\\tto(rgba(63, 238, 230, 0.93))\\n\\t\\t\\t\\t),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t\\tbackground-image: linear-gradient(to right, rgba(85, 188, 201, 0.4), rgba(63, 238, 230, 0.93)),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\tbackground-image: -webkit-gradient(\\n\\t\\t\\t\\t\\tlinear,\\n\\t\\t\\t\\t\\tleft top,\\n\\t\\t\\t\\t\\tright top,\\n\\t\\t\\t\\t\\tfrom(rgba(85, 188, 201, 0.3)),\\n\\t\\t\\t\\t\\tto(rgba(63, 238, 230, 0.9))\\n\\t\\t\\t\\t),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t\\tbackground-image: linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),\\n\\t\\t\\t\\turl('/IMG_1521.jpeg');\\n\\t\\t}\\n\\t}\\n\\n\\t@-webkit-keyframes titleSwoop {\\n\\t\\t0% {\\n\\t\\t\\twidth: 100vw;\\n\\t\\t\\tletter-spacing: 3rem;\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\twidth: 100vw;\\n\\t\\t\\tletter-spacing: 2px;\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\t}\\n\\n\\t@keyframes titleSwoop {\\n\\t\\t0% {\\n\\t\\t\\twidth: 100vw;\\n\\t\\t\\tletter-spacing: 3rem;\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\twidth: 100vw;\\n\\t\\t\\tletter-spacing: 2px;\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\t}\\n\\n\\t@-webkit-keyframes subTitleSwoop {\\n\\t\\t0% {\\n\\t\\t\\t-webkit-transform: translateY(-60px);\\n\\t\\t\\ttransform: translateY(-60px);\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\t-webkit-transform: translateY(0px);\\n\\t\\t\\ttransform: translateY(0px);\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\t}\\n\\n\\t@keyframes subTitleSwoop {\\n\\t\\t0% {\\n\\t\\t\\t-webkit-transform: translateY(-60px);\\n\\t\\t\\ttransform: translateY(-60px);\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\t-webkit-transform: translateY(0px);\\n\\t\\t\\ttransform: translateY(0px);\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\t}\\n\\t.card {\\n\\t\\twidth: 100%;\\n\\t}\\n\\n\\t.card-layout {\\n\\t\\tposition: absolute;\\n\\t\\twidth: 100%;\\n\\t\\theight: 20vh;\\n\\t\\t-webkit-clip-path: polygon(0 100%, 100% 0, 100% 20%, 20% 100%);\\n\\t\\tclip-path: polygon(0 100%, 100% 0, 100% 20%, 20% 100%);\\n\\t}\\n\\n\\t.card-container {\\n\\t\\tposition: absolute;\\n\\t\\tbottom: 1vh;\\n\\t\\theight: 20vh;\\n\\t\\twidth: 100%;\\n\\t\\tdisplay: -webkit-box;\\n\\t\\tdisplay: -ms-flexbox;\\n\\t\\tdisplay: flex;\\n\\t\\t-webkit-box-orient: vertical;\\n\\t\\t-webkit-box-direction: normal;\\n\\t\\t-ms-flex-direction: column;\\n\\t\\tflex-direction: column;\\n\\t\\tcolor: #3feee6;\\n\\t\\toverflow: hidden;\\n\\t\\t-webkit-clip-path: polygon(0 100%, 100% 0, 100% 100%, 100% 100%);\\n\\t\\tclip-path: polygon(0 100%, 100% 0, 100% 100%, 100% 100%);\\n\\t}\\n\\n\\t.card-title {\\n\\t\\tposition: absolute;\\n\\t\\tright: 10px;\\n\\t\\ttext-align: right;\\n\\t\\tfont-size: 1.7vmax;\\n\\t\\ttext-transform: uppercase;\\n\\t\\twidth: 100%;\\n\\t\\ttop: 53%;\\n\\t\\t-webkit-transform: rotate(var(--sub-container-diagonal));\\n\\t\\ttransform: rotate(var(--sub-container-diagonal));\\n\\t\\tcolor: #222121;\\n\\t\\tcursor: pointer;\\n\\t\\tbackground-color: #1f2b62;\\n\\t\\tbackground-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);\\n\\t\\tbackground-repeat: no-repeat;\\n\\t\\tbackground-size: 100%;\\n\\t\\t-webkit-background-clip: text;\\n\\t\\tbackground-clip: text;\\n\\t\\tcolor: transparent;\\n\\t\\t-webkit-text-fill-color: transparent;\\n\\t}\\n\\n\\t.experience {\\n\\t\\tbackground-color: var(--orange);\\n\\t}\\n\\t.experience .card-title {\\n\\t\\t-webkit-animation: cardTitleText 3s linear infinite;\\n\\t\\tanimation: cardTitleText 3s linear infinite;\\n\\t}\\n\\n\\t.about {\\n\\t\\tbackground-color: var(--blue);\\n\\t\\t-webkit-transform: translateY(5vh);\\n\\t\\ttransform: translateY(5vh);\\n\\t}\\n\\n\\t.about .card-title {\\n\\t\\t-webkit-animation: cardTitleText 3s linear 0.5s infinite;\\n\\t\\tanimation: cardTitleText 3s linear 0.5s infinite;\\n\\t}\\n\\n\\t.contact {\\n\\t\\tbackground-color: var(--light-blue);\\n\\t\\t-webkit-transform: translateY(10vh);\\n\\t\\ttransform: translateY(10vh);\\n\\t}\\n\\t.contact .card-title {\\n\\t\\t-webkit-animation: cardTitleText 3s linear 1s infinite;\\n\\t\\tanimation: cardTitleText 3s linear 1s infinite;\\n\\t}\\n\\n\\t.extra {\\n\\t\\tbackground-color: var(--black);\\n\\t\\t-webkit-clip-path: polygon(0 20vh, 100% 0, 100% 100%, 0% 100%);\\n\\t\\tclip-path: polygon(0 20vh, 100% 0, 100% 100%, 0% 100%);\\n\\t\\t-webkit-transform: translateY(15vh);\\n\\t\\ttransform: translateY(15vh);\\n\\t}\\n\\n\\t@-webkit-keyframes cardTitleText {\\n\\t\\t0% {\\n\\t\\t\\tbackground-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);\\n\\t\\t}\\n\\t\\t5% {\\n\\t\\t\\tbackground-image: linear-gradient(43deg, #222121 94%, #ffffff 100%);\\n\\t\\t}\\n\\t\\t10% {\\n\\t\\t\\tbackground-image: linear-gradient(43deg, #222121 94%, #ffffff 100%);\\n\\t\\t}\\n\\t\\t15% {\\n\\t\\t\\tbackground-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\tbackground-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);\\n\\t\\t}\\n\\t}\\n\\n\\t@keyframes cardTitleText {\\n\\t\\t0% {\\n\\t\\t\\tbackground-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);\\n\\t\\t}\\n\\t\\t5% {\\n\\t\\t\\tbackground-image: linear-gradient(43deg, #222121 94%, #ffffff 100%);\\n\\t\\t}\\n\\t\\t10% {\\n\\t\\t\\tbackground-image: linear-gradient(43deg, #222121 94%, #ffffff 100%);\\n\\t\\t}\\n\\t\\t15% {\\n\\t\\t\\tbackground-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\tbackground-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"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"}`
};
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let textAngle;
  $$result.css.add(css$e);
  return `${$$result.head += `${$$result.title = `<title>Nathan Meeker || Home</title>`, ""}`, ""}



<div class="${"main-container svelte-1ah978p"}"><div class="${"title svelte-1ah978p"}"><div><div class="${"animated-text"}"><div class="${"title-block svelte-1ah978p"}"><span class="${"title-main gradient-text svelte-1ah978p"}">Nathan Meeker</span>
					<span class="${"title-secondary gradient-text svelte-1ah978p"}">Come See the Whole Picture</span></div></div></div></div>
	<div id="${"card-container"}" class="${"card card-container svelte-1ah978p"}"><div class="${"card-layout experience experience-btn svelte-1ah978p"}"${add_attribute("this", textAngle, 0)}><h1 class="${"card-title svelte-1ah978p"}"><a href="${"/experience"}">Experience</a></h1></div>
		<div class="${"card-layout about about-btn svelte-1ah978p"}"><h1 class="${"card-title svelte-1ah978p"}"><a href="${"/about"}">About</a></h1></div>
		<div class="${"card-layout contact contact-btn svelte-1ah978p"}"><h1 class="${"card-title svelte-1ah978p"}"><a href="${"/contact"}">Contact</a></h1></div>
		<div class="${"card-layout extra extra-btn svelte-1ah978p"}"></div></div>
</div>`;
});
var index$2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
var css$d = {
  code: ".title-bar.svelte-1rb047f{position:sticky;top:7vh;margin:30px auto;display:flex;justify-content:center;align-content:center;z-index:1;min-height:10vh}.header.svelte-1rb047f{margin-top:0px;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:90%;text-align:center}h1.svelte-1rb047f{height:max-content;font-size:5.5vmax;font-family:Roboto, Helvetica, sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:transparent;-webkit-text-fill-color:transparent;background:center\n			linear-gradient(\n				to right,\n				var(--shadow-color) 0%,\n				var(--header-color) 50%,\n				var(--header-color) 60%,\n				var(--shadow-color) 100%\n			);background-size:60%;background-clip:text;-webkit-background-clip:text;animation:svelte-1rb047f-shimmer 4s linear infinite alternate;-webkit-animation:svelte-1rb047f-shimmer 4s linear infinite alternate}@keyframes svelte-1rb047f-shimmer{0%{background-position:left}80%{background-position:left}100%{background-position:right}}@media only screen and (max-width: 600px){.title-bar.svelte-1rb047f{top:7vh;min-height:15vh}h1.svelte-1rb047f{font-size:3em;text-align:center;letter-spacing:normal}}",
  map: '{"version":3,"file":"SubPageTitleBar.svelte","sources":["SubPageTitleBar.svelte"],"sourcesContent":["<script lang=\\"ts\\">export let title;\\nexport let colorVar;\\nexport let textColor;\\n<\/script>\\n\\n<div class=\\"title-bar\\" style=\\"background-color: {colorVar}\\">\\n\\t<header class=\\"header\\">\\n\\t\\t<h1 style=\\"--header-color: {textColor};\\">\\n\\t\\t\\t{title}\\n\\t\\t</h1>\\n\\t</header>\\n</div>\\n\\n<style>\\n\\t.title-bar {\\n\\t\\tposition: sticky;\\n\\t\\ttop: 7vh;\\n\\t\\tmargin: 30px auto;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-content: center;\\n\\t\\tz-index: 1;\\n\\t\\tmin-height: 10vh;\\n\\t}\\n\\t.header {\\n\\t\\tmargin-top: 0px;\\n\\t\\tposition: absolute;\\n\\t\\ttop: 50%;\\n\\t\\tleft: 50%;\\n\\t\\ttransform: translate(-50%, -50%);\\n\\t\\twidth: 90%;\\n\\t\\ttext-align: center;\\n\\t}\\n\\th1 {\\n\\t\\theight: max-content;\\n\\t\\tfont-size: 5.5vmax;\\n\\t\\tfont-family: Roboto, Helvetica, sans-serif;\\n\\t\\tfont-weight: 700;\\n\\t\\ttext-transform: uppercase;\\n\\t\\tletter-spacing: 0.2em;\\n\\t\\tcolor: transparent;\\n\\t\\t-webkit-text-fill-color: transparent;\\n\\t\\tbackground: center\\n\\t\\t\\tlinear-gradient(\\n\\t\\t\\t\\tto right,\\n\\t\\t\\t\\tvar(--shadow-color) 0%,\\n\\t\\t\\t\\tvar(--header-color) 50%,\\n\\t\\t\\t\\tvar(--header-color) 60%,\\n\\t\\t\\t\\tvar(--shadow-color) 100%\\n\\t\\t\\t);\\n\\t\\tbackground-size: 60%;\\n\\t\\tbackground-clip: text;\\n\\t\\t-webkit-background-clip: text;\\n\\t\\tanimation: shimmer 4s linear infinite alternate;\\n\\t\\t-webkit-animation: shimmer 4s linear infinite alternate;\\n\\t}\\n\\n\\t@keyframes shimmer {\\n\\t\\t0% {\\n\\t\\t\\tbackground-position: left;\\n\\t\\t}\\n\\t\\t80% {\\n\\t\\t\\tbackground-position: left;\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\tbackground-position: right;\\n\\t\\t}\\n\\t}\\n\\n\\t@media only screen and (max-width: 600px) {\\n\\t\\t.title-bar {\\n\\t\\t\\ttop: 7vh;\\n\\t\\t\\tmin-height: 15vh;\\n\\t\\t}\\n\\t\\th1 {\\n\\t\\t\\tfont-size: 3em;\\n\\t\\t\\ttext-align: center;\\n\\t\\t\\tletter-spacing: normal;\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAcC,UAAU,eAAC,CAAC,AACX,QAAQ,CAAE,MAAM,CAChB,GAAG,CAAE,GAAG,CACR,MAAM,CAAE,IAAI,CAAC,IAAI,CACjB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,aAAa,CAAE,MAAM,CACrB,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,IAAI,AACjB,CAAC,AACD,OAAO,eAAC,CAAC,AACR,UAAU,CAAE,GAAG,CACf,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CACT,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,CAChC,KAAK,CAAE,GAAG,CACV,UAAU,CAAE,MAAM,AACnB,CAAC,AACD,EAAE,eAAC,CAAC,AACH,MAAM,CAAE,WAAW,CACnB,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,MAAM,CAAC,CAAC,SAAS,CAAC,CAAC,UAAU,CAC1C,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,SAAS,CACzB,cAAc,CAAE,KAAK,CACrB,KAAK,CAAE,WAAW,CAClB,uBAAuB,CAAE,WAAW,CACpC,UAAU,CAAE,MAAM;GACjB;IACC,EAAE,CAAC,KAAK,CAAC;IACT,IAAI,cAAc,CAAC,CAAC,EAAE,CAAC;IACvB,IAAI,cAAc,CAAC,CAAC,GAAG,CAAC;IACxB,IAAI,cAAc,CAAC,CAAC,GAAG,CAAC;IACxB,IAAI,cAAc,CAAC,CAAC,IAAI;IACxB,CACF,eAAe,CAAE,GAAG,CACpB,eAAe,CAAE,IAAI,CACrB,uBAAuB,CAAE,IAAI,CAC7B,SAAS,CAAE,sBAAO,CAAC,EAAE,CAAC,MAAM,CAAC,QAAQ,CAAC,SAAS,CAC/C,iBAAiB,CAAE,sBAAO,CAAC,EAAE,CAAC,MAAM,CAAC,QAAQ,CAAC,SAAS,AACxD,CAAC,AAED,WAAW,sBAAQ,CAAC,AACnB,EAAE,AAAC,CAAC,AACH,mBAAmB,CAAE,IAAI,AAC1B,CAAC,AACD,GAAG,AAAC,CAAC,AACJ,mBAAmB,CAAE,IAAI,AAC1B,CAAC,AACD,IAAI,AAAC,CAAC,AACL,mBAAmB,CAAE,KAAK,AAC3B,CAAC,AACF,CAAC,AAED,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1C,UAAU,eAAC,CAAC,AACX,GAAG,CAAE,GAAG,CACR,UAAU,CAAE,IAAI,AACjB,CAAC,AACD,EAAE,eAAC,CAAC,AACH,SAAS,CAAE,GAAG,CACd,UAAU,CAAE,MAAM,CAClB,cAAc,CAAE,MAAM,AACvB,CAAC,AACF,CAAC"}'
};
var SubPageTitleBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  let { colorVar } = $$props;
  let { textColor } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.colorVar === void 0 && $$bindings.colorVar && colorVar !== void 0)
    $$bindings.colorVar(colorVar);
  if ($$props.textColor === void 0 && $$bindings.textColor && textColor !== void 0)
    $$bindings.textColor(textColor);
  $$result.css.add(css$d);
  return `<div class="${"title-bar svelte-1rb047f"}" style="${"background-color: " + escape(colorVar)}"><header class="${"header svelte-1rb047f"}"><h1 style="${"--header-color: " + escape(textColor) + ";"}" class="${"svelte-1rb047f"}">${escape(title)}</h1></header>
</div>`;
});
var css$c = {
  code: ".container.svelte-jbbb8d{display:flex;flex-direction:column;cursor:pointer}.perspective.svelte-jbbb8d{transform-style:preserve-3d;position:absolute;top:44%;left:44%;transform:translate3d(-50%, -50%, 0);pointer-events:none}.text.svelte-jbbb8d{font-size:1.5em;-webkit-backface-visibility:hidden;-moz-backface-visibility:hidden;backface-visibility:hidden;transform:preserve-3d;margin:0px auto;text-align:center;pointer-events:none}.text.svelte-jbbb8d span{position:absolute;text-transform:uppercase;-webkit-backface-visibility:hidden;-moz-backface-visibility:hidden;backface-visibility:hidden;top:0;left:0;width:45px;text-align:center;transform-origin:center;transform-style:preserve-3d;transform:rotateY(\n				calc(var(--degOff) + calc(var(--rot-posit) * calc(var(--spread) / var(--totalLetters))))\n			)\n			translateZ(200px)}.card-sm.svelte-jbbb8d{position:relative;width:300px;height:300px;padding:10px;margin-bottom:60px;display:flex;justify-content:center;align-items:center;text-align:center;font-size:1.3em;border-radius:50%;box-shadow:inset 0px 0px 380px var(--orange), inset 0px 5px 60px rgb(10, 10, 10);cursor:pointer;z-index:0;pointer-events:none}.card-sm.svelte-jbbb8d::after{content:'';width:5px;height:5px;background-color:#444444;border-radius:50%;display:block;position:absolute;bottom:-50px;transform:rotate3d(1, 0, 0, 80deg);-webkit-box-shadow:0px 0px 100px 2px #444444;-moz-box-shadow:0px 0px 8px 2px #444444;box-shadow:0px 0px 100px 100px #444444;pointer-events:none}.details.svelte-jbbb8d{color:var(--orange);border:solid 2px var(--orange)}.muted.svelte-jbbb8d{filter:opacity(0.5) grayscale(0.4);transform:scale(0.7)}",
  map: `{"version":3,"file":"GlobeText.svelte","sources":["GlobeText.svelte"],"sourcesContent":["<script lang=\\"ts\\">let deg = 0;\\nlet rotationSpeed;\\nlet globe;\\nexport let totalTitleLetters;\\nexport let spread;\\nexport let route;\\n// Updates the central degree for text 360deg rotation.\\nconst updateDeg = () => {\\n    rotationSpeed = setInterval(() => {\\n        if (deg < 360)\\n            return (deg += 1);\\n        return clearInterval(rotationSpeed);\\n    }, 1);\\n};\\n//focuses the globe\\nconst unmute = () => {\\n    if (!globe.classList.contains('muted'))\\n        return;\\n    globe.classList.remove('muted');\\n    deg = 0;\\n    updateDeg();\\n};\\n//Removes focus from the globe\\nconst mute = () => {\\n    if (globe.classList.contains('muted'))\\n        return;\\n    globe.classList.add('muted');\\n    clearInterval(rotationSpeed);\\n    deg = 0;\\n};\\n<\/script>\\n\\n<div\\n\\tclass=\\"container muted\\"\\n\\tbind:this={globe}\\n\\ton:mouseover={unmute}\\n\\ton:focus={unmute}\\n\\ton:blur={mute}\\n\\ton:mouseout={mute}\\n>\\n\\t<div class=\\"card-sm\\">\\n\\t\\t<div class=\\"perspective\\">\\n\\t\\t\\t<h1\\n\\t\\t\\t\\tclass=\\"text\\"\\n\\t\\t\\t\\tstyle=\\"--degOff:-{deg}deg; --totalLetters:{totalTitleLetters}; --spread: {spread}deg;\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t<slot name=\\"title\\" />\\n\\t\\t\\t</h1>\\n\\t\\t</div>\\n\\t</div>\\n\\t<a class=\\"btn btn-main details\\" href={route}>details</a>\\n</div>\\n\\n<style>\\n\\t.container {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\tcursor: pointer;\\n\\t}\\n\\t.perspective {\\n\\t\\ttransform-style: preserve-3d;\\n\\t\\tposition: absolute;\\n\\t\\ttop: 44%;\\n\\t\\tleft: 44%;\\n\\t\\ttransform: translate3d(-50%, -50%, 0);\\n\\t\\tpointer-events: none;\\n\\t}\\n\\n\\t.text {\\n\\t\\tfont-size: 1.5em;\\n\\t\\t-webkit-backface-visibility: hidden;\\n\\t\\t-moz-backface-visibility: hidden;\\n\\t\\tbackface-visibility: hidden;\\n\\t\\ttransform: preserve-3d;\\n\\t\\tmargin: 0px auto;\\n\\t\\ttext-align: center;\\n\\t\\tpointer-events: none;\\n\\t}\\n\\t.text :global(span) {\\n\\t\\tposition: absolute;\\n\\t\\ttext-transform: uppercase;\\n\\t\\t-webkit-backface-visibility: hidden;\\n\\t\\t-moz-backface-visibility: hidden;\\n\\t\\tbackface-visibility: hidden;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\twidth: 45px;\\n\\t\\ttext-align: center;\\n\\t\\ttransform-origin: center;\\n\\t\\ttransform-style: preserve-3d;\\n\\t\\ttransform: rotateY(\\n\\t\\t\\t\\tcalc(var(--degOff) + calc(var(--rot-posit) * calc(var(--spread) / var(--totalLetters))))\\n\\t\\t\\t)\\n\\t\\t\\ttranslateZ(200px);\\n\\t}\\n\\n\\t.card-sm {\\n\\t\\tposition: relative;\\n\\t\\twidth: 300px;\\n\\t\\theight: 300px;\\n\\t\\tpadding: 10px;\\n\\t\\tmargin-bottom: 60px;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\ttext-align: center;\\n\\t\\tfont-size: 1.3em;\\n\\t\\tborder-radius: 50%;\\n\\t\\tbox-shadow: inset 0px 0px 380px var(--orange), inset 0px 5px 60px rgb(10, 10, 10);\\n\\t\\tcursor: pointer;\\n\\t\\tz-index: 0;\\n\\t\\tpointer-events: none;\\n\\t}\\n\\t.card-sm::after {\\n\\t\\tcontent: '';\\n\\t\\twidth: 5px;\\n\\t\\theight: 5px;\\n\\t\\tbackground-color: #444444;\\n\\t\\tborder-radius: 50%;\\n\\t\\tdisplay: block;\\n\\t\\tposition: absolute;\\n\\t\\tbottom: -50px;\\n\\t\\ttransform: rotate3d(1, 0, 0, 80deg);\\n\\t\\t-webkit-box-shadow: 0px 0px 100px 2px #444444;\\n\\t\\t-moz-box-shadow: 0px 0px 8px 2px #444444;\\n\\t\\tbox-shadow: 0px 0px 100px 100px #444444;\\n\\t\\tpointer-events: none;\\n\\t}\\n\\t.details {\\n\\t\\tcolor: var(--orange);\\n\\t\\tborder: solid 2px var(--orange);\\n\\t}\\n\\t.muted {\\n\\t\\tfilter: opacity(0.5) grayscale(0.4);\\n\\t\\ttransform: scale(0.7);\\n\\t}\\n</style>\\n"],"names":[],"mappings":"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"}`
};
var GlobeText = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let deg = 0;
  let globe;
  let { totalTitleLetters } = $$props;
  let { spread } = $$props;
  let { route } = $$props;
  if ($$props.totalTitleLetters === void 0 && $$bindings.totalTitleLetters && totalTitleLetters !== void 0)
    $$bindings.totalTitleLetters(totalTitleLetters);
  if ($$props.spread === void 0 && $$bindings.spread && spread !== void 0)
    $$bindings.spread(spread);
  if ($$props.route === void 0 && $$bindings.route && route !== void 0)
    $$bindings.route(route);
  $$result.css.add(css$c);
  return `<div class="${"container muted svelte-jbbb8d"}"${add_attribute("this", globe, 0)}><div class="${"card-sm svelte-jbbb8d"}"><div class="${"perspective svelte-jbbb8d"}"><h1 class="${"text svelte-jbbb8d"}" style="${"--degOff:-" + escape(deg) + "deg; --totalLetters:" + escape(totalTitleLetters) + "; --spread: " + escape(spread) + "deg;"}">${slots.title ? slots.title({}) : ``}</h1></div></div>
	<a class="${"btn btn-main details svelte-jbbb8d"}"${add_attribute("href", route, 0)}>details</a>
</div>`;
});
var GlobeText$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": GlobeText
});
var css$b = {
  code: ".card-container.svelte-1dznal4{display:flex;flex-wrap:wrap;align-content:center;justify-content:center;width:100%;margin:10px auto 10px auto}.center-text.svelte-1dznal4{text-align:center;padding:15px;font-weight:400;font-size:1.5em}",
  map: `{"version":3,"file":"ExperienceHeader.svelte","sources":["ExperienceHeader.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { fly, fade } from 'svelte/transition';\\nimport SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';\\nimport GlobeText from './GlobeText.svelte';\\n<\/script>\\n\\n<div in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>\\n\\t<SubPageTitleBar title={'experience'} colorVar={'white'} textColor={'rgb(238, 174, 37)'} />\\n\\t<div class=\\"container-border\\">\\n\\t\\t<div class=\\"card-container\\">\\n\\t\\t\\t<div class=\\"one\\">\\n\\t\\t\\t\\t<!-- This is a component load for the globe animations -->\\n\\t\\t\\t\\t<GlobeText totalTitleLetters={7} spread={50} route={'#general'}>\\n\\t\\t\\t\\t\\t<span slot=\\"title\\">\\n\\t\\t\\t\\t\\t\\t<!--  Note the span with slot name It identifies which slot -->\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-3;\\">g</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-2;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-1;\\">n</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:0;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:1;\\">r</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:2;\\">a</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:3;\\">l</span>\\n\\t\\t\\t\\t\\t</span>\\n\\t\\t\\t\\t</GlobeText>\\n\\t\\t\\t\\t<!-- End of the first globe animation -->\\n\\t\\t\\t</div>\\n\\t\\t\\t<div class=\\"two\\">\\n\\t\\t\\t\\t<!--  The route should mirror the div ID that you want the scroll to go to in globeText -->\\n\\t\\t\\t\\t<GlobeText totalTitleLetters={14} spread={110} route={'#network-security'}>\\n\\t\\t\\t\\t\\t<span slot=\\"title\\">\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-6;\\">c</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-5;\\">y</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-4;\\">b</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-3;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-2;\\">r</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-1;\\" />\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:0;\\">s</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:1;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:2;\\">c</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:3;\\">u</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:4;\\">r</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:5;\\">i</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:6;\\">t</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:7;\\">y</span>\\n\\t\\t\\t\\t\\t</span>\\n\\t\\t\\t\\t</GlobeText>\\n\\t\\t\\t</div>\\n\\t\\t\\t<div class=\\"three\\">\\n\\t\\t\\t\\t<GlobeText totalTitleLetters={15} spread={100} route={'#web-development'}>\\n\\t\\t\\t\\t\\t<span slot=\\"title\\">\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-7;\\">w</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-6;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-5;\\">b</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-4;\\" />\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-3;\\">d</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-2;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-1;\\">v</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:0;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:1;\\">l</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:2;\\">o</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:3;\\">p</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:4;\\">m</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:5;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:6;\\">n</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:7;\\">t</span>\\n\\t\\t\\t\\t\\t</span>\\n\\t\\t\\t\\t</GlobeText>\\n\\t\\t\\t</div>\\n\\t\\t\\t<div class=\\"four\\">\\n\\t\\t\\t\\t<GlobeText totalTitleLetters={19} spread={120} route={'#security-management'}>\\n\\t\\t\\t\\t\\t<span slot=\\"title\\">\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-9;\\">s</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-8;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-7;\\">c</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-6;\\">u</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-5;\\">r</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-4;\\">i</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-3;\\">t</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-2;\\">y</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-1;\\" />\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:0;\\">m</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:1;\\">a</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:2;\\">n</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:3;\\">a</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:4;\\">g</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:5;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:6;\\">m</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:7;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:8;\\">n</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:9;\\">t</span>\\n\\t\\t\\t\\t\\t</span>\\n\\t\\t\\t\\t</GlobeText>\\n\\t\\t\\t</div>\\n\\t\\t\\t<div class=\\"five\\">\\n\\t\\t\\t\\t<GlobeText totalTitleLetters={9} spread={60} route={'#education'}>\\n\\t\\t\\t\\t\\t<span slot=\\"title\\">\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-5;\\">c</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-4;\\">r</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-3;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-2;\\">d</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:-1;\\">e</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:0;\\">n</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:1;\\">t</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:2;\\">i</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:3;\\">a</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:4;\\">l</span>\\n\\t\\t\\t\\t\\t\\t<span style=\\"--rot-posit:5;\\">s</span>\\n\\t\\t\\t\\t\\t</span>\\n\\t\\t\\t\\t</GlobeText>\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t\\t<p class=\\"center-text\\">\\n\\t\\t\\t<em>You can also check out my social media links at the bottom of this page.</em>\\n\\t\\t</p>\\n\\t</div>\\n</div>\\n\\n<style>\\n\\t.card-container {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-wrap: wrap;\\n\\t\\talign-content: center;\\n\\t\\tjustify-content: center;\\n\\t\\twidth: 100%;\\n\\t\\tmargin: 10px auto 10px auto;\\n\\t}\\n\\n\\t.center-text {\\n\\t\\ttext-align: center;\\n\\t\\tpadding: 15px;\\n\\t\\tfont-weight: 400;\\n\\t\\tfont-size: 1.5em;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAqHC,eAAe,eAAC,CAAC,AAChB,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,IAAI,CACf,aAAa,CAAE,MAAM,CACrB,eAAe,CAAE,MAAM,CACvB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CAAC,IAAI,AAC5B,CAAC,AAED,YAAY,eAAC,CAAC,AACb,UAAU,CAAE,MAAM,CAClB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,GAAG,CAChB,SAAS,CAAE,KAAK,AACjB,CAAC"}`
};
var ExperienceHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$b);
  return `<div>${validate_component(SubPageTitleBar, "SubPageTitleBar").$$render($$result, {
    title: "experience",
    colorVar: "white",
    textColor: "rgb(238, 174, 37)"
  }, {}, {})}
	<div class="${"container-border"}"><div class="${"card-container svelte-1dznal4"}"><div class="${"one"}">
				${validate_component(GlobeText, "GlobeText").$$render($$result, {
    totalTitleLetters: 7,
    spread: 50,
    route: "#general"
  }, {}, {
    title: () => `<span slot="${"title"}">
						<span style="${"--rot-posit:-3;"}">g</span>
						<span style="${"--rot-posit:-2;"}">e</span>
						<span style="${"--rot-posit:-1;"}">n</span>
						<span style="${"--rot-posit:0;"}">e</span>
						<span style="${"--rot-posit:1;"}">r</span>
						<span style="${"--rot-posit:2;"}">a</span>
						<span style="${"--rot-posit:3;"}">l</span></span>`
  })}
				</div>
			<div class="${"two"}">
				${validate_component(GlobeText, "GlobeText").$$render($$result, {
    totalTitleLetters: 14,
    spread: 110,
    route: "#network-security"
  }, {}, {
    title: () => `<span slot="${"title"}"><span style="${"--rot-posit:-6;"}">c</span>
						<span style="${"--rot-posit:-5;"}">y</span>
						<span style="${"--rot-posit:-4;"}">b</span>
						<span style="${"--rot-posit:-3;"}">e</span>
						<span style="${"--rot-posit:-2;"}">r</span>
						<span style="${"--rot-posit:-1;"}"></span>
						<span style="${"--rot-posit:0;"}">s</span>
						<span style="${"--rot-posit:1;"}">e</span>
						<span style="${"--rot-posit:2;"}">c</span>
						<span style="${"--rot-posit:3;"}">u</span>
						<span style="${"--rot-posit:4;"}">r</span>
						<span style="${"--rot-posit:5;"}">i</span>
						<span style="${"--rot-posit:6;"}">t</span>
						<span style="${"--rot-posit:7;"}">y</span></span>`
  })}</div>
			<div class="${"three"}">${validate_component(GlobeText, "GlobeText").$$render($$result, {
    totalTitleLetters: 15,
    spread: 100,
    route: "#web-development"
  }, {}, {
    title: () => `<span slot="${"title"}"><span style="${"--rot-posit:-7;"}">w</span>
						<span style="${"--rot-posit:-6;"}">e</span>
						<span style="${"--rot-posit:-5;"}">b</span>
						<span style="${"--rot-posit:-4;"}"></span>
						<span style="${"--rot-posit:-3;"}">d</span>
						<span style="${"--rot-posit:-2;"}">e</span>
						<span style="${"--rot-posit:-1;"}">v</span>
						<span style="${"--rot-posit:0;"}">e</span>
						<span style="${"--rot-posit:1;"}">l</span>
						<span style="${"--rot-posit:2;"}">o</span>
						<span style="${"--rot-posit:3;"}">p</span>
						<span style="${"--rot-posit:4;"}">m</span>
						<span style="${"--rot-posit:5;"}">e</span>
						<span style="${"--rot-posit:6;"}">n</span>
						<span style="${"--rot-posit:7;"}">t</span></span>`
  })}</div>
			<div class="${"four"}">${validate_component(GlobeText, "GlobeText").$$render($$result, {
    totalTitleLetters: 19,
    spread: 120,
    route: "#security-management"
  }, {}, {
    title: () => `<span slot="${"title"}"><span style="${"--rot-posit:-9;"}">s</span>
						<span style="${"--rot-posit:-8;"}">e</span>
						<span style="${"--rot-posit:-7;"}">c</span>
						<span style="${"--rot-posit:-6;"}">u</span>
						<span style="${"--rot-posit:-5;"}">r</span>
						<span style="${"--rot-posit:-4;"}">i</span>
						<span style="${"--rot-posit:-3;"}">t</span>
						<span style="${"--rot-posit:-2;"}">y</span>
						<span style="${"--rot-posit:-1;"}"></span>
						<span style="${"--rot-posit:0;"}">m</span>
						<span style="${"--rot-posit:1;"}">a</span>
						<span style="${"--rot-posit:2;"}">n</span>
						<span style="${"--rot-posit:3;"}">a</span>
						<span style="${"--rot-posit:4;"}">g</span>
						<span style="${"--rot-posit:5;"}">e</span>
						<span style="${"--rot-posit:6;"}">m</span>
						<span style="${"--rot-posit:7;"}">e</span>
						<span style="${"--rot-posit:8;"}">n</span>
						<span style="${"--rot-posit:9;"}">t</span></span>`
  })}</div>
			<div class="${"five"}">${validate_component(GlobeText, "GlobeText").$$render($$result, {
    totalTitleLetters: 9,
    spread: 60,
    route: "#education"
  }, {}, {
    title: () => `<span slot="${"title"}"><span style="${"--rot-posit:-5;"}">c</span>
						<span style="${"--rot-posit:-4;"}">r</span>
						<span style="${"--rot-posit:-3;"}">e</span>
						<span style="${"--rot-posit:-2;"}">d</span>
						<span style="${"--rot-posit:-1;"}">e</span>
						<span style="${"--rot-posit:0;"}">n</span>
						<span style="${"--rot-posit:1;"}">t</span>
						<span style="${"--rot-posit:2;"}">i</span>
						<span style="${"--rot-posit:3;"}">a</span>
						<span style="${"--rot-posit:4;"}">l</span>
						<span style="${"--rot-posit:5;"}">s</span></span>`
  })}</div></div>
		<p class="${"center-text svelte-1dznal4"}"><em>You can also check out my social media links at the bottom of this page.</em></p></div>
</div>`;
});
var ExperienceHeader$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": ExperienceHeader
});
var css$a = {
  code: ".layout-container.svelte-1j2vmps{min-height:90vh;width:100%}",
  map: `{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script>\\n\\timport ExperienceHeader from './experienceComponents/ExperienceHeader.svelte';\\n<\/script>\\n\\n<ExperienceHeader />\\n<div class=\\"layout-container\\">\\n\\t<slot />\\n</div>\\n\\n<style>\\n\\t.layout-container {\\n\\t\\tmin-height: 90vh;\\n\\t\\twidth: 100%;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAUC,iBAAiB,eAAC,CAAC,AAClB,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,IAAI,AACZ,CAAC"}`
};
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$a);
  return `${validate_component(ExperienceHeader, "ExperienceHeader").$$render($$result, {}, {}, {})}
<div class="${"layout-container svelte-1j2vmps"}">${slots.default ? slots.default({}) : ``}
</div>`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
var css$9 = {
  code: ".container.svelte-1jllv94{position:relative;display:grid;place-items:center;grid-template-areas:'text text image'\n			'. scroll-btn .';min-height:70vh;margin:20px auto 0px auto;padding:2em}.scroll-btn.svelte-1jllv94{grid-area:scroll-btn}.image{grid-area:image;height:25vmax;width:40vmax;margin:20px;border-radius:0.9em;box-shadow:inset 0 0 40px var(--shadow-color), 5px 10px 25px var(--experience-text);background-position:center}.default-image.svelte-1jllv94{background:linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)), no-repeat}.content.svelte-1jllv94{grid-area:text;width:clamp(400px, 100%, 900px);font-size:1.5em;padding:10px}.experience-p,.experience-strong,.experience-a,.experience-li{margin:40px auto 40px auto;color:var(--experience-text)}.experience-h2{font-size:1.3em}.experience-p,.experience-strong{line-height:2em}@media only screen and (max-width: 1500px){.container.svelte-1jllv94{grid-template-areas:'image'\n				'text'\n				'scroll-btn';padding:5px}.image{height:50vmax;width:90vmax}.content.svelte-1jllv94{width:90%}}@media only screen and (max-width: 850px){.image{height:25vmax;width:50vmax}.image>p{font-size:2em}}",
  map: `{"version":3,"file":"ExperienceStyles.svelte","sources":["ExperienceStyles.svelte"],"sourcesContent":["<script>\\n\\tconst scrollTop = () => {\\n\\t\\twindow.scrollTo(0, 0);\\n\\t};\\n<\/script>\\n\\n<div class=\\"container\\">\\n\\t<slot name=\\"image\\">\\n\\t\\t<div class=\\"image default-image\\">No content</div>\\n\\t</slot>\\n\\n\\t<div class=\\"content\\">\\n\\t\\t<slot name=\\"content\\">\\n\\t\\t\\t<div class=\\"content\\">nothing to show</div>\\n\\t\\t</slot>\\n\\t</div>\\n\\t<button class=\\"btn btn-main btn-center scroll-btn\\" on:click={scrollTop}>Scroll Top</button>\\n</div>\\n\\n<!-- Update the global style items tomorrow because the current system acting as global css.-->\\n<style>\\n\\t.container {\\n\\t\\tposition: relative;\\n\\t\\tdisplay: grid;\\n\\t\\tplace-items: center;\\n\\t\\tgrid-template-areas:\\n\\t\\t\\t'text text image'\\n\\t\\t\\t'. scroll-btn .';\\n\\t\\tmin-height: 70vh;\\n\\t\\tmargin: 20px auto 0px auto;\\n\\t\\tpadding: 2em;\\n\\t}\\n\\t.scroll-btn {\\n\\t\\tgrid-area: scroll-btn;\\n\\t}\\n\\n\\t:global(.image) {\\n\\t\\tgrid-area: image;\\n\\t\\theight: 25vmax;\\n\\t\\twidth: 40vmax;\\n\\t\\tmargin: 20px;\\n\\t\\tborder-radius: 0.9em;\\n\\t\\tbox-shadow: inset 0 0 40px var(--shadow-color), 5px 10px 25px var(--experience-text);\\n\\t\\tbackground-position: center;\\n\\t}\\n\\n\\t.default-image {\\n\\t\\tbackground: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)), no-repeat;\\n\\t}\\n\\n\\t.content {\\n\\t\\tgrid-area: text;\\n\\t\\twidth: clamp(400px, 100%, 900px);\\n\\t\\tfont-size: 1.5em;\\n\\t\\tpadding: 10px;\\n\\t}\\n\\t:global(.experience-p),\\n\\t:global(.experience-strong),\\n\\t:global(.experience-a),\\n\\t:global(.experience-li) {\\n\\t\\tmargin: 40px auto 40px auto;\\n\\t\\tcolor: var(--experience-text);\\n\\t}\\n\\t:global(.experience-h2) {\\n\\t\\tfont-size: 1.3em;\\n\\t}\\n\\n\\t:global(.experience-p),\\n\\t:global(.experience-strong) {\\n\\t\\tline-height: 2em;\\n\\t}\\n\\n\\t@media only screen and (max-width: 1500px) {\\n\\t\\t.container {\\n\\t\\t\\tgrid-template-areas:\\n\\t\\t\\t\\t'image'\\n\\t\\t\\t\\t'text'\\n\\t\\t\\t\\t'scroll-btn';\\n\\t\\t\\tpadding: 5px;\\n\\t\\t}\\n\\t\\t:global(.image) {\\n\\t\\t\\theight: 50vmax;\\n\\t\\t\\twidth: 90vmax;\\n\\t\\t}\\n\\t\\t.content {\\n\\t\\t\\twidth: 90%;\\n\\t\\t}\\n\\t}\\n\\n\\t@media only screen and (max-width: 850px) {\\n\\t\\t:global(.image) {\\n\\t\\t\\theight: 25vmax;\\n\\t\\t\\twidth: 50vmax;\\n\\t\\t}\\n\\t\\t:global(.image) > :global(p) {\\n\\t\\t\\tfont-size: 2em;\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAqBC,UAAU,eAAC,CAAC,AACX,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,mBAAmB,CAClB,iBAAiB;GACjB,gBAAgB,CACjB,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,CAC1B,OAAO,CAAE,GAAG,AACb,CAAC,AACD,WAAW,eAAC,CAAC,AACZ,SAAS,CAAE,UAAU,AACtB,CAAC,AAEO,MAAM,AAAE,CAAC,AAChB,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,CACb,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,KAAK,CACpB,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,cAAc,CAAC,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,IAAI,iBAAiB,CAAC,CACpF,mBAAmB,CAAE,MAAM,AAC5B,CAAC,AAED,cAAc,eAAC,CAAC,AACf,UAAU,CAAE,gBAAgB,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,SAAS,AACzF,CAAC,AAED,QAAQ,eAAC,CAAC,AACT,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,MAAM,KAAK,CAAC,CAAC,IAAI,CAAC,CAAC,KAAK,CAAC,CAChC,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,IAAI,AACd,CAAC,AACO,aAAa,AAAC,CACd,kBAAkB,AAAC,CACnB,aAAa,AAAC,CACd,cAAc,AAAE,CAAC,AACxB,MAAM,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CAAC,IAAI,CAC3B,KAAK,CAAE,IAAI,iBAAiB,CAAC,AAC9B,CAAC,AACO,cAAc,AAAE,CAAC,AACxB,SAAS,CAAE,KAAK,AACjB,CAAC,AAEO,aAAa,AAAC,CACd,kBAAkB,AAAE,CAAC,AAC5B,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC3C,UAAU,eAAC,CAAC,AACX,mBAAmB,CAClB,OAAO;IACP,MAAM;IACN,YAAY,CACb,OAAO,CAAE,GAAG,AACb,CAAC,AACO,MAAM,AAAE,CAAC,AAChB,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,AACd,CAAC,AACD,QAAQ,eAAC,CAAC,AACT,KAAK,CAAE,GAAG,AACX,CAAC,AACF,CAAC,AAED,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAClC,MAAM,AAAE,CAAC,AAChB,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,AACd,CAAC,AACO,MAAM,AAAC,CAAW,CAAC,AAAE,CAAC,AAC7B,SAAS,CAAE,GAAG,AACf,CAAC,AACF,CAAC"}`
};
var ExperienceStyles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$9);
  return `<div class="${"container svelte-1jllv94"}">${slots.image ? slots.image({}) : `
		<div class="${"image default-image svelte-1jllv94"}">No content</div>
	`}

	<div class="${"content svelte-1jllv94"}">${slots.content ? slots.content({}) : `
			<div class="${"content svelte-1jllv94"}">nothing to show</div>
		`}</div>
	<button class="${"btn btn-main btn-center scroll-btn svelte-1jllv94"}">Scroll Top</button></div>

`;
});
var ExperienceStyles$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": ExperienceStyles
});
var css$8 = {
  code: ".general-image.svelte-2lrwj8{background:linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\n			url('/geo_at_sea.jpeg') no-repeat;background-size:cover}",
  map: `{"version":3,"file":"GeneralContent.svelte","sources":["GeneralContent.svelte"],"sourcesContent":["<script>\\n\\timport SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';\\n\\timport ExperienceStyles from './ExperienceStyles.svelte';\\n<\/script>\\n\\n<div id=\\"general\\">\\n\\t<SubPageTitleBar title={'General'} colorVar={'white'} textColor={'rgb(238, 174, 37)'} />\\n\\t<ExperienceStyles>\\n\\t\\t<span slot=\\"image\\">\\n\\t\\t\\t<div class=\\"general-image image\\" />\\n\\t\\t</span>\\n\\t\\t<span slot=\\"content\\">\\n\\t\\t\\t<div>\\n\\t\\t\\t\\t<h2 class=\\"experience-h2\\">\\n\\t\\t\\t\\t\\t<strong class=\\"experience-strong\\"\\n\\t\\t\\t\\t\\t\\t>More than two decades of professional experience in the US Navy:</strong\\n\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t</h2>\\n\\t\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\t\\tThe first 16 years I was enlisted, spending seven as a division level manager (Chief Petty\\n\\t\\t\\t\\t\\tOfficer) where I trained and led teams ranging from 5 to 15 members in submarine\\n\\t\\t\\t\\t\\tcommunications and electronic warfare techniques.\\n\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\t\\tSubsequently, I have spent the last decade as an Information Professional Officer,\\n\\t\\t\\t\\t\\tevaluating divisional performance across the submarine force. During this time I have\\n\\t\\t\\t\\t\\tinvested heavily in training divison managers and shipboard department heads on proper\\n\\t\\t\\t\\t\\tmanagment of key programs. Most often my skills were applied to physical and personnel\\n\\t\\t\\t\\t\\tsecurity, Communications (COMSEC) security, and Cyber Security with an emphasis on overall\\n\\t\\t\\t\\t\\tprogram management, compliance, and disaster recovery.\\n\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\t\\tMy project management skills have also extended to shipboard casualty and natural disaster\\n\\t\\t\\t\\t\\tresponse policy. I spent six years leading teams of up to fifty personnel in crisis and\\n\\t\\t\\t\\t\\temergency management where we developed and tested plans for initial response, recovery,\\n\\t\\t\\t\\t\\tand contengency operations. I hold multiple certifications and a diverse eduction and\\n\\t\\t\\t\\t\\ttraining background, which demonstrates my adapability and problem solving skills.\\n\\t\\t\\t\\t</p>\\n\\t\\t\\t</div>\\n\\t\\t</span>\\n\\t</ExperienceStyles>\\n</div>\\n\\n<style>\\n\\t.general-image {\\n\\t\\tbackground: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\\n\\t\\t\\turl('/geo_at_sea.jpeg') no-repeat;\\n\\t\\tbackground-size: cover;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA4CC,cAAc,cAAC,CAAC,AACf,UAAU,CAAE,gBAAgB,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;GAC7E,IAAI,kBAAkB,CAAC,CAAC,SAAS,CAClC,eAAe,CAAE,KAAK,AACvB,CAAC"}`
};
var GeneralContent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$8);
  return `<div id="${"general"}">${validate_component(SubPageTitleBar, "SubPageTitleBar").$$render($$result, {
    title: "General",
    colorVar: "white",
    textColor: "rgb(238, 174, 37)"
  }, {}, {})}
	${validate_component(ExperienceStyles, "ExperienceStyles").$$render($$result, {}, {}, {
    content: () => `<span slot="${"content"}"><div><h2 class="${"experience-h2"}"><strong class="${"experience-strong"}">More than two decades of professional experience in the US Navy:</strong></h2>
				<p class="${"experience-p"}">The first 16 years I was enlisted, spending seven as a division level manager (Chief Petty
					Officer) where I trained and led teams ranging from 5 to 15 members in submarine
					communications and electronic warfare techniques.
				</p>
				<p class="${"experience-p"}">Subsequently, I have spent the last decade as an Information Professional Officer,
					evaluating divisional performance across the submarine force. During this time I have
					invested heavily in training divison managers and shipboard department heads on proper
					managment of key programs. Most often my skills were applied to physical and personnel
					security, Communications (COMSEC) security, and Cyber Security with an emphasis on overall
					program management, compliance, and disaster recovery.
				</p>
				<p class="${"experience-p"}">My project management skills have also extended to shipboard casualty and natural disaster
					response policy. I spent six years leading teams of up to fifty personnel in crisis and
					emergency management where we developed and tested plans for initial response, recovery,
					and contengency operations. I hold multiple certifications and a diverse eduction and
					training background, which demonstrates my adapability and problem solving skills.
				</p></div></span>`,
    image: () => `<span slot="${"image"}"><div class="${"general-image image svelte-2lrwj8"}"></div></span>`
  })}
</div>`;
});
var GeneralContent$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": GeneralContent
});
var css$7 = {
  code: ".general-image.svelte-bflkz7.svelte-bflkz7{display:flex;justify-content:center;align-items:center;background:linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7));background:linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7));background-size:cover}.general-image.svelte-bflkz7>h2.svelte-bflkz7{font-family:'Gochi Hand', cursive;font-size:4em;text-align:center;color:var(--experience-text)}@media only screen and (max-width: 1500px){.general-image.svelte-bflkz7.svelte-bflkz7{height:30vmax;width:90vmax}}@media only screen and (max-width: 850px){.general-image.svelte-bflkz7.svelte-bflkz7{height:25vmax;width:50vmax}.general-image.svelte-bflkz7>h2.svelte-bflkz7{font-size:2em}}",
  map: `{"version":3,"file":"EducationCertifications.svelte","sources":["EducationCertifications.svelte"],"sourcesContent":["<script>\\n\\timport SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';\\n\\timport ExperienceStyles from './ExperienceStyles.svelte';\\n<\/script>\\n\\n<div id=\\"education\\">\\n\\t<SubPageTitleBar title={'Education'} colorVar={'white'} textColor={'rgb(238, 174, 37)'} />\\n\\t<ExperienceStyles>\\n\\t\\t<span slot=\\"image\\">\\n\\t\\t\\t<div class=\\"general-image image\\">\\n\\t\\t\\t\\t<h2>Knowledge is Power!</h2>\\n\\t\\t\\t</div>\\n\\t\\t</span>\\n\\t\\t<span slot=\\"content\\">\\n\\t\\t\\t<div>\\n\\t\\t\\t\\t<h2 class=\\"experience-h2\\">\\n\\t\\t\\t\\t\\t<strong class=\\"experience-strong\\">Professional Certifications/Education:</strong>\\n\\t\\t\\t\\t</h2>\\n\\t\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\t\\tI hold civilian and Department of Defense certifications in Cyber, Personnel and Physical\\n\\t\\t\\t\\t\\tSecurity along with a Bachelor's degree in Business Administration from Excelsior College.\\n\\t\\t\\t\\t\\tI am currently four classes from completing an MBA with an emphasis in\\n\\t\\t\\t\\t\\tTechnology/Innovation Management.\\n\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t<h2 class=\\"experience-h2\\">\\n\\t\\t\\t\\t\\t<strong class=\\"experience-strong\\"\\n\\t\\t\\t\\t\\t\\t>Security Professional Education and Development (SPeD) certifications:</strong\\n\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t</h2>\\n\\t\\t\\t\\t<ul class=\\"experience-ul\\">\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">\\n\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\tclass=\\"experience-a\\"\\n\\t\\t\\t\\t\\t\\t\\ttitle=\\"Center for Security Excellence SFPC certification webpage.\\"\\n\\t\\t\\t\\t\\t\\t\\thref=\\"https://www.cdse.edu/certification/sfpc.html\\"\\n\\t\\t\\t\\t\\t\\t\\t>Security Professional Fundamentals (SFPC) 3+ years</a\\n\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">\\n\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\tclass=\\"experience-a\\"\\n\\t\\t\\t\\t\\t\\t\\ttitle=\\"Center for Security Excellence PSC certification webpage.\\"\\n\\t\\t\\t\\t\\t\\t\\thref=\\"https://www.cdse.edu/certification/psc.html\\"\\n\\t\\t\\t\\t\\t\\t\\t>Physical Security Certification (PSC) 3+ years</a\\n\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t</ul>\\n\\t\\t\\t\\t<h2 class=\\"experience-h2\\">\\n\\t\\t\\t\\t\\t<strong class=\\"experience-strong\\">Additional Military Training:</strong>\\n\\t\\t\\t\\t</h2>\\n\\t\\t\\t\\t<ul class=\\"experience-ul\\">\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">\\n\\t\\t\\t\\t\\t\\tNavy Communications Security Management System <a\\n\\t\\t\\t\\t\\t\\t\\tclass=\\"experience-a\\"\\n\\t\\t\\t\\t\\t\\t\\ttitle=\\"Navy COMSEC Management System webpage.\\"\\n\\t\\t\\t\\t\\t\\t\\thref=\\"https://www.navifor.usff.navy.mil/ncms/\\">(NCMS)</a\\n\\t\\t\\t\\t\\t\\t> certified inspector 10+ years\\n\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">Information Systems Security Manager 7+ years</li>\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">Operational Security Officer 5+ years</li>\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">Emergency Management Officer 5+ years</li>\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">Classified Material Control Officer 10+ years</li>\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">Command Equal Opportunity Officer 2+ years</li>\\n\\t\\t\\t\\t</ul>\\n\\t\\t\\t\\t<h2 class=\\"experience-h2\\">\\n\\t\\t\\t\\t\\t<strong class=\\"experience-strong\\">Non-military Education:</strong>\\n\\t\\t\\t\\t</h2>\\n\\t\\t\\t\\t<ul class=\\"experience-ul\\">\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">Bachelor's degree in Business Administration (2015)</li>\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">COMPTIA Security+ (2015)</li>\\n\\t\\t\\t\\t\\t<li class=\\"experience-li\\">\\n\\t\\t\\t\\t\\t\\tSigma Beta Delta National Honor Society for Business (2019).\\n\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t</ul>\\n\\t\\t\\t</div>\\n\\t\\t</span>\\n\\t</ExperienceStyles>\\n</div>\\n\\n<style>\\n\\t.general-image {\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\tbackground: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7));\\n\\t\\tbackground: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7));\\n\\t\\tbackground-size: cover;\\n\\t}\\n\\t.general-image > h2 {\\n\\t\\tfont-family: 'Gochi Hand', cursive;\\n\\t\\tfont-size: 4em;\\n\\t\\ttext-align: center;\\n\\t\\tcolor: var(--experience-text);\\n\\t}\\n\\n\\t@media only screen and (max-width: 1500px) {\\n\\t\\t.general-image {\\n\\t\\t\\theight: 30vmax;\\n\\t\\t\\twidth: 90vmax;\\n\\t\\t}\\n\\t}\\n\\n\\t@media only screen and (max-width: 850px) {\\n\\t\\t.general-image {\\n\\t\\t\\theight: 25vmax;\\n\\t\\t\\twidth: 50vmax;\\n\\t\\t}\\n\\t\\t.general-image > h2 {\\n\\t\\t\\tfont-size: 2em;\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAgFC,cAAc,4BAAC,CAAC,AACf,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,gBAAgB,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAC7E,UAAU,CAAE,gBAAgB,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAC7E,eAAe,CAAE,KAAK,AACvB,CAAC,AACD,4BAAc,CAAG,EAAE,cAAC,CAAC,AACpB,WAAW,CAAE,YAAY,CAAC,CAAC,OAAO,CAClC,SAAS,CAAE,GAAG,CACd,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,IAAI,iBAAiB,CAAC,AAC9B,CAAC,AAED,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC3C,cAAc,4BAAC,CAAC,AACf,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,AACd,CAAC,AACF,CAAC,AAED,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1C,cAAc,4BAAC,CAAC,AACf,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,AACd,CAAC,AACD,4BAAc,CAAG,EAAE,cAAC,CAAC,AACpB,SAAS,CAAE,GAAG,AACf,CAAC,AACF,CAAC"}`
};
var EducationCertifications = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$7);
  return `<div id="${"education"}">${validate_component(SubPageTitleBar, "SubPageTitleBar").$$render($$result, {
    title: "Education",
    colorVar: "white",
    textColor: "rgb(238, 174, 37)"
  }, {}, {})}
	${validate_component(ExperienceStyles, "ExperienceStyles").$$render($$result, {}, {}, {
    content: () => `<span slot="${"content"}"><div><h2 class="${"experience-h2"}"><strong class="${"experience-strong"}">Professional Certifications/Education:</strong></h2>
				<p class="${"experience-p"}">I hold civilian and Department of Defense certifications in Cyber, Personnel and Physical
					Security along with a Bachelor&#39;s degree in Business Administration from Excelsior College.
					I am currently four classes from completing an MBA with an emphasis in
					Technology/Innovation Management.
				</p>
				<h2 class="${"experience-h2"}"><strong class="${"experience-strong"}">Security Professional Education and Development (SPeD) certifications:</strong></h2>
				<ul class="${"experience-ul"}"><li class="${"experience-li"}"><a class="${"experience-a"}" title="${"Center for Security Excellence SFPC certification webpage."}" href="${"https://www.cdse.edu/certification/sfpc.html"}">Security Professional Fundamentals (SFPC) 3+ years</a></li>
					<li class="${"experience-li"}"><a class="${"experience-a"}" title="${"Center for Security Excellence PSC certification webpage."}" href="${"https://www.cdse.edu/certification/psc.html"}">Physical Security Certification (PSC) 3+ years</a></li></ul>
				<h2 class="${"experience-h2"}"><strong class="${"experience-strong"}">Additional Military Training:</strong></h2>
				<ul class="${"experience-ul"}"><li class="${"experience-li"}">Navy Communications Security Management System <a class="${"experience-a"}" title="${"Navy COMSEC Management System webpage."}" href="${"https://www.navifor.usff.navy.mil/ncms/"}">(NCMS)</a> certified inspector 10+ years
					</li>
					<li class="${"experience-li"}">Information Systems Security Manager 7+ years</li>
					<li class="${"experience-li"}">Operational Security Officer 5+ years</li>
					<li class="${"experience-li"}">Emergency Management Officer 5+ years</li>
					<li class="${"experience-li"}">Classified Material Control Officer 10+ years</li>
					<li class="${"experience-li"}">Command Equal Opportunity Officer 2+ years</li></ul>
				<h2 class="${"experience-h2"}"><strong class="${"experience-strong"}">Non-military Education:</strong></h2>
				<ul class="${"experience-ul"}"><li class="${"experience-li"}">Bachelor&#39;s degree in Business Administration (2015)</li>
					<li class="${"experience-li"}">COMPTIA Security+ (2015)</li>
					<li class="${"experience-li"}">Sigma Beta Delta National Honor Society for Business (2019).
					</li></ul></div></span>`,
    image: () => `<span slot="${"image"}"><div class="${"general-image image svelte-bflkz7"}"><h2 class="${"svelte-bflkz7"}">Knowledge is Power!</h2></div></span>`
  })}
</div>`;
});
var EducationCertifications$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": EducationCertifications
});
var css$6 = {
  code: ".general-image.svelte-s8zx7d{background:linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\n			url('/pexels-pixabay-60504.jpg') no-repeat;background:linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\n			url('/pexels-pixabay-60504.jpg') no-repeat;background-size:cover}",
  map: `{"version":3,"file":"NetworkSecurity.svelte","sources":["NetworkSecurity.svelte"],"sourcesContent":["<script>\\n\\timport SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';\\n\\timport ExperienceStyles from './ExperienceStyles.svelte';\\n<\/script>\\n\\n<div id=\\"network-security\\">\\n\\t<SubPageTitleBar title={'Cyber Security'} colorVar={'white'} textColor={'rgb(238, 174, 37)'} />\\n\\t<ExperienceStyles>\\n\\t\\t<span slot=\\"image\\">\\n\\t\\t\\t<div class=\\"general-image image\\" />\\n\\t\\t</span>\\n\\t\\t<span slot=\\"content\\">\\n\\t\\t\\t<h2 class=\\"experience-h2\\">\\n\\t\\t\\t\\t<strong class=\\"experience-strong\\">More than ten years of Cyber Security Experience:</strong>\\n\\t\\t\\t</h2>\\n\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\tMy history with Networks and cyber security administration actually starts more than 20\\n\\t\\t\\t\\tyears ago, with my first role as the admin of a classified network system on my first\\n\\t\\t\\t\\tsubmarine. However, technology and policy have so greatly evolved that those years of simple\\n\\t\\t\\t\\thardware repair, basic user training, and minimal configuration management are\\n\\t\\t\\t\\tunrecognizable against modern requirements.\\n\\t\\t\\t</p>\\n\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\tIn the last twenty years, we have seen an explosion of requirements, increased complexity in\\n\\t\\t\\t\\tthreats, and an ever growing dependency on cyber-systems. My last ten years have been spent\\n\\t\\t\\t\\tobserving emerging threats while developing policies and analytics adopted across the\\n\\t\\t\\t\\tsubmarine force by which to measure cyber resilience. As an inspector and mentor of\\n\\t\\t\\t\\tshipboard network security teams, I work to evaluate risk and prioritize elements of Navy\\n\\t\\t\\t\\tpolicy to achieve the most robust network posture possible.\\n\\t\\t\\t</p>\\n\\t\\t</span>\\n\\t</ExperienceStyles>\\n</div>\\n\\n<style>\\n\\t.general-image {\\n\\t\\tbackground: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\\n\\t\\t\\turl('/pexels-pixabay-60504.jpg') no-repeat;\\n\\t\\tbackground: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\\n\\t\\t\\turl('/pexels-pixabay-60504.jpg') no-repeat;\\n\\t\\tbackground-size: cover;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAmCC,cAAc,cAAC,CAAC,AACf,UAAU,CAAE,gBAAgB,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;GAC7E,IAAI,2BAA2B,CAAC,CAAC,SAAS,CAC3C,UAAU,CAAE,gBAAgB,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;GAC7E,IAAI,2BAA2B,CAAC,CAAC,SAAS,CAC3C,eAAe,CAAE,KAAK,AACvB,CAAC"}`
};
var NetworkSecurity = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$6);
  return `<div id="${"network-security"}">${validate_component(SubPageTitleBar, "SubPageTitleBar").$$render($$result, {
    title: "Cyber Security",
    colorVar: "white",
    textColor: "rgb(238, 174, 37)"
  }, {}, {})}
	${validate_component(ExperienceStyles, "ExperienceStyles").$$render($$result, {}, {}, {
    content: () => `<span slot="${"content"}"><h2 class="${"experience-h2"}"><strong class="${"experience-strong"}">More than ten years of Cyber Security Experience:</strong></h2>
			<p class="${"experience-p"}">My history with Networks and cyber security administration actually starts more than 20
				years ago, with my first role as the admin of a classified network system on my first
				submarine. However, technology and policy have so greatly evolved that those years of simple
				hardware repair, basic user training, and minimal configuration management are
				unrecognizable against modern requirements.
			</p>
			<p class="${"experience-p"}">In the last twenty years, we have seen an explosion of requirements, increased complexity in
				threats, and an ever growing dependency on cyber-systems. My last ten years have been spent
				observing emerging threats while developing policies and analytics adopted across the
				submarine force by which to measure cyber resilience. As an inspector and mentor of
				shipboard network security teams, I work to evaluate risk and prioritize elements of Navy
				policy to achieve the most robust network posture possible.
			</p></span>`,
    image: () => `<span slot="${"image"}"><div class="${"general-image image svelte-s8zx7d"}"></div></span>`
  })}
</div>`;
});
var NetworkSecurity$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": NetworkSecurity
});
var css$5 = {
  code: ".general-image.svelte-r1uuql{background:linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\n			url('/pexels-pixabay-270373.jpg') no-repeat;background:linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\n			url('/pexels-pixabay-270373.jpg') no-repeat;background-size:cover}",
  map: `{"version":3,"file":"WebDevelopment.svelte","sources":["WebDevelopment.svelte"],"sourcesContent":["<script>\\n\\timport SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';\\n\\timport ExperienceStyles from './ExperienceStyles.svelte';\\n<\/script>\\n\\n<div id=\\"web-development\\">\\n\\t<SubPageTitleBar title={'Web Development'} colorVar={'white'} textColor={'rgb(238, 174, 37)'} />\\n\\t<ExperienceStyles>\\n\\t\\t<span slot=\\"image\\">\\n\\t\\t\\t<div class=\\"general-image image\\" />\\n\\t\\t</span>\\n\\t\\t<span slot=\\"content\\">\\n\\t\\t\\t<h2 class=\\"experience-h2\\">\\n\\t\\t\\t\\t<strong class=\\"experience-strong\\"\\n\\t\\t\\t\\t\\t>More than five years of Microsoft SharePoint administration:</strong\\n\\t\\t\\t\\t>\\n\\t\\t\\t</h2>\\n\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\tFar from a SharePoint expert, I have been a quick study and efficiently managed multiple\\n\\t\\t\\t\\tsites across three commands. After COVID-19 inhibited traditional office work for an\\n\\t\\t\\t\\textended period, I took a break from my MBA and quickly taught myself HTML, CSS, JavaScript\\n\\t\\t\\t\\tand ReactJS to develop custom web solutions to support increased work from home\\n\\t\\t\\t\\trequirements. I have developed proficiency with the SP REST API. Recently, I have been\\n\\t\\t\\t\\tseeking a mentor that would assist me with improving my SharePoint and development skills.\\n\\t\\t\\t\\tIf you stumbled across this site and happen to be interested in mentoring, please contact\\n\\t\\t\\t\\tme. This site has been developed using Svelte, which I have found to be the most efficient\\n\\t\\t\\t\\tframework I have used thus far.\\n\\t\\t\\t</p>\\n\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\tMy enthusiasm for development has continued to grow. I have built apps for tracking\\n\\t\\t\\t\\tpersonnel security clearance data, command onboarding programs, a small submarine\\n\\t\\t\\t\\tcommunication simulator, and some other personal projects, which I can share from my <a\\n\\t\\t\\t\\t\\tclass=\\"experience-a\\"\\n\\t\\t\\t\\t\\thref=\\"https://github.com/navsubrm\\">GitHub</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\tif you are interested. I keep most of my work private due to its purpose, but if you ask and\\n\\t\\t\\t\\tI can verify you, I would be happy to let you view the code.\\n\\t\\t\\t</p>\\n\\t\\t</span>\\n\\t</ExperienceStyles>\\n</div>\\n\\n<style>\\n\\t.general-image {\\n\\t\\tbackground: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\\n\\t\\t\\turl('/pexels-pixabay-270373.jpg') no-repeat;\\n\\t\\tbackground: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\\n\\t\\t\\turl('/pexels-pixabay-270373.jpg') no-repeat;\\n\\t\\tbackground-size: cover;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA2CC,cAAc,cAAC,CAAC,AACf,UAAU,CAAE,gBAAgB,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;GAC7E,IAAI,4BAA4B,CAAC,CAAC,SAAS,CAC5C,UAAU,CAAE,gBAAgB,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;GAC7E,IAAI,4BAA4B,CAAC,CAAC,SAAS,CAC5C,eAAe,CAAE,KAAK,AACvB,CAAC"}`
};
var WebDevelopment = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$5);
  return `<div id="${"web-development"}">${validate_component(SubPageTitleBar, "SubPageTitleBar").$$render($$result, {
    title: "Web Development",
    colorVar: "white",
    textColor: "rgb(238, 174, 37)"
  }, {}, {})}
	${validate_component(ExperienceStyles, "ExperienceStyles").$$render($$result, {}, {}, {
    content: () => `<span slot="${"content"}"><h2 class="${"experience-h2"}"><strong class="${"experience-strong"}">More than five years of Microsoft SharePoint administration:</strong></h2>
			<p class="${"experience-p"}">Far from a SharePoint expert, I have been a quick study and efficiently managed multiple
				sites across three commands. After COVID-19 inhibited traditional office work for an
				extended period, I took a break from my MBA and quickly taught myself HTML, CSS, JavaScript
				and ReactJS to develop custom web solutions to support increased work from home
				requirements. I have developed proficiency with the SP REST API. Recently, I have been
				seeking a mentor that would assist me with improving my SharePoint and development skills.
				If you stumbled across this site and happen to be interested in mentoring, please contact
				me. This site has been developed using Svelte, which I have found to be the most efficient
				framework I have used thus far.
			</p>
			<p class="${"experience-p"}">My enthusiasm for development has continued to grow. I have built apps for tracking
				personnel security clearance data, command onboarding programs, a small submarine
				communication simulator, and some other personal projects, which I can share from my <a class="${"experience-a"}" href="${"https://github.com/navsubrm"}">GitHub</a>
				if you are interested. I keep most of my work private due to its purpose, but if you ask and
				I can verify you, I would be happy to let you view the code.
			</p></span>`,
    image: () => `<span slot="${"image"}"><div class="${"general-image image svelte-r1uuql"}"></div></span>`
  })}
</div>`;
});
var WebDevelopment$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": WebDevelopment
});
var css$4 = {
  code: ".general-image.svelte-kl4qf4{height:45vmax;width:35vmax;background:linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\n			url('/Loose_lips_might_sink_ships.jpeg') no-repeat;background:linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\n			url('/Loose_lips_might_sink_ships.jpeg') no-repeat;background-size:cover;background-position:center;margin:20px;border-radius:0.9em;box-shadow:inset 0 0 40px var(--shadow-color), 5px 10px 25px var(--experience-text)}@media only screen and (max-width: 1500px){.general-image.svelte-kl4qf4{height:50vmax;width:35vmax}}@media only screen and (max-width: 850px){.general-image.svelte-kl4qf4{height:25vmax;width:50vmax;transform:translateY(0)}}",
  map: `{"version":3,"file":"SecurityManagement.svelte","sources":["SecurityManagement.svelte"],"sourcesContent":["<script>\\n\\timport SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';\\n\\timport ExperienceStyles from './ExperienceStyles.svelte';\\n<\/script>\\n\\n<div id=\\"security-management\\">\\n\\t<SubPageTitleBar\\n\\t\\ttitle={'Security Management'}\\n\\t\\tcolorVar={'white'}\\n\\t\\ttextColor={'rgb(238, 174, 37)'}\\n\\t/>\\n\\t<ExperienceStyles>\\n\\t\\t<span slot=\\"image\\">\\n\\t\\t\\t<div class=\\"general-image image\\" />\\n\\t\\t</span>\\n\\t\\t<span slot=\\"content\\">\\n\\t\\t\\t<h2 class=\\"experience-h2\\">\\n\\t\\t\\t\\t<strong class=\\"experience-strong\\"\\n\\t\\t\\t\\t\\t>More than 20 years of Physical and Personnel Security Experience:</strong\\n\\t\\t\\t\\t>\\n\\t\\t\\t</h2>\\n\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\tPhysical, personnel, and information security management has been a focus of my entire\\n\\t\\t\\t\\tmilitary serivce. Most of my career has involved acting as an assistant or command security\\n\\t\\t\\t\\tmanager in some form. The last ten years, I have been the head security officer in each\\n\\t\\t\\t\\tassignment. During this time, I have managed tens of thousands of requests for access to\\n\\t\\t\\t\\tclassified materiels and facilities, managed background investigations, oversaw inquires to\\n\\t\\t\\t\\tsecurity violations and incidents, certified secure facilities, and developed security\\n\\t\\t\\t\\tpolicy.\\n\\t\\t\\t</p>\\n\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\tI have managed small and large projects reducing cost, waste, and improving classified\\n\\t\\t\\t\\tmateriel management. From producing clean alternative energy by transitioning destruction\\n\\t\\t\\t\\tprocesses to waste-to-energy conversion facilities to larger facility modificaitons, I am\\n\\t\\t\\t\\tpassionate about finding innovative security solutions.\\n\\t\\t\\t</p>\\n\\t\\t\\t<p class=\\"experience-p\\">\\n\\t\\t\\t\\tIn 2018, I completed the Department of Defense Security Professional Education Development\\n\\t\\t\\t\\t(SPeD) ceritifications for Security Fundamentals Professional and Physical Security.\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"experience-a\\"\\n\\t\\t\\t\\t\\thref=\\"https://www.cdse.edu/Certification/About-SP\u0113D-Certification/\\"\\n\\t\\t\\t\\t\\ttitle=\\"SPeD about page\\">Click here for details on the SPeD program.</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</p>\\n\\t\\t</span>\\n\\t</ExperienceStyles>\\n</div>\\n\\n<style>\\n\\t.general-image {\\n\\t\\theight: 45vmax;\\n\\t\\twidth: 35vmax;\\n\\t\\tbackground: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\\n\\t\\t\\turl('/Loose_lips_might_sink_ships.jpeg') no-repeat;\\n\\t\\tbackground: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),\\n\\t\\t\\turl('/Loose_lips_might_sink_ships.jpeg') no-repeat;\\n\\t\\tbackground-size: cover;\\n\\t\\tbackground-position: center;\\n\\t\\tmargin: 20px;\\n\\t\\tborder-radius: 0.9em;\\n\\t\\tbox-shadow: inset 0 0 40px var(--shadow-color), 5px 10px 25px var(--experience-text);\\n\\t}\\n\\n\\t@media only screen and (max-width: 1500px) {\\n\\t\\t.general-image {\\n\\t\\t\\theight: 50vmax;\\n\\t\\t\\twidth: 35vmax;\\n\\t\\t}\\n\\t}\\n\\n\\t@media only screen and (max-width: 850px) {\\n\\t\\t.general-image {\\n\\t\\t\\theight: 25vmax;\\n\\t\\t\\twidth: 50vmax;\\n\\t\\t\\ttransform: translateY(0);\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAkDC,cAAc,cAAC,CAAC,AACf,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,CACb,UAAU,CAAE,gBAAgB,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;GAC7E,IAAI,mCAAmC,CAAC,CAAC,SAAS,CACnD,UAAU,CAAE,gBAAgB,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;GAC7E,IAAI,mCAAmC,CAAC,CAAC,SAAS,CACnD,eAAe,CAAE,KAAK,CACtB,mBAAmB,CAAE,MAAM,CAC3B,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,KAAK,CACpB,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,cAAc,CAAC,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,IAAI,iBAAiB,CAAC,AACrF,CAAC,AAED,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC3C,cAAc,cAAC,CAAC,AACf,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,AACd,CAAC,AACF,CAAC,AAED,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1C,cAAc,cAAC,CAAC,AACf,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,CACb,SAAS,CAAE,WAAW,CAAC,CAAC,AACzB,CAAC,AACF,CAAC"}`
};
var SecurityManagement = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$4);
  return `<div id="${"security-management"}">${validate_component(SubPageTitleBar, "SubPageTitleBar").$$render($$result, {
    title: "Security Management",
    colorVar: "white",
    textColor: "rgb(238, 174, 37)"
  }, {}, {})}
	${validate_component(ExperienceStyles, "ExperienceStyles").$$render($$result, {}, {}, {
    content: () => `<span slot="${"content"}"><h2 class="${"experience-h2"}"><strong class="${"experience-strong"}">More than 20 years of Physical and Personnel Security Experience:</strong></h2>
			<p class="${"experience-p"}">Physical, personnel, and information security management has been a focus of my entire
				military serivce. Most of my career has involved acting as an assistant or command security
				manager in some form. The last ten years, I have been the head security officer in each
				assignment. During this time, I have managed tens of thousands of requests for access to
				classified materiels and facilities, managed background investigations, oversaw inquires to
				security violations and incidents, certified secure facilities, and developed security
				policy.
			</p>
			<p class="${"experience-p"}">I have managed small and large projects reducing cost, waste, and improving classified
				materiel management. From producing clean alternative energy by transitioning destruction
				processes to waste-to-energy conversion facilities to larger facility modificaitons, I am
				passionate about finding innovative security solutions.
			</p>
			<p class="${"experience-p"}">In 2018, I completed the Department of Defense Security Professional Education Development
				(SPeD) ceritifications for Security Fundamentals Professional and Physical Security.
				<a class="${"experience-a"}" href="${"https://www.cdse.edu/Certification/About-SP\u0113D-Certification/"}" title="${"SPeD about page"}">Click here for details on the SPeD program.</a></p></span>`,
    image: () => `<span slot="${"image"}"><div class="${"general-image image svelte-kl4qf4"}"></div></span>`
  })}
</div>`;
});
var SecurityManagement$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": SecurityManagement
});
var Experience = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `${$$result.title = `<title>Nathan Meeker || Experience</title>`, ""}`, ""}

<div>${validate_component(GeneralContent, "GeneralContent").$$render($$result, {}, {}, {})}
	${validate_component(NetworkSecurity, "NetworkSecurity").$$render($$result, {}, {}, {})}
	${validate_component(WebDevelopment, "WebDevelopment").$$render($$result, {}, {}, {})}
	${validate_component(SecurityManagement, "SecurityManagement").$$render($$result, {}, {}, {})}
	${validate_component(EducationCertifications, "EducationCertifications").$$render($$result, {}, {}, {})}
</div>`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Experience
});
var css$3 = {
  code: "form.svelte-1wo2eds{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;text-transform:uppercase;width:100%;margin:auto}input.svelte-1wo2eds,textarea.svelte-1wo2eds{padding:20px;margin:5px;font-size:1.5em;border:none;border-radius:0.2em;cursor:pointer}label.svelte-1wo2eds{font-size:1.5em;color:white}.contact.svelte-1wo2eds{display:flex;justify-content:center;align-items:center;margin:20vh auto;height:90vh;width:100%}.card-inner.svelte-1wo2eds{position:relative;padding:80px;width:30%;background:center\n			linear-gradient(to bottom right, var(--shadow-color) 65%, var(--light-blue) 90%);border-radius:1em;box-shadow:inset 0 0 20px var(--shadow-color), 0 0 80px var(--shadow-color)}.alert-warn{-webkit-animation:svelte-1wo2eds-alertEnter 1s linear forwards;animation:svelte-1wo2eds-alertEnter 1s linear forwards;display:inline-block;background-color:rgba(242, 242, 24, 0.8)}.alert-success{position:absolute;display:-webkit-box;display:-ms-flexbox;display:flex;-ms-flex-item-align:center;align-self:center;top:25%;padding:50px;-webkit-animation:svelte-1wo2eds-msgAlertEnter 7s linear forwards;animation:svelte-1wo2eds-msgAlertEnter 7s linear forwards;background-color:rgba(49, 212, 17, 0.8)}.alert-fail{position:absolute;display:-webkit-box;display:-ms-flexbox;display:flex;-ms-flex-item-align:center;align-self:center;top:25%;padding:50px;-webkit-animation:svelte-1wo2eds-msgAlertEnter 7s linear forwards;animation:svelte-1wo2eds-msgAlertEnter 7s linear forwards;background-color:rgba(237, 24, 24, 0.8)}.alert.svelte-1wo2eds{font-size:1.2vmax;padding:5px;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content;border-radius:0.2em}@-webkit-keyframes svelte-1wo2eds-alertEnter{0%{background-color:none;opacity:0}50%{opacity:0.3}100%{opacity:1;background-color:rgba(242, 242, 24, 0.8)}}@keyframes svelte-1wo2eds-alertEnter{0%{background-color:none;opacity:0}50%{opacity:0.3}100%{opacity:1;background-color:rgba(242, 242, 24, 0.8)}}@-webkit-keyframes svelte-1wo2eds-msgAlertEnter{0%{opacity:0}15%{opacity:1}85%{opacity:1}100%{opacity:0}}@keyframes svelte-1wo2eds-msgAlertEnter{0%{opacity:0}15%{opacity:1}85%{opacity:1}100%{opacity:0}}@media only screen and (max-width: 1400px){.card-inner.svelte-1wo2eds{width:40%;padding:20px}}@media only screen and (max-width: 800px){.card-inner.svelte-1wo2eds{width:75%;padding:25px}}@media only screen and (max-width: 650px){.card-inner.svelte-1wo2eds{width:90%;padding:15px}}",
  map: `{"version":3,"file":"contact.svelte","sources":["contact.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { fly, fade } from 'svelte/transition';\\nimport emailValidator from 'email-validator';\\nimport dompurify from 'dompurify';\\nimport emailjsCom from 'emailjs-com';\\nimport SubPageTitleBar from '../components/SubPageTitleBar.svelte';\\n//Handle contact form:\\nemailjsCom.init('user_RoDNRpp8DGk61m380dPFq');\\n//DOM elements for contact form:\\nlet fName;\\nlet lName;\\nlet email;\\nlet message;\\n//Error Elements:\\nlet emailFormat;\\nlet messageSuccess;\\nlet messageFail;\\n//Form variables:\\nlet alertTimer;\\n// Check email address to confirm it is a real address\\nconst validateEmail = () => {\\n    if (email === null || email === '')\\n        return;\\n    if (!emailValidator.validate(email))\\n        return emailFormat.classList.add('alert-warn');\\n    emailFormat.classList.remove('alert-warn');\\n};\\n//Check if field is blank and add alert.\\nconst validateBlankField = (e) => {\\n    const actionItem = document.querySelector(\`#\${e.target.getAttribute('id')}\`);\\n    if (e.target.value === null || e.target.value === '' || !e.target.value) {\\n        actionItem.classList.add('alert-warn');\\n        actionItem.placeholder = 'Field required to submit';\\n    }\\n};\\n//Reset field on focus\\nconst clearInvalidation = (e, placeholder) => {\\n    const actionItem = document.querySelector(\`#\${e.target.getAttribute('id')}\`);\\n    actionItem.classList.remove('alert-warn');\\n    actionItem.placeholder = placeholder;\\n};\\n//Allows for typing before the email error alert will show.\\nconst keyEventValidator = (callback) => {\\n    clearTimeout(alertTimer);\\n    alertTimer = setTimeout(() => callback(), 1500);\\n};\\n//Verify that only allowable text is entered into fields.\\nconst inputValidator = (input) => {\\n    let sanitizedInput = dompurify.sanitize(input);\\n    if (sanitizedInput.includes('Field required to submit') || sanitizedInput === '')\\n        return true;\\n};\\nconst validateMessageContents = () => {\\n    let invalidContents = 0;\\n    if (inputValidator(fName))\\n        invalidContents++;\\n    if (inputValidator(lName))\\n        invalidContents++;\\n    if (!emailValidator.validate(email))\\n        invalidContents++;\\n    if (inputValidator(message))\\n        invalidContents++;\\n    if (invalidContents === 0)\\n        return true;\\n};\\nconst messageSubmit = (e) => {\\n    e.preventDefault();\\n    if (validateMessageContents()) {\\n        emailjsCom\\n            .send('service_0wgxmn4', 'template_u9mwv2n', {\\n            from_name: \`\${fName} \${lName}\`,\\n            from_email: \`\${email}\`,\\n            message: dompurify.sanitize(message)\\n        })\\n            .then(function (response) {\\n            //add alert class for success or failure\\n            messageSuccess.classList.add('alert-success');\\n            setTimeout(() => messageSuccess.classList.remove('alert-success'), 7000);\\n        }, function (err) {\\n            messageFail.classList.add('alert-fail');\\n            setTimeout(() => messageFail.classList.remove('alert-fail'), 7000);\\n        });\\n    }\\n    else {\\n        messageFail.classList.add('alert-fail');\\n        setTimeout(() => messageFail.classList.remove('alert-fail'), 7000);\\n    }\\n};\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>Nathan Meeker || Contact</title>\\n</svelte:head>\\n\\n<div in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>\\n\\t<SubPageTitleBar title={'Contact me'} colorVar={'white'} textColor={'var(--light-blue)'} />\\n\\t<div class=\\"contact\\">\\n\\t\\t<div id=\\"contact-card\\" class=\\"card-inner\\">\\n\\t\\t\\t<form action=\\"#\\" id=\\"contact-form\\" class=\\"form\\" on:submit={messageSubmit}>\\n\\t\\t\\t\\t<label for=\\"first-name\\">first name: </label>\\n\\t\\t\\t\\t<input\\n\\t\\t\\t\\t\\tid=\\"first-name\\"\\n\\t\\t\\t\\t\\ttype=\\"text\\"\\n\\t\\t\\t\\t\\tsize=\\"50\\"\\n\\t\\t\\t\\t\\tplaceholder=\\"First Name\\"\\n\\t\\t\\t\\t\\tbind:value={fName}\\n\\t\\t\\t\\t\\ton:focus={(e) => clearInvalidation(e, 'First Name')}\\n\\t\\t\\t\\t\\ton:click={(e) => clearInvalidation(e, 'First Name')}\\n\\t\\t\\t\\t\\ton:blur={(e) => validateBlankField(e)}\\n\\t\\t\\t\\t/>\\n\\t\\t\\t\\t<label for=\\"last-name\\">last name: </label>\\n\\t\\t\\t\\t<input\\n\\t\\t\\t\\t\\tid=\\"last-name\\"\\n\\t\\t\\t\\t\\ttype=\\"text\\"\\n\\t\\t\\t\\t\\tsize=\\"50\\"\\n\\t\\t\\t\\t\\tplaceholder=\\"Last Name\\"\\n\\t\\t\\t\\t\\tbind:value={lName}\\n\\t\\t\\t\\t\\ton:focus={(e) => clearInvalidation(e, 'Last Name')}\\n\\t\\t\\t\\t\\ton:click={(e) => clearInvalidation(e, 'Last Name')}\\n\\t\\t\\t\\t\\ton:blur={(e) => validateBlankField(e)}\\n\\t\\t\\t\\t/>\\n\\t\\t\\t\\t<label for=\\"email\\"\\n\\t\\t\\t\\t\\t>email:\\n\\t\\t\\t\\t\\t<span bind:this={emailFormat} class=\\"alert hidden\\"\\n\\t\\t\\t\\t\\t\\t>entry is not a valid email address.</span\\n\\t\\t\\t\\t\\t></label\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t<input\\n\\t\\t\\t\\t\\tid=\\"email\\"\\n\\t\\t\\t\\t\\ttype=\\"text\\"\\n\\t\\t\\t\\t\\tsize=\\"50\\"\\n\\t\\t\\t\\t\\tplaceholder=\\"Email\\"\\n\\t\\t\\t\\t\\tbind:value={email}\\n\\t\\t\\t\\t\\ton:focus={(e) => clearInvalidation(e, 'Email')}\\n\\t\\t\\t\\t\\ton:click={(e) => clearInvalidation(e, 'Email')}\\n\\t\\t\\t\\t\\ton:blur={(e) => validateBlankField(e)}\\n\\t\\t\\t\\t\\ton:keyup={() => keyEventValidator(validateEmail)}\\n\\t\\t\\t\\t/>\\n\\t\\t\\t\\t<label for=\\"message\\">message: </label>\\n\\t\\t\\t\\t<textarea\\n\\t\\t\\t\\t\\tid=\\"message\\"\\n\\t\\t\\t\\t\\tcols=\\"50\\"\\n\\t\\t\\t\\t\\trows=\\"5\\"\\n\\t\\t\\t\\t\\tplaceholder=\\"Enter message here.\\"\\n\\t\\t\\t\\t\\tbind:value={message}\\n\\t\\t\\t\\t\\ton:focus={(e) => clearInvalidation(e, 'Enter message here.')}\\n\\t\\t\\t\\t\\ton:click={(e) => clearInvalidation(e, 'Enter message here.')}\\n\\t\\t\\t\\t\\ton:blur={(e) => validateBlankField(e)}\\n\\t\\t\\t\\t/>\\n\\t\\t\\t\\t<span id=\\"message-success\\" class=\\"alert hidden\\" bind:this={messageSuccess}\\n\\t\\t\\t\\t\\t>Thank you for reaching out to me! I will get back to you shortly.</span\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t<span id=\\"message-fail\\" class=\\"alert hidden\\" bind:this={messageFail}\\n\\t\\t\\t\\t\\t>Your message failed to send. Check the information and try again.</span\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t<button class=\\"btn btn-main btn-contact\\" type=\\"submit\\" value=\\"submit\\">send message</button>\\n\\t\\t\\t</form>\\n\\t\\t</div>\\n\\t</div>\\n</div>\\n\\n<style>\\n\\tform {\\n\\t\\tdisplay: -webkit-box;\\n\\t\\tdisplay: -ms-flexbox;\\n\\t\\tdisplay: flex;\\n\\t\\t-webkit-box-orient: vertical;\\n\\t\\t-webkit-box-direction: normal;\\n\\t\\t-ms-flex-direction: column;\\n\\t\\tflex-direction: column;\\n\\t\\ttext-transform: uppercase;\\n\\t\\twidth: 100%;\\n\\t\\tmargin: auto;\\n\\t}\\n\\n\\tinput,\\n\\ttextarea {\\n\\t\\tpadding: 20px;\\n\\t\\tmargin: 5px;\\n\\t\\tfont-size: 1.5em;\\n\\t\\tborder: none;\\n\\t\\tborder-radius: 0.2em;\\n\\t\\tcursor: pointer;\\n\\t}\\n\\n\\tlabel {\\n\\t\\tfont-size: 1.5em;\\n\\t\\tcolor: white;\\n\\t}\\n\\n\\t.contact {\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\tmargin: 20vh auto;\\n\\t\\theight: 90vh;\\n\\t\\twidth: 100%;\\n\\t}\\n\\n\\t.card-inner {\\n\\t\\tposition: relative;\\n\\t\\tpadding: 80px;\\n\\t\\twidth: 30%;\\n\\t\\tbackground: center\\n\\t\\t\\tlinear-gradient(to bottom right, var(--shadow-color) 65%, var(--light-blue) 90%);\\n\\t\\tborder-radius: 1em;\\n\\t\\tbox-shadow: inset 0 0 20px var(--shadow-color), 0 0 80px var(--shadow-color);\\n\\t}\\n\\n\\t:global(.alert-warn) {\\n\\t\\t-webkit-animation: alertEnter 1s linear forwards;\\n\\t\\tanimation: alertEnter 1s linear forwards;\\n\\t\\tdisplay: inline-block;\\n\\t\\tbackground-color: rgba(242, 242, 24, 0.8);\\n\\t}\\n\\n\\t:global(.alert-success) {\\n\\t\\tposition: absolute;\\n\\t\\tdisplay: -webkit-box;\\n\\t\\tdisplay: -ms-flexbox;\\n\\t\\tdisplay: flex;\\n\\t\\t-ms-flex-item-align: center;\\n\\t\\talign-self: center;\\n\\t\\ttop: 25%;\\n\\t\\tpadding: 50px;\\n\\t\\t-webkit-animation: msgAlertEnter 7s linear forwards;\\n\\t\\tanimation: msgAlertEnter 7s linear forwards;\\n\\t\\tbackground-color: rgba(49, 212, 17, 0.8);\\n\\t}\\n\\n\\t:global(.alert-fail) {\\n\\t\\tposition: absolute;\\n\\t\\tdisplay: -webkit-box;\\n\\t\\tdisplay: -ms-flexbox;\\n\\t\\tdisplay: flex;\\n\\t\\t-ms-flex-item-align: center;\\n\\t\\talign-self: center;\\n\\t\\ttop: 25%;\\n\\t\\tpadding: 50px;\\n\\t\\t-webkit-animation: msgAlertEnter 7s linear forwards;\\n\\t\\tanimation: msgAlertEnter 7s linear forwards;\\n\\t\\tbackground-color: rgba(237, 24, 24, 0.8);\\n\\t}\\n\\n\\t.alert {\\n\\t\\tfont-size: 1.2vmax;\\n\\t\\tpadding: 5px;\\n\\t\\twidth: -webkit-fit-content;\\n\\t\\twidth: -moz-fit-content;\\n\\t\\twidth: fit-content;\\n\\t\\tborder-radius: 0.2em;\\n\\t}\\n\\n\\t@-webkit-keyframes alertEnter {\\n\\t\\t0% {\\n\\t\\t\\tbackground-color: none;\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t\\t50% {\\n\\t\\t\\topacity: 0.3;\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\topacity: 1;\\n\\t\\t\\tbackground-color: rgba(242, 242, 24, 0.8);\\n\\t\\t}\\n\\t}\\n\\n\\t@keyframes alertEnter {\\n\\t\\t0% {\\n\\t\\t\\tbackground-color: none;\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t\\t50% {\\n\\t\\t\\topacity: 0.3;\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\topacity: 1;\\n\\t\\t\\tbackground-color: rgba(242, 242, 24, 0.8);\\n\\t\\t}\\n\\t}\\n\\n\\t@-webkit-keyframes msgAlertEnter {\\n\\t\\t0% {\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t\\t15% {\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\t\\t85% {\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t}\\n\\n\\t@keyframes msgAlertEnter {\\n\\t\\t0% {\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t\\t15% {\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\t\\t85% {\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t}\\n\\n\\t@media only screen and (max-width: 1400px) {\\n\\t\\t.card-inner {\\n\\t\\t\\twidth: 40%;\\n\\t\\t\\tpadding: 20px;\\n\\t\\t}\\n\\t}\\n\\n\\t@media only screen and (max-width: 800px) {\\n\\t\\t.card-inner {\\n\\t\\t\\twidth: 75%;\\n\\t\\t\\tpadding: 25px;\\n\\t\\t}\\n\\t}\\n\\n\\t@media only screen and (max-width: 650px) {\\n\\t\\t.card-inner {\\n\\t\\t\\twidth: 90%;\\n\\t\\t\\tpadding: 15px;\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"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"}`
};
var Contact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  import_emailjs_com.default.init("user_RoDNRpp8DGk61m380dPFq");
  let fName;
  let lName;
  let email;
  let emailFormat;
  let messageSuccess;
  let messageFail;
  $$result.css.add(css$3);
  return `${$$result.head += `${$$result.title = `<title>Nathan Meeker || Contact</title>`, ""}`, ""}

<div>${validate_component(SubPageTitleBar, "SubPageTitleBar").$$render($$result, {
    title: "Contact me",
    colorVar: "white",
    textColor: "var(--light-blue)"
  }, {}, {})}
	<div class="${"contact svelte-1wo2eds"}"><div id="${"contact-card"}" class="${"card-inner svelte-1wo2eds"}"><form action="${"#"}" id="${"contact-form"}" class="${"form svelte-1wo2eds"}"><label for="${"first-name"}" class="${"svelte-1wo2eds"}">first name: </label>
				<input id="${"first-name"}" type="${"text"}" size="${"50"}" placeholder="${"First Name"}" class="${"svelte-1wo2eds"}"${add_attribute("value", fName, 0)}>
				<label for="${"last-name"}" class="${"svelte-1wo2eds"}">last name: </label>
				<input id="${"last-name"}" type="${"text"}" size="${"50"}" placeholder="${"Last Name"}" class="${"svelte-1wo2eds"}"${add_attribute("value", lName, 0)}>
				<label for="${"email"}" class="${"svelte-1wo2eds"}">email:
					<span class="${"alert hidden svelte-1wo2eds"}"${add_attribute("this", emailFormat, 0)}>entry is not a valid email address.</span></label>
				<input id="${"email"}" type="${"text"}" size="${"50"}" placeholder="${"Email"}" class="${"svelte-1wo2eds"}"${add_attribute("value", email, 0)}>
				<label for="${"message"}" class="${"svelte-1wo2eds"}">message: </label>
				<textarea id="${"message"}" cols="${"50"}" rows="${"5"}" placeholder="${"Enter message here."}" class="${"svelte-1wo2eds"}">${""}</textarea>
				<span id="${"message-success"}" class="${"alert hidden svelte-1wo2eds"}"${add_attribute("this", messageSuccess, 0)}>Thank you for reaching out to me! I will get back to you shortly.</span>
				<span id="${"message-fail"}" class="${"alert hidden svelte-1wo2eds"}"${add_attribute("this", messageFail, 0)}>Your message failed to send. Check the information and try again.</span>
				<button class="${"btn btn-main btn-contact"}" type="${"submit"}" value="${"submit"}">send message</button></form></div></div>
</div>`;
});
var contact = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Contact
});
var css$2 = {
  code: ".container.svelte-qh7quo{position:relative;display:grid;place-items:center;grid-template-areas:'text text image'\n			'. scroll-btn .';min-height:70vh;margin:20px auto 0px auto;padding:2em}.scroll-btn.svelte-qh7quo{grid-area:scroll-btn}.image{grid-area:image;height:25vmax;width:35vmax;margin:20px;border-radius:0.9em;box-shadow:inset 0 0 40px var(--shadow-color), 5px 10px 25px var(--about-text);background-position:center}.default-image.svelte-qh7quo{background:linear-gradient(rgba(49, 82, 80, 0.609), rgba(63, 238, 230, 0.7)), no-repeat;display:flex;justify-content:center;align-items:center}.content.svelte-qh7quo{grid-area:text;width:clamp(400px, 100%, 900px);font-size:1.5em;padding:10px}.about-p,.about-strong,.about-a,.about-li{margin:40px auto 40px auto;color:var(--about-text)}.about-h2{font-size:1.3em}.about-p,.about-strong{line-height:2em}@media only screen and (max-width: 1500px){.container.svelte-qh7quo{grid-template-areas:'image'\n				'text'\n				'scroll-btn';padding:5px}.image{height:50vmax;width:90vmax}.content.svelte-qh7quo{width:90%}}@media only screen and (max-width: 850px){.image{height:25vmax;width:50vmax}.image>p{font-size:2em}}",
  map: `{"version":3,"file":"AboutStyles.svelte","sources":["AboutStyles.svelte"],"sourcesContent":["<script>\\n\\tconst scrollTop = () => {\\n\\t\\twindow.scrollTo(0, 0);\\n\\t};\\n<\/script>\\n\\n<div class=\\"container\\">\\n\\t<slot name=\\"image\\">\\n\\t\\t<div class=\\"image default-image\\">No content</div>\\n\\t</slot>\\n\\n\\t<div class=\\"content\\">\\n\\t\\t<slot name=\\"content\\">\\n\\t\\t\\t<div class=\\"content\\">nothing to show</div>\\n\\t\\t</slot>\\n\\t</div>\\n\\t<button class=\\"btn btn-main btn-center scroll-btn\\" on:click={scrollTop}>Scroll Top</button>\\n</div>\\n\\n<style>\\n\\t.container {\\n\\t\\tposition: relative;\\n\\t\\tdisplay: grid;\\n\\t\\tplace-items: center;\\n\\t\\tgrid-template-areas:\\n\\t\\t\\t'text text image'\\n\\t\\t\\t'. scroll-btn .';\\n\\t\\tmin-height: 70vh;\\n\\t\\tmargin: 20px auto 0px auto;\\n\\t\\tpadding: 2em;\\n\\t}\\n\\t.scroll-btn {\\n\\t\\tgrid-area: scroll-btn;\\n\\t}\\n\\n\\t:global(.image) {\\n\\t\\tgrid-area: image;\\n\\t\\theight: 25vmax;\\n\\t\\twidth: 35vmax;\\n\\t\\tmargin: 20px;\\n\\t\\tborder-radius: 0.9em;\\n\\t\\tbox-shadow: inset 0 0 40px var(--shadow-color), 5px 10px 25px var(--about-text);\\n\\t\\tbackground-position: center;\\n\\t}\\n\\n\\t.default-image {\\n\\t\\tbackground: linear-gradient(rgba(49, 82, 80, 0.609), rgba(63, 238, 230, 0.7)), no-repeat;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t}\\n\\n\\t.content {\\n\\t\\tgrid-area: text;\\n\\t\\twidth: clamp(400px, 100%, 900px);\\n\\t\\tfont-size: 1.5em;\\n\\t\\tpadding: 10px;\\n\\t}\\n\\t:global(.about-p),\\n\\t:global(.about-strong),\\n\\t:global(.about-a),\\n\\t:global(.about-li) {\\n\\t\\tmargin: 40px auto 40px auto;\\n\\t\\tcolor: var(--about-text);\\n\\t}\\n\\t:global(.about-h2) {\\n\\t\\tfont-size: 1.3em;\\n\\t}\\n\\n\\t:global(.about-p),\\n\\t:global(.about-strong) {\\n\\t\\tline-height: 2em;\\n\\t}\\n\\n\\t@media only screen and (max-width: 1500px) {\\n\\t\\t.container {\\n\\t\\t\\tgrid-template-areas:\\n\\t\\t\\t\\t'image'\\n\\t\\t\\t\\t'text'\\n\\t\\t\\t\\t'scroll-btn';\\n\\t\\t\\tpadding: 5px;\\n\\t\\t}\\n\\t\\t:global(.image) {\\n\\t\\t\\theight: 50vmax;\\n\\t\\t\\twidth: 90vmax;\\n\\t\\t}\\n\\t\\t.content {\\n\\t\\t\\twidth: 90%;\\n\\t\\t}\\n\\t}\\n\\n\\t@media only screen and (max-width: 850px) {\\n\\t\\t:global(.image) {\\n\\t\\t\\theight: 25vmax;\\n\\t\\t\\twidth: 50vmax;\\n\\t\\t}\\n\\t\\t:global(.image) > :global(p) {\\n\\t\\t\\tfont-size: 2em;\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAoBC,UAAU,cAAC,CAAC,AACX,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,mBAAmB,CAClB,iBAAiB;GACjB,gBAAgB,CACjB,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CAAC,IAAI,CAAC,GAAG,CAAC,IAAI,CAC1B,OAAO,CAAE,GAAG,AACb,CAAC,AACD,WAAW,cAAC,CAAC,AACZ,SAAS,CAAE,UAAU,AACtB,CAAC,AAEO,MAAM,AAAE,CAAC,AAChB,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,CACb,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,KAAK,CACpB,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,cAAc,CAAC,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,IAAI,YAAY,CAAC,CAC/E,mBAAmB,CAAE,MAAM,AAC5B,CAAC,AAED,cAAc,cAAC,CAAC,AACf,UAAU,CAAE,gBAAgB,KAAK,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,SAAS,CACxF,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,AACpB,CAAC,AAED,QAAQ,cAAC,CAAC,AACT,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,MAAM,KAAK,CAAC,CAAC,IAAI,CAAC,CAAC,KAAK,CAAC,CAChC,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,IAAI,AACd,CAAC,AACO,QAAQ,AAAC,CACT,aAAa,AAAC,CACd,QAAQ,AAAC,CACT,SAAS,AAAE,CAAC,AACnB,MAAM,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CAAC,IAAI,CAC3B,KAAK,CAAE,IAAI,YAAY,CAAC,AACzB,CAAC,AACO,SAAS,AAAE,CAAC,AACnB,SAAS,CAAE,KAAK,AACjB,CAAC,AAEO,QAAQ,AAAC,CACT,aAAa,AAAE,CAAC,AACvB,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC3C,UAAU,cAAC,CAAC,AACX,mBAAmB,CAClB,OAAO;IACP,MAAM;IACN,YAAY,CACb,OAAO,CAAE,GAAG,AACb,CAAC,AACO,MAAM,AAAE,CAAC,AAChB,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,AACd,CAAC,AACD,QAAQ,cAAC,CAAC,AACT,KAAK,CAAE,GAAG,AACX,CAAC,AACF,CAAC,AAED,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAClC,MAAM,AAAE,CAAC,AAChB,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,AACd,CAAC,AACO,MAAM,AAAC,CAAW,CAAC,AAAE,CAAC,AAC7B,SAAS,CAAE,GAAG,AACf,CAAC,AACF,CAAC"}`
};
var AboutStyles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `<div class="${"container svelte-qh7quo"}">${slots.image ? slots.image({}) : `
		<div class="${"image default-image svelte-qh7quo"}">No content</div>
	`}

	<div class="${"content svelte-qh7quo"}">${slots.content ? slots.content({}) : `
			<div class="${"content svelte-qh7quo"}">nothing to show</div>
		`}</div>
	<button class="${"btn btn-main btn-center scroll-btn svelte-qh7quo"}">Scroll Top</button>
</div>`;
});
var AboutStyles$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": AboutStyles
});
var css$1 = {
  code: ".local-image.svelte-1okodsa{background:linear-gradient(rgba(49, 82, 80, 0.609), rgba(63, 238, 230, 0.7)),\n			url('/IMG_0261.png') no-repeat;background-size:contain;background-position:bottom;height:35vmax;width:25vmax}",
  map: `{"version":3,"file":"AboutBluf.svelte","sources":["AboutBluf.svelte"],"sourcesContent":["<script lang=\\"ts\\">import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';\\nimport AboutStyles from './AboutStyles.svelte';\\n<\/script>\\n\\n<div>\\n\\t<SubPageTitleBar title={'bluf'} colorVar={'white'} textColor={'var(--blue)'} />\\n\\t<AboutStyles>\\n\\t\\t<span slot=\\"image\\">\\n\\t\\t\\t<div class=\\"local-image image\\" />\\n\\t\\t</span>\\n\\t\\t<span slot=\\"content\\">\\n\\t\\t\\t<p class=\\"about-p\\">\\n\\t\\t\\t\\tI am a 24 year Navy veteran with a passion for finding and applying data-driven solutions to\\n\\t\\t\\t\\timprove business outcomes. In my years of service I have developed a passion for life-long\\n\\t\\t\\t\\tlearning and watching technology trends for ways to improve productivity, quality of work,\\n\\t\\t\\t\\tand quality of life.\\n\\t\\t\\t</p>\\n\\t\\t</span>\\n\\t</AboutStyles>\\n</div>\\n\\n<style>\\n\\t.local-image {\\n\\t\\tbackground: linear-gradient(rgba(49, 82, 80, 0.609), rgba(63, 238, 230, 0.7)),\\n\\t\\t\\turl('/IMG_0261.png') no-repeat;\\n\\t\\tbackground-size: contain;\\n\\t\\tbackground-position: bottom;\\n\\t\\theight: 35vmax;\\n\\t\\twidth: 25vmax;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAsBC,YAAY,eAAC,CAAC,AACb,UAAU,CAAE,gBAAgB,KAAK,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;GAC7E,IAAI,eAAe,CAAC,CAAC,SAAS,CAC/B,eAAe,CAAE,OAAO,CACxB,mBAAmB,CAAE,MAAM,CAC3B,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,AACd,CAAC"}`
};
var AboutBluf = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `<div>${validate_component(SubPageTitleBar, "SubPageTitleBar").$$render($$result, {
    title: "bluf",
    colorVar: "white",
    textColor: "var(--blue)"
  }, {}, {})}
	${validate_component(AboutStyles, "AboutStyles").$$render($$result, {}, {}, {
    content: () => `<span slot="${"content"}"><p class="${"about-p"}">I am a 24 year Navy veteran with a passion for finding and applying data-driven solutions to
				improve business outcomes. In my years of service I have developed a passion for life-long
				learning and watching technology trends for ways to improve productivity, quality of work,
				and quality of life.
			</p></span>`,
    image: () => `<span slot="${"image"}"><div class="${"local-image image svelte-1okodsa"}"></div></span>`
  })}
</div>`;
});
var AboutBluf$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": AboutBluf
});
var css = {
  code: ".local-image.svelte-14sisee{background:linear-gradient(rgba(49, 82, 80, 0.609), rgba(63, 238, 230, 0.7)),\n			url('/FS0A5054.png') no-repeat;background-size:cover}",
  map: `{"version":3,"file":"AboutBackstory.svelte","sources":["AboutBackstory.svelte"],"sourcesContent":["<script lang=\\"ts\\">import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';\\nimport AboutStyles from './AboutStyles.svelte';\\n<\/script>\\n\\n<div>\\n\\t<SubPageTitleBar title={'backstory'} colorVar={'white'} textColor={'var(--blue)'} />\\n\\t<AboutStyles>\\n\\t\\t<span slot=\\"image\\">\\n\\t\\t\\t<div class=\\"local-image image\\" />\\n\\t\\t</span>\\n\\t\\t<span slot=\\"content\\">\\n\\t\\t\\t<p class=\\"about-p\\">\\n\\t\\t\\t\\tBorn and raised a California boy, I enlisted in the Navy in 1997 as a\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"about-a\\"\\n\\t\\t\\t\\t\\ttitle=\\"Submarine Communications Electronics Technician description.\\"\\n\\t\\t\\t\\t\\thref=\\"https://www.careersinthemilitary.com/service-career-detail/navy/electrical-instrument-and-equipment-repairers/electronics-technician--submarine--communications\\"\\n\\t\\t\\t\\t\\t>Submarine Electronics Technician (Communications).</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\tAfter 9 years, I promoted to Chief Petty Officer, and after 16 years commissioned as a\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"about-a\\"\\n\\t\\t\\t\\t\\ttitle=\\"Submarine Communications Limited Duty Officer (LDO) description.\\"\\n\\t\\t\\t\\t\\thref=\\"https://www.cool.osd.mil/usn/officer/odc629x.htm\\"\\n\\t\\t\\t\\t\\t>Submarine Communications Limited Duty Officer</a\\n\\t\\t\\t\\t>. In 2015, I completed my Bachelor's degree in Business Administration from Excelsior\\n\\t\\t\\t\\tCollege. After completing My Information Warfare Officer qualification in 2016, I\\n\\t\\t\\t\\tredesignated to the\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"about-a\\"\\n\\t\\t\\t\\t\\ttitle=\\"Information Professional Corps description.\\"\\n\\t\\t\\t\\t\\thref=\\"https://www.navy.com/careers/information-professional\\"\\n\\t\\t\\t\\t\\t>Information Professional Corp</a\\n\\t\\t\\t\\t>. During the same time I was working on my Technology/Innovation Management MBA. However, I\\n\\t\\t\\t\\ttook 2020 off due to the COVID-19 pandemic. In that time I taught myself web-development to\\n\\t\\t\\t\\tsupport changing workplace requirements. At the start of 2021, I re-engaged on my MBA and\\n\\t\\t\\t\\tcontinue to serve in the US Navy. I have four classes left, and intend to finish in the near\\n\\t\\t\\t\\tfuture. I am currently working and living in Washington State enjoying the Pacific Northwest\\n\\t\\t\\t\\twith my wife and four daughters.\\n\\t\\t\\t</p>\\n\\t\\t</span>\\n\\t</AboutStyles>\\n</div>\\n\\n<style>\\n\\t.local-image {\\n\\t\\tbackground: linear-gradient(rgba(49, 82, 80, 0.609), rgba(63, 238, 230, 0.7)),\\n\\t\\t\\turl('/FS0A5054.png') no-repeat;\\n\\t\\tbackground-size: cover;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA6CC,YAAY,eAAC,CAAC,AACb,UAAU,CAAE,gBAAgB,KAAK,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC;GAC7E,IAAI,eAAe,CAAC,CAAC,SAAS,CAC/B,eAAe,CAAE,KAAK,AACvB,CAAC"}`
};
var AboutBackstory = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<div>${validate_component(SubPageTitleBar, "SubPageTitleBar").$$render($$result, {
    title: "backstory",
    colorVar: "white",
    textColor: "var(--blue)"
  }, {}, {})}
	${validate_component(AboutStyles, "AboutStyles").$$render($$result, {}, {}, {
    content: () => `<span slot="${"content"}"><p class="${"about-p"}">Born and raised a California boy, I enlisted in the Navy in 1997 as a
				<a class="${"about-a"}" title="${"Submarine Communications Electronics Technician description."}" href="${"https://www.careersinthemilitary.com/service-career-detail/navy/electrical-instrument-and-equipment-repairers/electronics-technician--submarine--communications"}">Submarine Electronics Technician (Communications).</a>
				After 9 years, I promoted to Chief Petty Officer, and after 16 years commissioned as a
				<a class="${"about-a"}" title="${"Submarine Communications Limited Duty Officer (LDO) description."}" href="${"https://www.cool.osd.mil/usn/officer/odc629x.htm"}">Submarine Communications Limited Duty Officer</a>. In 2015, I completed my Bachelor&#39;s degree in Business Administration from Excelsior
				College. After completing My Information Warfare Officer qualification in 2016, I
				redesignated to the
				<a class="${"about-a"}" title="${"Information Professional Corps description."}" href="${"https://www.navy.com/careers/information-professional"}">Information Professional Corp</a>. During the same time I was working on my Technology/Innovation Management MBA. However, I
				took 2020 off due to the COVID-19 pandemic. In that time I taught myself web-development to
				support changing workplace requirements. At the start of 2021, I re-engaged on my MBA and
				continue to serve in the US Navy. I have four classes left, and intend to finish in the near
				future. I am currently working and living in Washington State enjoying the Pacific Northwest
				with my wife and four daughters.
			</p></span>`,
    image: () => `<span slot="${"image"}"><div class="${"local-image image svelte-14sisee"}"></div></span>`
  })}
</div>`;
});
var AboutBackstory$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": AboutBackstory
});
var About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `${$$result.title = `<title>Nathan Meeker || About</title>`, ""}`, ""}

<div>${validate_component(SubPageTitleBar, "SubPageTitleBar").$$render($$result, {
    title: "about me",
    colorVar: "white",
    textColor: "var(--blue)"
  }, {}, {})}
	${validate_component(AboutBluf, "AboutBluf").$$render($$result, {}, {}, {})}
	${validate_component(AboutBackstory, "AboutBackstory").$$render($$result, {}, {}, {})}
</div>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": About
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const encoding = isBase64Encoded ? "base64" : headers["content-encoding"] || "utf-8";
  const rawBody = typeof body === "string" ? Buffer.from(body, encoding) : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (!rendered) {
    return {
      statusCode: 404,
      body: "Not found"
    };
  }
  const partial_response = {
    statusCode: rendered.status,
    ...split_headers(rendered.headers)
  };
  if (rendered.body instanceof Uint8Array) {
    return {
      ...partial_response,
      isBase64Encoded: true,
      body: Buffer.from(rendered.body).toString("base64")
    };
  }
  return {
    ...partial_response,
    body: rendered.body
  };
}
function split_headers(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
/*! @license DOMPurify 2.3.3 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.3.3/LICENSE */
