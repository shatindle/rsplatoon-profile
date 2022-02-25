
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
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
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.46.3 */

    function create_fragment$7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(6, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(5, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(7, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$routes,
    		$base
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 128) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 96) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$location,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.46.3 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams, $location*/ 532)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    function link(node) {
      function onClick(event) {
        const anchor = event.currentTarget;

        if (
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event)
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    const userData = async () => (await fetch("/api/user")).json();
    const templateList = async () => (await fetch("/api/templates/all")).json();

    /* src\pages\Home.svelte generated by Svelte v3.46.3 */

    const { console: console_1$2 } = globals;
    const file$5 = "src\\pages\\Home.svelte";

    // (148:0) {:else}
    function create_else_block_1$1(ctx) {
    	let div;
    	let a;
    	let button;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			button = element("button");
    			button.textContent = "Discord Login";
    			attr_dev(button, "class", "btn btn-primary");
    			attr_dev(button, "type", "button");
    			add_location(button, file$5, 150, 12, 6307);
    			attr_dev(a, "id", "loginDiscord");
    			attr_dev(a, "href", a_href_value = /*userdata*/ ctx[0].loginUrl);
    			add_location(a, file$5, 149, 8, 6247);
    			attr_dev(div, "class", "nameentry needtologin");
    			add_location(div, file$5, 148, 4, 6202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, button);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userdata*/ 1 && a_href_value !== (a_href_value = /*userdata*/ ctx[0].loginUrl)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(148:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (79:0) {#if userdata.id}
    function create_if_block$5(ctx) {
    	let div11;
    	let div1;
    	let div0;
    	let t0;
    	let div10;
    	let div2;
    	let t1;
    	let div9;
    	let form;
    	let div8;
    	let h30;
    	let t3;
    	let input0;
    	let t4;
    	let h31;
    	let t6;
    	let input1;
    	let t7;
    	let div7;
    	let div4;
    	let div3;
    	let h32;
    	let t9;
    	let div6;
    	let div5;
    	let button0;

    	let t10_value = (/*selectedTemplate*/ ctx[2]
    	? /*selectedTemplate*/ ctx[2].name
    	: "Splatoon 3 Blue on Yellow") + "";

    	let t10;
    	let t11;
    	let input2;
    	let input2_value_value;
    	let t12;
    	let t13;
    	let button1;
    	let mounted;
    	let dispose;
    	let if_block0 = /*userdata*/ ctx[0].profileId && create_if_block_3$2(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*userdata*/ ctx[0].drip) return create_if_block_2$2;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*selectedTemplate*/ ctx[2] && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div10 = element("div");
    			div2 = element("div");
    			if_block1.c();
    			t1 = space();
    			div9 = element("div");
    			form = element("form");
    			div8 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Username";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			h31 = element("h3");
    			h31.textContent = "Friend Code";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div7 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Card Template";
    			t9 = space();
    			div6 = element("div");
    			div5 = element("div");
    			button0 = element("button");
    			t10 = text(t10_value);
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			if (if_block2) if_block2.c();
    			t13 = space();
    			button1 = element("button");
    			button1.textContent = "Save";
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$5, 81, 12, 2471);
    			attr_dev(div1, "class", "row");
    			set_style(div1, "margin-bottom", "14px");
    			add_location(div1, file$5, 80, 8, 2411);
    			attr_dev(div2, "class", "col-12 col-md-6");
    			add_location(div2, file$5, 101, 12, 3565);
    			attr_dev(h30, "for", "name");
    			add_location(h30, file$5, 119, 24, 4438);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "placeholder", "In game name");
    			attr_dev(input0, "maxlength", "10");
    			add_location(input0, file$5, 120, 24, 4492);
    			attr_dev(h31, "for", "friendcode");
    			add_location(h31, file$5, 122, 24, 4677);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "name", "friendcode");
    			attr_dev(input1, "id", "friendcode");
    			attr_dev(input1, "placeholder", "0000-0000-0000");
    			add_location(input1, file$5, 123, 24, 4740);
    			attr_dev(h32, "for", "template");
    			add_location(h32, file$5, 128, 36, 5080);
    			attr_dev(div3, "class", "col");
    			add_location(div3, file$5, 127, 32, 5025);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$5, 126, 28, 4974);
    			attr_dev(button0, "type", "button");
    			set_style(button0, "width", "100%");
    			attr_dev(button0, "class", "btn btn-primary");
    			add_location(button0, file$5, 133, 36, 5332);
    			attr_dev(input2, "type", "hidden");

    			input2.value = input2_value_value = /*selectedTemplate*/ ctx[2]
    			? /*selectedTemplate*/ ctx[2].id
    			: "s3-yellow-indigo";

    			attr_dev(input2, "name", "template");
    			add_location(input2, file$5, 134, 36, 5546);
    			attr_dev(div5, "class", "col-12");
    			add_location(div5, file$5, 132, 32, 5274);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$5, 131, 28, 5223);
    			attr_dev(div7, "class", "");
    			add_location(div7, file$5, 125, 24, 4930);
    			attr_dev(button1, "id", "submit");
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "btn btn-primary");
    			add_location(button1, file$5, 141, 24, 6015);
    			attr_dev(div8, "class", "form-group");
    			add_location(div8, file$5, 118, 20, 4388);
    			attr_dev(form, "action", "/api/save");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "id", "save-form");
    			add_location(form, file$5, 117, 16, 4312);
    			attr_dev(div9, "class", "col-12 col-md-6");
    			add_location(div9, file$5, 116, 12, 4265);
    			attr_dev(div10, "class", "row");
    			add_location(div10, file$5, 100, 8, 3534);
    			attr_dev(div11, "class", "container");
    			add_location(div11, file$5, 79, 4, 2378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div1);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div11, t0);
    			append_dev(div11, div10);
    			append_dev(div10, div2);
    			if_block1.m(div2, null);
    			append_dev(div10, t1);
    			append_dev(div10, div9);
    			append_dev(div9, form);
    			append_dev(form, div8);
    			append_dev(div8, h30);
    			append_dev(div8, t3);
    			append_dev(div8, input0);
    			set_input_value(input0, /*userdata*/ ctx[0].name);
    			append_dev(div8, t4);
    			append_dev(div8, h31);
    			append_dev(div8, t6);
    			append_dev(div8, input1);
    			set_input_value(input1, /*userdata*/ ctx[0].friendCode);
    			append_dev(div8, t7);
    			append_dev(div8, div7);
    			append_dev(div7, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h32);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, button0);
    			append_dev(button0, t10);
    			append_dev(div5, t11);
    			append_dev(div5, input2);
    			append_dev(div5, t12);
    			if (if_block2) if_block2.m(div5, null);
    			append_dev(div8, t13);
    			append_dev(div8, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(button0, "click", /*loadTemplatePicker*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*userdata*/ ctx[0].profileId) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			}

    			if (dirty & /*userdata*/ 1 && input0.value !== /*userdata*/ ctx[0].name) {
    				set_input_value(input0, /*userdata*/ ctx[0].name);
    			}

    			if (dirty & /*userdata*/ 1 && input1.value !== /*userdata*/ ctx[0].friendCode) {
    				set_input_value(input1, /*userdata*/ ctx[0].friendCode);
    			}

    			if (dirty & /*selectedTemplate*/ 4 && t10_value !== (t10_value = (/*selectedTemplate*/ ctx[2]
    			? /*selectedTemplate*/ ctx[2].name
    			: "Splatoon 3 Blue on Yellow") + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*selectedTemplate*/ 4 && input2_value_value !== (input2_value_value = /*selectedTemplate*/ ctx[2]
    			? /*selectedTemplate*/ ctx[2].id
    			: "s3-yellow-indigo")) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (/*selectedTemplate*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$3(ctx);
    					if_block2.c();
    					if_block2.m(div5, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(79:0) {#if userdata.id}",
    		ctx
    	});

    	return block;
    }

    // (83:16) {#if userdata.profileId}
    function create_if_block_3$2(ctx) {
    	let form;
    	let label;
    	let t1;
    	let div;
    	let input;
    	let input_value_value;
    	let t2;
    	let span;
    	let button;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			label = element("label");
    			label.textContent = "Your Profile Link";
    			t1 = space();
    			div = element("div");
    			input = element("input");
    			t2 = space();
    			span = element("span");
    			button = element("button");
    			i = element("i");
    			attr_dev(label, "for", "copy-input");
    			add_location(label, file$5, 84, 24, 2584);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control");
    			input.value = input_value_value = "" + (/*userdata*/ ctx[0].baseUrl + "/p/" + /*userdata*/ ctx[0].profileId + "?_v=" + new Date().valueOf());
    			attr_dev(input, "id", "copy-input");
    			input.readOnly = true;
    			add_location(input, file$5, 86, 32, 2745);
    			attr_dev(i, "class", "fa fa-copy");
    			add_location(i, file$5, 92, 40, 3294);
    			attr_dev(button, "class", "btn btn-default");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "id", "copy-button");
    			attr_dev(button, "data-toggle", "tooltip");
    			attr_dev(button, "data-placement", "button");
    			attr_dev(button, "title", "Copy to Clipboard");
    			add_location(button, file$5, 89, 32, 3043);
    			attr_dev(span, "class", "input-group-btn");
    			add_location(span, file$5, 88, 32, 2979);
    			attr_dev(div, "class", "input-group");
    			add_location(div, file$5, 85, 24, 2659);
    			add_location(form, file$5, 83, 20, 2552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label);
    			append_dev(form, t1);
    			append_dev(form, div);
    			append_dev(div, input);
    			/*input_binding*/ ctx[6](input);
    			append_dev(div, t2);
    			append_dev(div, span);
    			append_dev(span, button);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*copyToClipboard*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userdata*/ 1 && input_value_value !== (input_value_value = "" + (/*userdata*/ ctx[0].baseUrl + "/p/" + /*userdata*/ ctx[0].profileId + "?_v=" + new Date().valueOf())) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			/*input_binding*/ ctx[6](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(83:16) {#if userdata.profileId}",
    		ctx
    	});

    	return block;
    }

    // (109:16) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let h3;
    	let t1;
    	let a;
    	let t3;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "No drip";
    			t1 = space();
    			a = element("a");
    			a.textContent = "Edit";
    			t3 = space();
    			img = element("img");
    			add_location(h3, file$5, 110, 24, 3983);
    			attr_dev(a, "class", "btn btn-primary edit-drip");
    			attr_dev(a, "href", "/drip");
    			attr_dev(a, "role", "button");
    			add_location(a, file$5, 111, 24, 4025);
    			add_location(div, file$5, 109, 20, 3952);
    			if (!src_url_equal(img.src, img_src_value = "/css/img/nodrip.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "drip");
    			add_location(img, file$5, 113, 20, 4147);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(div, t1);
    			append_dev(div, a);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(109:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (103:16) {#if userdata.drip}
    function create_if_block_2$2(ctx) {
    	let div;
    	let h3;
    	let t1;
    	let a;
    	let t3;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Your drip";
    			t1 = space();
    			a = element("a");
    			a.textContent = "Edit";
    			t3 = space();
    			img = element("img");
    			add_location(h3, file$5, 104, 24, 3684);
    			attr_dev(a, "class", "btn btn-primary edit-drip");
    			attr_dev(a, "href", "/drip");
    			attr_dev(a, "role", "button");
    			add_location(a, file$5, 105, 24, 3728);
    			add_location(div, file$5, 103, 20, 3653);
    			if (!src_url_equal(img.src, img_src_value = /*userdata*/ ctx[0].drip)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "drip");
    			add_location(img, file$5, 107, 20, 3850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(div, t1);
    			append_dev(div, a);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userdata*/ 1 && !src_url_equal(img.src, img_src_value = /*userdata*/ ctx[0].drip)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(103:16) {#if userdata.drip}",
    		ctx
    	});

    	return block;
    }

    // (136:36) {#if selectedTemplate}
    function create_if_block_1$3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*selectedTemplate*/ ctx[2].url)) attr_dev(img, "src", img_src_value);
    			set_style(img, "width", "100%");
    			attr_dev(img, "id", "templateimage");
    			attr_dev(img, "alt", "template");
    			add_location(img, file$5, 136, 36, 5751);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedTemplate*/ 4 && !src_url_equal(img.src, img_src_value = /*selectedTemplate*/ ctx[2].url)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(136:36) {#if selectedTemplate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*userdata*/ ctx[0].id) return create_if_block$5;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			add_location(div, file$5, 77, 0, 2348);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function cleanFriendCode(current = "") {
    	current = current.replace(/[^0-9]/g, '');
    	let final = "";

    	for (let i = 0; i < current.length; i++) {
    		if (i === 12) break;
    		if (i === 4 || i === 8) final += "-";
    		final += current[i];
    	}

    	return final;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let { userdata = {} } = $$props;
    	let { location = "" } = $$props;
    	let options = [], copyInput, selectedTemplate, open = false;

    	onMount(async () => {
    		options = await templateList();

    		if (userdata && userdata.template && options && options.length > 0) {
    			let templateFound = options.filter(t => t.id === userdata.template);
    			if (templateFound.length === 1) $$invalidate(2, selectedTemplate = templateFound[0]); else $$invalidate(2, selectedTemplate = options.filter(t => t.id === "s3-yellow-indigo")[0]);
    		} else {
    			$$invalidate(2, selectedTemplate = options.filter(t => t.id === "s3-yellow-indigo")[0]);
    		}

    		jQuery("#save-form").on("submit", function () {
    			jQuery("#submit").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Loading...');
    		});
    	});

    	function loadTemplatePicker() {
    		navigate("/templates");
    	}

    	beforeUpdate(() => {
    		$$invalidate(0, userdata.friendCode = cleanFriendCode(userdata.friendCode), userdata);

    		if (userdata && userdata.template && options && options.length > 0) {
    			let templateFound = options.filter(t => t.id === userdata.template);
    			if (templateFound.length === 1) $$invalidate(2, selectedTemplate = templateFound[0]); else $$invalidate(2, selectedTemplate = options.filter(t => t.id === "s3-yellow-indigo")[0]);
    		} else {
    			$$invalidate(2, selectedTemplate = options.filter(t => t.id === "s3-yellow-indigo")[0]);
    		}
    	});

    	function copyToClipboard() {
    		console.log("going");
    		copyInput.focus();
    		copyInput.select();
    		document.execCommand("copy");
    	}

    	const writable_props = ['userdata', 'location'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			copyInput = $$value;
    			$$invalidate(1, copyInput);
    		});
    	}

    	function input0_input_handler() {
    		userdata.name = this.value;
    		$$invalidate(0, userdata);
    	}

    	function input1_input_handler() {
    		userdata.friendCode = this.value;
    		$$invalidate(0, userdata);
    	}

    	$$self.$$set = $$props => {
    		if ('userdata' in $$props) $$invalidate(0, userdata = $$props.userdata);
    		if ('location' in $$props) $$invalidate(5, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		beforeUpdate,
    		templateList,
    		navigate,
    		userdata,
    		location,
    		options,
    		copyInput,
    		selectedTemplate,
    		open,
    		loadTemplatePicker,
    		cleanFriendCode,
    		copyToClipboard
    	});

    	$$self.$inject_state = $$props => {
    		if ('userdata' in $$props) $$invalidate(0, userdata = $$props.userdata);
    		if ('location' in $$props) $$invalidate(5, location = $$props.location);
    		if ('options' in $$props) options = $$props.options;
    		if ('copyInput' in $$props) $$invalidate(1, copyInput = $$props.copyInput);
    		if ('selectedTemplate' in $$props) $$invalidate(2, selectedTemplate = $$props.selectedTemplate);
    		if ('open' in $$props) open = $$props.open;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		userdata,
    		copyInput,
    		selectedTemplate,
    		loadTemplatePicker,
    		copyToClipboard,
    		location,
    		input_binding,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { userdata: 0, location: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get userdata() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userdata(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const getProfile = async (id) => (await fetch(`/api/profile/${id}`)).json();

    /* src\pages\Profile.svelte generated by Svelte v3.46.3 */

    const { console: console_1$1 } = globals;
    const file$4 = "src\\pages\\Profile.svelte";

    // (38:12) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let h3;
    	let t1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "No drip";
    			t1 = space();
    			img = element("img");
    			add_location(h3, file$4, 39, 20, 1039);
    			add_location(div, file$4, 38, 16, 1012);
    			if (!src_url_equal(img.src, img_src_value = "/css/img/nodrip.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "no drip");
    			add_location(img, file$4, 41, 16, 1097);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(38:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:12) {#if profile.drip}
    function create_if_block$4(ctx) {
    	let div;
    	let h3;
    	let t1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Their drip";
    			t1 = space();
    			img = element("img");
    			add_location(h3, file$4, 34, 20, 858);
    			add_location(div, file$4, 33, 16, 831);
    			if (!src_url_equal(img.src, img_src_value = /*profile*/ ctx[0].drip)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "drip");
    			add_location(img, file$4, 36, 16, 919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*profile*/ 1 && !src_url_equal(img.src, img_src_value = /*profile*/ ctx[0].drip)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(33:12) {#if profile.drip}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div6;
    	let div1;
    	let div0;
    	let h30;

    	let t0_value = (/*profile*/ ctx[0].name
    	? /*profile*/ ctx[0].name
    	: 'User') + "";

    	let t0;
    	let t1;
    	let t2;
    	let div5;
    	let div2;
    	let t3;
    	let div4;
    	let form;
    	let h31;
    	let t5;
    	let div3;
    	let input;
    	let input_value_value;
    	let t6;
    	let span;
    	let button;
    	let i;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*profile*/ ctx[0].drip) return create_if_block$4;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			t0 = text(t0_value);
    			t1 = text("'s Profile");
    			t2 = space();
    			div5 = element("div");
    			div2 = element("div");
    			if_block.c();
    			t3 = space();
    			div4 = element("div");
    			form = element("form");
    			h31 = element("h3");
    			h31.textContent = "Friend Code";
    			t5 = space();
    			div3 = element("div");
    			input = element("input");
    			t6 = space();
    			span = element("span");
    			button = element("button");
    			i = element("i");
    			add_location(h30, file$4, 27, 12, 605);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$4, 26, 8, 574);
    			attr_dev(div1, "class", "row");
    			set_style(div1, "margin-bottom", "14px");
    			add_location(div1, file$4, 25, 4, 518);
    			attr_dev(div2, "class", "col-12 col-md-6");
    			add_location(div2, file$4, 31, 8, 752);
    			attr_dev(h31, "for", "copy-input");
    			add_location(h31, file$4, 46, 16, 1273);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control");
    			input.value = input_value_value = /*profile*/ ctx[0].friendCode;
    			attr_dev(input, "id", "copy-input");
    			input.readOnly = true;
    			add_location(input, file$4, 48, 22, 1404);
    			attr_dev(i, "class", "fa fa-copy");
    			add_location(i, file$4, 54, 30, 1850);
    			attr_dev(button, "class", "btn btn-default");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "id", "copy-button");
    			attr_dev(button, "data-toggle", "tooltip");
    			attr_dev(button, "data-placement", "button");
    			attr_dev(button, "title", "Copy to Clipboard");
    			add_location(button, file$4, 51, 24, 1625);
    			attr_dev(span, "class", "input-group-btn");
    			add_location(span, file$4, 50, 22, 1569);
    			attr_dev(div3, "class", "input-group");
    			add_location(div3, file$4, 47, 16, 1328);
    			add_location(form, file$4, 45, 12, 1249);
    			attr_dev(div4, "class", "col-12 col-md-6");
    			add_location(div4, file$4, 44, 8, 1206);
    			attr_dev(div5, "class", "row");
    			set_style(div5, "margin-bottom", "14px");
    			add_location(div5, file$4, 30, 4, 696);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$4, 24, 0, 489);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h30);
    			append_dev(h30, t0);
    			append_dev(h30, t1);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			if_block.m(div2, null);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, form);
    			append_dev(form, h31);
    			append_dev(form, t5);
    			append_dev(form, div3);
    			append_dev(div3, input);
    			/*input_binding*/ ctx[5](input);
    			append_dev(div3, t6);
    			append_dev(div3, span);
    			append_dev(span, button);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(div3, "click", /*copyToClipboard*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*profile*/ 1 && t0_value !== (t0_value = (/*profile*/ ctx[0].name
    			? /*profile*/ ctx[0].name
    			: 'User') + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}

    			if (dirty & /*profile*/ 1 && input_value_value !== (input_value_value = /*profile*/ ctx[0].friendCode) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if_block.d();
    			/*input_binding*/ ctx[5](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Profile', slots, []);
    	let { profileId = "" } = $$props;
    	let { location = "" } = $$props;
    	let profile = {};

    	onMount(async () => {
    		$$invalidate(0, profile = await getProfile(profileId));
    	});

    	let copyInput;

    	function copyToClipboard() {
    		console.log("going");
    		copyInput.focus();
    		copyInput.select();
    		document.execCommand("copy");
    	}

    	const writable_props = ['profileId', 'location'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			copyInput = $$value;
    			$$invalidate(1, copyInput);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('profileId' in $$props) $$invalidate(3, profileId = $$props.profileId);
    		if ('location' in $$props) $$invalidate(4, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getProfile,
    		profileId,
    		location,
    		profile,
    		copyInput,
    		copyToClipboard
    	});

    	$$self.$inject_state = $$props => {
    		if ('profileId' in $$props) $$invalidate(3, profileId = $$props.profileId);
    		if ('location' in $$props) $$invalidate(4, location = $$props.location);
    		if ('profile' in $$props) $$invalidate(0, profile = $$props.profile);
    		if ('copyInput' in $$props) $$invalidate(1, copyInput = $$props.copyInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [profile, copyInput, copyToClipboard, profileId, location, input_binding];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { profileId: 3, location: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get profileId() {
    		throw new Error("<Profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set profileId(value) {
    		throw new Error("<Profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<Profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const getSettings = async () => (await fetch("/api/settings")).json();

    const saveBotKeyConfig = async (bot) => {
        await fetch("/api/settings/updatekey", {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bot)
        });
    };

    const resetKeyConfig = async (id) => {
        await fetch("/api/settings/resetkey", {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: id
            })
        });
    };

    const revokeKeyConfig = async (id) => {
        await fetch("/api/settings/revokekey", {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: id
            })
        });
    };

    /* src\pages\Settings.svelte generated by Svelte v3.46.3 */

    const { console: console_1 } = globals;

    const file$3 = "src\\pages\\Settings.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[20] = list;
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (41:4) {#if settings.isAdmin}
    function create_if_block_2$1(ctx) {
    	let div8;
    	let div7;
    	let form;
    	let div6;
    	let div0;
    	let h3;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let input1;
    	let t3;
    	let label0;
    	let t5;
    	let div2;
    	let input2;
    	let t6;
    	let label1;
    	let t8;
    	let div3;
    	let input3;
    	let t9;
    	let label2;
    	let t11;
    	let div4;
    	let input4;
    	let t12;
    	let label3;
    	let t14;
    	let div5;
    	let input5;
    	let t15;
    	let label4;
    	let t17;
    	let button;
    	let t19;
    	let div13;
    	let div12;
    	let div11;
    	let div10;
    	let div9;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t21;
    	let th1;
    	let t23;
    	let th2;
    	let t25;
    	let th3;
    	let t27;
    	let th4;
    	let t29;
    	let th5;
    	let t31;
    	let th6;
    	let t33;
    	let th7;
    	let t35;
    	let th8;
    	let t37;
    	let th9;
    	let t39;
    	let th10;
    	let t41;
    	let th11;
    	let t43;
    	let tbody;
    	let if_block = /*settings*/ ctx[0].allbots && /*settings*/ ctx[0].allbots.length && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div7 = element("div");
    			form = element("form");
    			div6 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Grant bot key to another user";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Get Profile";
    			t5 = space();
    			div2 = element("div");
    			input2 = element("input");
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Save Friend Code";
    			t8 = space();
    			div3 = element("div");
    			input3 = element("input");
    			t9 = space();
    			label2 = element("label");
    			label2.textContent = "Save Username";
    			t11 = space();
    			div4 = element("div");
    			input4 = element("input");
    			t12 = space();
    			label3 = element("label");
    			label3.textContent = "Save Drip";
    			t14 = space();
    			div5 = element("div");
    			input5 = element("input");
    			t15 = space();
    			label4 = element("label");
    			label4.textContent = "Delete Profile";
    			t17 = space();
    			button = element("button");
    			button.textContent = "Save";
    			t19 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "User";
    			t21 = space();
    			th1 = element("th");
    			th1.textContent = "Get Profile";
    			t23 = space();
    			th2 = element("th");
    			th2.textContent = "Save FC";
    			t25 = space();
    			th3 = element("th");
    			th3.textContent = "Save Name";
    			t27 = space();
    			th4 = element("th");
    			th4.textContent = "Save Drip";
    			t29 = space();
    			th5 = element("th");
    			th5.textContent = "Delete Profile";
    			t31 = space();
    			th6 = element("th");
    			th6.textContent = "Team Query";
    			t33 = space();
    			th7 = element("th");
    			th7.textContent = "Team Webhook";
    			t35 = space();
    			th8 = element("th");
    			th8.textContent = "Revoked";
    			t37 = space();
    			th9 = element("th");
    			th9.textContent = "Update";
    			t39 = space();
    			th10 = element("th");
    			th10.textContent = "Reset";
    			t41 = space();
    			th11 = element("th");
    			th11.textContent = "Revoke";
    			t43 = space();
    			tbody = element("tbody");
    			if (if_block) if_block.c();
    			attr_dev(h3, "for", "name");
    			add_location(h3, file$3, 46, 28, 1321);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "name", "name");
    			input0.value = "";
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "placeholder", "User ID");
    			add_location(input0, file$3, 47, 28, 1400);
    			add_location(div0, file$3, 45, 24, 1286);
    			attr_dev(input1, "class", "form-check-input");
    			attr_dev(input1, "type", "checkbox");
    			input1.value = "getProfile";
    			attr_dev(input1, "name", "permissions");
    			set_style(input1, "width", "auto");
    			add_location(input1, file$3, 50, 28, 1607);
    			attr_dev(label0, "class", "form-check-label");
    			attr_dev(label0, "for", "flexCheckDefault");
    			add_location(label0, file$3, 51, 28, 1742);
    			attr_dev(div1, "class", "form-check");
    			add_location(div1, file$3, 49, 24, 1553);
    			attr_dev(input2, "class", "form-check-input");
    			attr_dev(input2, "type", "checkbox");
    			input2.value = "saveFriendCode";
    			attr_dev(input2, "name", "permissions");
    			set_style(input2, "width", "auto");
    			add_location(input2, file$3, 56, 28, 1992);
    			attr_dev(label1, "class", "form-check-label");
    			attr_dev(label1, "for", "flexCheckDefault");
    			add_location(label1, file$3, 57, 28, 2131);
    			attr_dev(div2, "class", "form-check");
    			add_location(div2, file$3, 55, 24, 1938);
    			attr_dev(input3, "class", "form-check-input");
    			attr_dev(input3, "type", "checkbox");
    			input3.value = "saveUsername";
    			attr_dev(input3, "name", "permissions");
    			set_style(input3, "width", "auto");
    			add_location(input3, file$3, 62, 28, 2386);
    			attr_dev(label2, "class", "form-check-label");
    			attr_dev(label2, "for", "flexCheckDefault");
    			add_location(label2, file$3, 63, 28, 2523);
    			attr_dev(div3, "class", "form-check");
    			add_location(div3, file$3, 61, 24, 2332);
    			attr_dev(input4, "class", "form-check-input");
    			attr_dev(input4, "type", "checkbox");
    			input4.value = "saveDrip";
    			attr_dev(input4, "name", "permissions");
    			set_style(input4, "width", "auto");
    			add_location(input4, file$3, 68, 28, 2775);
    			attr_dev(label3, "class", "form-check-label");
    			attr_dev(label3, "for", "flexCheckDefault");
    			add_location(label3, file$3, 69, 28, 2908);
    			attr_dev(div4, "class", "form-check");
    			add_location(div4, file$3, 67, 24, 2721);
    			attr_dev(input5, "class", "form-check-input");
    			attr_dev(input5, "type", "checkbox");
    			input5.value = "deleteProfile";
    			attr_dev(input5, "name", "permissions");
    			set_style(input5, "width", "auto");
    			add_location(input5, file$3, 74, 28, 3156);
    			attr_dev(label4, "class", "form-check-label");
    			attr_dev(label4, "for", "flexCheckDefault");
    			add_location(label4, file$3, 75, 28, 3294);
    			attr_dev(div5, "class", "form-check");
    			add_location(div5, file$3, 73, 24, 3102);
    			attr_dev(button, "id", "submit");
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$3, 79, 24, 3493);
    			attr_dev(div6, "class", "form-group");
    			add_location(div6, file$3, 44, 20, 1236);
    			attr_dev(form, "action", "/api/settings/grantkey");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "id", "save-form");
    			add_location(form, file$3, 43, 16, 1147);
    			attr_dev(div7, "class", "col");
    			add_location(div7, file$3, 42, 12, 1112);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file$3, 41, 8, 1081);
    			attr_dev(th0, "scope", "col");
    			add_location(th0, file$3, 92, 40, 4089);
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$3, 93, 40, 4156);
    			attr_dev(th2, "scope", "col");
    			add_location(th2, file$3, 94, 40, 4230);
    			attr_dev(th3, "scope", "col");
    			add_location(th3, file$3, 95, 40, 4300);
    			attr_dev(th4, "scope", "col");
    			add_location(th4, file$3, 96, 40, 4372);
    			attr_dev(th5, "scope", "col");
    			add_location(th5, file$3, 97, 40, 4444);
    			attr_dev(th6, "scope", "col");
    			add_location(th6, file$3, 98, 40, 4521);
    			attr_dev(th7, "scope", "col");
    			add_location(th7, file$3, 99, 40, 4594);
    			attr_dev(th8, "scope", "col");
    			add_location(th8, file$3, 100, 40, 4669);
    			attr_dev(th9, "scope", "col");
    			add_location(th9, file$3, 101, 40, 4739);
    			attr_dev(th10, "scope", "col");
    			add_location(th10, file$3, 102, 40, 4808);
    			attr_dev(th11, "scope", "col");
    			add_location(th11, file$3, 103, 40, 4876);
    			add_location(tr, file$3, 91, 36, 4043);
    			add_location(thead, file$3, 90, 32, 3998);
    			add_location(tbody, file$3, 106, 32, 5024);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$3, 89, 28, 3929);
    			attr_dev(div9, "class", "col");
    			add_location(div9, file$3, 88, 24, 3882);
    			attr_dev(div10, "class", "row no-gutters");
    			add_location(div10, file$3, 87, 20, 3828);
    			attr_dev(div11, "class", "container");
    			set_style(div11, "padding", "0");
    			add_location(div11, file$3, 86, 16, 3765);
    			attr_dev(div12, "class", "col");
    			add_location(div12, file$3, 85, 12, 3730);
    			attr_dev(div13, "class", "row no-gutters");
    			set_style(div13, "margin-top", "14px");
    			add_location(div13, file$3, 84, 8, 3663);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, form);
    			append_dev(form, div6);
    			append_dev(div6, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			append_dev(div6, t2);
    			append_dev(div6, div1);
    			append_dev(div1, input1);
    			append_dev(div1, t3);
    			append_dev(div1, label0);
    			append_dev(div6, t5);
    			append_dev(div6, div2);
    			append_dev(div2, input2);
    			append_dev(div2, t6);
    			append_dev(div2, label1);
    			append_dev(div6, t8);
    			append_dev(div6, div3);
    			append_dev(div3, input3);
    			append_dev(div3, t9);
    			append_dev(div3, label2);
    			append_dev(div6, t11);
    			append_dev(div6, div4);
    			append_dev(div4, input4);
    			append_dev(div4, t12);
    			append_dev(div4, label3);
    			append_dev(div6, t14);
    			append_dev(div6, div5);
    			append_dev(div5, input5);
    			append_dev(div5, t15);
    			append_dev(div5, label4);
    			append_dev(div6, t17);
    			append_dev(div6, button);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t21);
    			append_dev(tr, th1);
    			append_dev(tr, t23);
    			append_dev(tr, th2);
    			append_dev(tr, t25);
    			append_dev(tr, th3);
    			append_dev(tr, t27);
    			append_dev(tr, th4);
    			append_dev(tr, t29);
    			append_dev(tr, th5);
    			append_dev(tr, t31);
    			append_dev(tr, th6);
    			append_dev(tr, t33);
    			append_dev(tr, th7);
    			append_dev(tr, t35);
    			append_dev(tr, th8);
    			append_dev(tr, t37);
    			append_dev(tr, th9);
    			append_dev(tr, t39);
    			append_dev(tr, th10);
    			append_dev(tr, t41);
    			append_dev(tr, th11);
    			append_dev(table, t43);
    			append_dev(table, tbody);
    			if (if_block) if_block.m(tbody, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*settings*/ ctx[0].allbots && /*settings*/ ctx[0].allbots.length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					if_block.m(tbody, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div13);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(41:4) {#if settings.isAdmin}",
    		ctx
    	});

    	return block;
    }

    // (108:36) {#if settings.allbots && settings.allbots.length}
    function create_if_block_3$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*settings*/ ctx[0].allbots;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*revokeKey, settings, resetKey, saveRow*/ 29) {
    				each_value = /*settings*/ ctx[0].allbots;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(108:36) {#if settings.allbots && settings.allbots.length}",
    		ctx
    	});

    	return block;
    }

    // (109:36) {#each settings.allbots as bot}
    function create_each_block$1(ctx) {
    	let tr;
    	let th;
    	let t0_value = /*bot*/ ctx[19].userId + "";
    	let t0;
    	let t1;
    	let input0;
    	let input0_value_value;
    	let t2;
    	let td0;
    	let div0;
    	let input1;
    	let t3;
    	let input2;
    	let t4;
    	let td1;
    	let div1;
    	let input3;
    	let t5;
    	let input4;
    	let t6;
    	let td2;
    	let div2;
    	let input5;
    	let t7;
    	let input6;
    	let t8;
    	let td3;
    	let div3;
    	let input7;
    	let t9;
    	let input8;
    	let t10;
    	let td4;
    	let div4;
    	let input9;
    	let t11;
    	let input10;
    	let t12;
    	let td5;
    	let div5;
    	let input11;
    	let t13;
    	let input12;
    	let t14;
    	let td6;
    	let div6;
    	let input13;
    	let t15;
    	let input14;
    	let t16;
    	let td7;
    	let t17_value = /*bot*/ ctx[19].nobot + "";
    	let t17;
    	let t18;
    	let td8;
    	let button0;
    	let i0;
    	let t19;
    	let td9;
    	let button1;
    	let i1;
    	let t20;
    	let td10;
    	let button2;
    	let i2;
    	let t21;
    	let mounted;
    	let dispose;

    	function input2_change_handler() {
    		/*input2_change_handler*/ ctx[7].call(input2, /*each_value*/ ctx[20], /*bot_index*/ ctx[21]);
    	}

    	function input4_change_handler() {
    		/*input4_change_handler*/ ctx[8].call(input4, /*each_value*/ ctx[20], /*bot_index*/ ctx[21]);
    	}

    	function input6_change_handler() {
    		/*input6_change_handler*/ ctx[9].call(input6, /*each_value*/ ctx[20], /*bot_index*/ ctx[21]);
    	}

    	function input8_change_handler() {
    		/*input8_change_handler*/ ctx[10].call(input8, /*each_value*/ ctx[20], /*bot_index*/ ctx[21]);
    	}

    	function input10_change_handler() {
    		/*input10_change_handler*/ ctx[11].call(input10, /*each_value*/ ctx[20], /*bot_index*/ ctx[21]);
    	}

    	function input12_change_handler() {
    		/*input12_change_handler*/ ctx[12].call(input12, /*each_value*/ ctx[20], /*bot_index*/ ctx[21]);
    	}

    	function input14_change_handler() {
    		/*input14_change_handler*/ ctx[13].call(input14, /*each_value*/ ctx[20], /*bot_index*/ ctx[21]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*bot*/ ctx[19]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[15](/*bot*/ ctx[19]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[16](/*bot*/ ctx[19]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			td0 = element("td");
    			div0 = element("div");
    			input1 = element("input");
    			t3 = space();
    			input2 = element("input");
    			t4 = space();
    			td1 = element("td");
    			div1 = element("div");
    			input3 = element("input");
    			t5 = space();
    			input4 = element("input");
    			t6 = space();
    			td2 = element("td");
    			div2 = element("div");
    			input5 = element("input");
    			t7 = space();
    			input6 = element("input");
    			t8 = space();
    			td3 = element("td");
    			div3 = element("div");
    			input7 = element("input");
    			t9 = space();
    			input8 = element("input");
    			t10 = space();
    			td4 = element("td");
    			div4 = element("div");
    			input9 = element("input");
    			t11 = space();
    			input10 = element("input");
    			t12 = space();
    			td5 = element("td");
    			div5 = element("div");
    			input11 = element("input");
    			t13 = space();
    			input12 = element("input");
    			t14 = space();
    			td6 = element("td");
    			div6 = element("div");
    			input13 = element("input");
    			t15 = space();
    			input14 = element("input");
    			t16 = space();
    			td7 = element("td");
    			t17 = text(t17_value);
    			t18 = space();
    			td8 = element("td");
    			button0 = element("button");
    			i0 = element("i");
    			t19 = space();
    			td9 = element("td");
    			button1 = element("button");
    			i1 = element("i");
    			t20 = space();
    			td10 = element("td");
    			button2 = element("button");
    			i2 = element("i");
    			t21 = space();
    			attr_dev(input0, "type", "hidden");
    			attr_dev(input0, "name", "name");
    			input0.value = input0_value_value = /*bot*/ ctx[19].userId;
    			add_location(input0, file$3, 112, 44, 5391);
    			attr_dev(th, "scope", "row");
    			add_location(th, file$3, 110, 40, 5271);
    			attr_dev(input1, "type", "hidden");
    			attr_dev(input1, "name", "getProfile");
    			input1.value = "0";
    			add_location(input1, file$3, 116, 48, 5658);
    			attr_dev(input2, "class", "form-check-input");
    			attr_dev(input2, "type", "checkbox");
    			input2.__value = "1";
    			input2.value = input2.__value;
    			attr_dev(input2, "name", "getProfile");
    			set_style(input2, "width", "auto");
    			add_location(input2, file$3, 117, 48, 5759);
    			attr_dev(div0, "class", "form-check");
    			add_location(div0, file$3, 115, 44, 5584);
    			add_location(td0, file$3, 114, 40, 5534);
    			attr_dev(input3, "type", "hidden");
    			attr_dev(input3, "name", "saveFriendCode");
    			input3.value = "0";
    			add_location(input3, file$3, 122, 48, 6149);
    			attr_dev(input4, "class", "form-check-input");
    			attr_dev(input4, "type", "checkbox");
    			input4.__value = "1";
    			input4.value = input4.__value;
    			attr_dev(input4, "name", "saveFriendCode");
    			set_style(input4, "width", "auto");
    			add_location(input4, file$3, 123, 48, 6254);
    			attr_dev(div1, "class", "form-check");
    			add_location(div1, file$3, 121, 44, 6075);
    			add_location(td1, file$3, 120, 40, 6025);
    			attr_dev(input5, "type", "hidden");
    			attr_dev(input5, "name", "saveUsername");
    			input5.value = "0";
    			add_location(input5, file$3, 128, 48, 6652);
    			attr_dev(input6, "class", "form-check-input");
    			attr_dev(input6, "type", "checkbox");
    			input6.__value = "1";
    			input6.value = input6.__value;
    			attr_dev(input6, "name", "saveUsername");
    			set_style(input6, "width", "auto");
    			add_location(input6, file$3, 129, 48, 6755);
    			attr_dev(div2, "class", "form-check");
    			add_location(div2, file$3, 127, 44, 6578);
    			add_location(td2, file$3, 126, 40, 6528);
    			attr_dev(input7, "type", "hidden");
    			attr_dev(input7, "name", "saveDrip");
    			input7.value = "0";
    			add_location(input7, file$3, 134, 48, 7149);
    			attr_dev(input8, "class", "form-check-input");
    			attr_dev(input8, "type", "checkbox");
    			input8.__value = "1";
    			input8.value = input8.__value;
    			attr_dev(input8, "name", "saveDrip");
    			set_style(input8, "width", "auto");
    			add_location(input8, file$3, 135, 48, 7248);
    			attr_dev(div3, "class", "form-check");
    			add_location(div3, file$3, 133, 44, 7075);
    			add_location(td3, file$3, 132, 40, 7025);
    			attr_dev(input9, "type", "hidden");
    			attr_dev(input9, "name", "deleteProfile");
    			input9.value = "0";
    			add_location(input9, file$3, 140, 48, 7634);
    			attr_dev(input10, "class", "form-check-input");
    			attr_dev(input10, "type", "checkbox");
    			input10.__value = "1";
    			input10.value = input10.__value;
    			attr_dev(input10, "name", "deleteProfile");
    			set_style(input10, "width", "auto");
    			add_location(input10, file$3, 141, 48, 7738);
    			attr_dev(div4, "class", "form-check");
    			add_location(div4, file$3, 139, 44, 7560);
    			add_location(td4, file$3, 138, 40, 7510);
    			attr_dev(input11, "type", "hidden");
    			attr_dev(input11, "name", "teamQuery");
    			input11.value = "0";
    			add_location(input11, file$3, 146, 48, 8134);
    			attr_dev(input12, "class", "form-check-input");
    			attr_dev(input12, "type", "checkbox");
    			input12.__value = "1";
    			input12.value = input12.__value;
    			attr_dev(input12, "name", "teamQuery");
    			set_style(input12, "width", "auto");
    			add_location(input12, file$3, 147, 48, 8234);
    			attr_dev(div5, "class", "form-check");
    			add_location(div5, file$3, 145, 44, 8060);
    			add_location(td5, file$3, 144, 40, 8010);
    			attr_dev(input13, "type", "hidden");
    			attr_dev(input13, "name", "teamWebhook");
    			input13.value = "0";
    			add_location(input13, file$3, 152, 48, 8622);
    			attr_dev(input14, "class", "form-check-input");
    			attr_dev(input14, "type", "checkbox");
    			input14.__value = "1";
    			input14.value = input14.__value;
    			attr_dev(input14, "name", "teamWebhook");
    			set_style(input14, "width", "auto");
    			add_location(input14, file$3, 153, 48, 8724);
    			attr_dev(div6, "class", "form-check");
    			add_location(div6, file$3, 151, 44, 8548);
    			add_location(td6, file$3, 150, 40, 8498);
    			add_location(td7, file$3, 156, 40, 8992);
    			attr_dev(i0, "class", "fa fa-cloud-upload");
    			add_location(i0, file$3, 160, 139, 9287);
    			attr_dev(button0, "class", "btn btn-primary");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$3, 160, 44, 9192);
    			add_location(td8, file$3, 159, 40, 9142);
    			attr_dev(i1, "class", "fa fa-refresh");
    			add_location(i1, file$3, 163, 140, 9585);
    			attr_dev(button1, "class", "btn btn-primary");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$3, 163, 44, 9489);
    			attr_dev(td9, "class", "text-center");
    			add_location(td9, file$3, 162, 40, 9419);
    			attr_dev(i2, "class", "fa fa-times");
    			add_location(i2, file$3, 166, 141, 9879);
    			attr_dev(button2, "class", "btn btn-primary");
    			attr_dev(button2, "type", "button");
    			add_location(button2, file$3, 166, 44, 9782);
    			attr_dev(td10, "class", "text-center");
    			add_location(td10, file$3, 165, 40, 9712);
    			add_location(tr, file$3, 109, 36, 5225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(th, t0);
    			append_dev(th, t1);
    			append_dev(th, input0);
    			append_dev(tr, t2);
    			append_dev(tr, td0);
    			append_dev(td0, div0);
    			append_dev(div0, input1);
    			append_dev(div0, t3);
    			append_dev(div0, input2);
    			input2.checked = /*bot*/ ctx[19].getProfile;
    			append_dev(tr, t4);
    			append_dev(tr, td1);
    			append_dev(td1, div1);
    			append_dev(div1, input3);
    			append_dev(div1, t5);
    			append_dev(div1, input4);
    			input4.checked = /*bot*/ ctx[19].saveFriendCode;
    			append_dev(tr, t6);
    			append_dev(tr, td2);
    			append_dev(td2, div2);
    			append_dev(div2, input5);
    			append_dev(div2, t7);
    			append_dev(div2, input6);
    			input6.checked = /*bot*/ ctx[19].saveUsername;
    			append_dev(tr, t8);
    			append_dev(tr, td3);
    			append_dev(td3, div3);
    			append_dev(div3, input7);
    			append_dev(div3, t9);
    			append_dev(div3, input8);
    			input8.checked = /*bot*/ ctx[19].saveDrip;
    			append_dev(tr, t10);
    			append_dev(tr, td4);
    			append_dev(td4, div4);
    			append_dev(div4, input9);
    			append_dev(div4, t11);
    			append_dev(div4, input10);
    			input10.checked = /*bot*/ ctx[19].deleteProfile;
    			append_dev(tr, t12);
    			append_dev(tr, td5);
    			append_dev(td5, div5);
    			append_dev(div5, input11);
    			append_dev(div5, t13);
    			append_dev(div5, input12);
    			input12.checked = /*bot*/ ctx[19].teamQuery;
    			append_dev(tr, t14);
    			append_dev(tr, td6);
    			append_dev(td6, div6);
    			append_dev(div6, input13);
    			append_dev(div6, t15);
    			append_dev(div6, input14);
    			input14.checked = /*bot*/ ctx[19].teamWebhook;
    			append_dev(tr, t16);
    			append_dev(tr, td7);
    			append_dev(td7, t17);
    			append_dev(tr, t18);
    			append_dev(tr, td8);
    			append_dev(td8, button0);
    			append_dev(button0, i0);
    			append_dev(tr, t19);
    			append_dev(tr, td9);
    			append_dev(td9, button1);
    			append_dev(button1, i1);
    			append_dev(tr, t20);
    			append_dev(tr, td10);
    			append_dev(td10, button2);
    			append_dev(button2, i2);
    			append_dev(tr, t21);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input2, "change", input2_change_handler),
    					listen_dev(input4, "change", input4_change_handler),
    					listen_dev(input6, "change", input6_change_handler),
    					listen_dev(input8, "change", input8_change_handler),
    					listen_dev(input10, "change", input10_change_handler),
    					listen_dev(input12, "change", input12_change_handler),
    					listen_dev(input14, "change", input14_change_handler),
    					listen_dev(button0, "click", click_handler, false, false, false),
    					listen_dev(button1, "click", click_handler_1, false, false, false),
    					listen_dev(button2, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*settings*/ 1 && t0_value !== (t0_value = /*bot*/ ctx[19].userId + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*settings*/ 1 && input0_value_value !== (input0_value_value = /*bot*/ ctx[19].userId)) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*settings*/ 1) {
    				input2.checked = /*bot*/ ctx[19].getProfile;
    			}

    			if (dirty & /*settings*/ 1) {
    				input4.checked = /*bot*/ ctx[19].saveFriendCode;
    			}

    			if (dirty & /*settings*/ 1) {
    				input6.checked = /*bot*/ ctx[19].saveUsername;
    			}

    			if (dirty & /*settings*/ 1) {
    				input8.checked = /*bot*/ ctx[19].saveDrip;
    			}

    			if (dirty & /*settings*/ 1) {
    				input10.checked = /*bot*/ ctx[19].deleteProfile;
    			}

    			if (dirty & /*settings*/ 1) {
    				input12.checked = /*bot*/ ctx[19].teamQuery;
    			}

    			if (dirty & /*settings*/ 1) {
    				input14.checked = /*bot*/ ctx[19].teamWebhook;
    			}

    			if (dirty & /*settings*/ 1 && t17_value !== (t17_value = /*bot*/ ctx[19].nobot + "")) set_data_dev(t17, t17_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(109:36) {#each settings.allbots as bot}",
    		ctx
    	});

    	return block;
    }

    // (180:4) {#if settings.botKey}
    function create_if_block$3(ctx) {
    	let div3;
    	let div1;
    	let form0;
    	let label;
    	let t1;
    	let div0;
    	let input;
    	let input_value_value;
    	let t2;
    	let span;
    	let button0;
    	let i0;
    	let t3;
    	let div2;
    	let form1;
    	let button1;
    	let i1;
    	let t4;
    	let if_block_anchor;
    	let if_block = /*settings*/ ctx[0].teamWebhookAllowed && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			form0 = element("form");
    			label = element("label");
    			label.textContent = "Your Bot Key";
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			span = element("span");
    			button0 = element("button");
    			i0 = element("i");
    			t3 = space();
    			div2 = element("div");
    			form1 = element("form");
    			button1 = element("button");
    			i1 = element("i");
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(label, "for", "copy-input");
    			add_location(label, file$3, 183, 20, 10466);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control");
    			input.value = input_value_value = /*settings*/ ctx[0].botKey;
    			attr_dev(input, "id", "copy-input");
    			input.readOnly = true;
    			add_location(input, file$3, 185, 26, 10613);
    			attr_dev(i0, "class", "fa fa-copy");
    			add_location(i0, file$3, 191, 34, 11080);
    			attr_dev(button0, "class", "btn btn-default");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "id", "copy-button");
    			attr_dev(button0, "data-toggle", "tooltip");
    			attr_dev(button0, "data-placement", "button");
    			attr_dev(button0, "title", "Copy to Clipboard");
    			add_location(button0, file$3, 188, 28, 10843);
    			attr_dev(span, "class", "input-group-btn");
    			add_location(span, file$3, 187, 26, 10783);
    			attr_dev(div0, "class", "input-group");
    			attr_dev(div0, "onclick", "copyToClipboard()");
    			add_location(div0, file$3, 184, 20, 10532);
    			add_location(form0, file$3, 182, 16, 10438);
    			attr_dev(div1, "class", "col-11");
    			add_location(div1, file$3, 181, 12, 10400);
    			attr_dev(i1, "class", "fa fa-refresh");
    			add_location(i1, file$3, 199, 104, 11458);
    			attr_dev(button1, "class", "btn btn-primary");
    			attr_dev(button1, "type", "submit");
    			set_style(button1, "bottom", "4px");
    			set_style(button1, "position", "absolute");
    			add_location(button1, file$3, 199, 20, 11374);
    			attr_dev(form1, "action", "/settings/resetkey");
    			attr_dev(form1, "method", "post");
    			add_location(form1, file$3, 198, 16, 11304);
    			attr_dev(div2, "class", "col-1");
    			add_location(div2, file$3, 197, 12, 11267);
    			attr_dev(div3, "class", "row");
    			set_style(div3, "margin-top", "14px");
    			add_location(div3, file$3, 180, 8, 10344);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, form0);
    			append_dev(form0, label);
    			append_dev(form0, t1);
    			append_dev(form0, div0);
    			append_dev(div0, input);
    			/*input_binding*/ ctx[17](input);
    			append_dev(div0, t2);
    			append_dev(div0, span);
    			append_dev(span, button0);
    			append_dev(button0, i0);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, form1);
    			append_dev(form1, button1);
    			append_dev(button1, i1);
    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1 && input_value_value !== (input_value_value = /*settings*/ ctx[0].botKey) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (/*settings*/ ctx[0].teamWebhookAllowed) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*input_binding*/ ctx[17](null);
    			if (detaching) detach_dev(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(180:4) {#if settings.botKey}",
    		ctx
    	});

    	return block;
    }

    // (204:8) {#if settings.teamWebhookAllowed}
    function create_if_block_1$2(ctx) {
    	let form;
    	let div1;
    	let div0;
    	let label;
    	let t1;
    	let input;
    	let input_value_value;
    	let t2;
    	let div3;
    	let div2;
    	let button;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div1 = element("div");
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Team Webhook";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button = element("button");
    			button.textContent = "Save Webhook";
    			attr_dev(label, "for", "copy-input");
    			add_location(label, file$3, 207, 28, 11821);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "name", "webhook");
    			input.value = input_value_value = /*settings*/ ctx[0].teamWebhookUrl;
    			attr_dev(input, "id", "webhook");
    			attr_dev(input, "placeholder", "Your webhook URL");
    			add_location(input, file$3, 208, 28, 11895);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$3, 206, 24, 11774);
    			attr_dev(div1, "class", "row");
    			set_style(div1, "margin-top", "14px");
    			add_location(div1, file$3, 205, 16, 11706);
    			attr_dev(button, "class", "btn btn-primary");
    			attr_dev(button, "type", "submit");
    			set_style(button, "float", "right");
    			add_location(button, file$3, 213, 24, 12209);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$3, 212, 20, 12166);
    			attr_dev(div3, "class", "row");
    			set_style(div3, "margin-top", "14px");
    			add_location(div3, file$3, 211, 16, 12102);
    			attr_dev(form, "action", "/api/settings/saveteamwebhook");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "id", "save-form");
    			add_location(form, file$3, 204, 12, 11614);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(div0, t1);
    			append_dev(div0, input);
    			append_dev(form, t2);
    			append_dev(form, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*settings*/ 1 && input_value_value !== (input_value_value = /*settings*/ ctx[0].teamWebhookUrl) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(204:8) {#if settings.teamWebhookAllowed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let t;
    	let if_block0 = /*settings*/ ctx[0].isAdmin && create_if_block_2$1(ctx);
    	let if_block1 = /*settings*/ ctx[0].botKey && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "container");
    			add_location(div, file$3, 39, 0, 1020);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*settings*/ ctx[0].isAdmin) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*settings*/ ctx[0].botKey) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	let { userdata = {} } = $$props;
    	let { location = "" } = $$props;
    	let settings = {}, copyInput;

    	onMount(async () => {
    		$$invalidate(0, settings = await getSettings());
    	});

    	function copyToClipboard() {
    		console.log("going");
    		copyInput.focus();
    		copyInput.select();
    		document.execCommand("copy");
    	}

    	async function saveRow(id) {
    		const botConfig = settings.allbots.filter(t => t.userId === id)[0];
    		await saveBotKeyConfig(botConfig);
    		window.location.href = window.location.href;
    	}

    	async function resetKey(id) {
    		await resetKeyConfig(id);
    		window.location.href = window.location.href;
    	}

    	async function revokeKey(id) {
    		await revokeKeyConfig(id);
    		window.location.href = window.location.href;
    	}

    	const writable_props = ['userdata', 'location'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	function input2_change_handler(each_value, bot_index) {
    		each_value[bot_index].getProfile = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input4_change_handler(each_value, bot_index) {
    		each_value[bot_index].saveFriendCode = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input6_change_handler(each_value, bot_index) {
    		each_value[bot_index].saveUsername = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input8_change_handler(each_value, bot_index) {
    		each_value[bot_index].saveDrip = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input10_change_handler(each_value, bot_index) {
    		each_value[bot_index].deleteProfile = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input12_change_handler(each_value, bot_index) {
    		each_value[bot_index].teamQuery = this.checked;
    		$$invalidate(0, settings);
    	}

    	function input14_change_handler(each_value, bot_index) {
    		each_value[bot_index].teamWebhook = this.checked;
    		$$invalidate(0, settings);
    	}

    	const click_handler = async bot => await saveRow(bot.userId);
    	const click_handler_1 = async bot => await resetKey(bot.userId);
    	const click_handler_2 = async bot => await revokeKey(bot.userId);

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			copyInput = $$value;
    			$$invalidate(1, copyInput);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('userdata' in $$props) $$invalidate(5, userdata = $$props.userdata);
    		if ('location' in $$props) $$invalidate(6, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getSettings,
    		saveBotKeyConfig,
    		resetKeyConfig,
    		revokeKeyConfig,
    		userdata,
    		location,
    		settings,
    		copyInput,
    		copyToClipboard,
    		saveRow,
    		resetKey,
    		revokeKey
    	});

    	$$self.$inject_state = $$props => {
    		if ('userdata' in $$props) $$invalidate(5, userdata = $$props.userdata);
    		if ('location' in $$props) $$invalidate(6, location = $$props.location);
    		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
    		if ('copyInput' in $$props) $$invalidate(1, copyInput = $$props.copyInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		settings,
    		copyInput,
    		saveRow,
    		resetKey,
    		revokeKey,
    		userdata,
    		location,
    		input2_change_handler,
    		input4_change_handler,
    		input6_change_handler,
    		input8_change_handler,
    		input10_change_handler,
    		input12_change_handler,
    		input14_change_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input_binding
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { userdata: 5, location: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get userdata() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userdata(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const getDrip = async () => (await fetch("/api/drip")).json();
    // TODO: move other form post methods here

    /* src\pages\Drip.svelte generated by Svelte v3.46.3 */
    const file$2 = "src\\pages\\Drip.svelte";

    // (130:12) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/css/img/nodrip.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "no drip");
    			add_location(img, file$2, 131, 20, 4583);
    			attr_dev(div, "class", "drip-img");
    			add_location(div, file$2, 130, 16, 4539);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(130:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (115:12) {#if dripdata.drip}
    function create_if_block_1$1(ctx) {
    	let div0;
    	let h3;
    	let a;
    	let i0;
    	let t0;
    	let t1;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let form;
    	let button;
    	let i1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h3 = element("h3");
    			a = element("a");
    			i0 = element("i");
    			t0 = text("\r\n                        Your drip");
    			t1 = space();
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			form = element("form");
    			button = element("button");
    			i1 = element("i");
    			attr_dev(i0, "class", "fa fa-chevron-left");
    			add_location(i0, file$2, 117, 36, 3963);
    			attr_dev(a, "href", "/");
    			add_location(a, file$2, 117, 24, 3951);
    			add_location(h3, file$2, 116, 20, 3921);
    			add_location(div0, file$2, 115, 16, 3894);
    			if (!src_url_equal(img.src, img_src_value = /*dripdata*/ ctx[0].drip)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "drip");
    			add_location(img, file$2, 122, 20, 4149);
    			attr_dev(i1, "class", "fa fa-close");
    			add_location(i1, file$2, 125, 28, 4385);
    			attr_dev(button, "type", "submit");
    			button.value = "submit";
    			add_location(button, file$2, 124, 24, 4318);
    			attr_dev(form, "action", "/api/drip/delete");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "class", "delete-drip");
    			add_location(form, file$2, 123, 20, 4226);
    			attr_dev(div1, "class", "drip-img");
    			add_location(div1, file$2, 121, 16, 4105);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h3);
    			append_dev(h3, a);
    			append_dev(a, i0);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, form);
    			append_dev(form, button);
    			append_dev(button, i1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dripdata*/ 1 && !src_url_equal(img.src, img_src_value = /*dripdata*/ ctx[0].drip)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(115:12) {#if dripdata.drip}",
    		ctx
    	});

    	return block;
    }

    // (154:12) {:else}
    function create_else_block$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "id", "image-input");
    			attr_dev(input, "name", "drip");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "class", "btn btn-primary");
    			attr_dev(input, "accept", ".jpg,.png,image/jpeg,image/png");
    			set_style(input, "width", "100%");
    			add_location(input, file$2, 154, 16, 5619);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", loadFile, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(154:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (151:12) {#if dripdata.blockupload}
    function create_if_block$2(ctx) {
    	let h2;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Upload limit reached";
    			t1 = space();
    			div = element("div");
    			div.textContent = "Each user is allowed 3 uploads per week. The limit has been reached.";
    			add_location(h2, file$2, 151, 16, 5454);
    			add_location(div, file$2, 152, 16, 5501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(151:12) {#if dripdata.blockupload}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div7;
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let h3;
    	let a;
    	let i;
    	let t1;
    	let t2;
    	let button;
    	let t4;
    	let div2;
    	let img;
    	let t5;
    	let div6;
    	let div5;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dripdata*/ ctx[0].drip) return create_if_block_1$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*dripdata*/ ctx[0].blockupload) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			a = element("a");
    			i = element("i");
    			t1 = text("\r\n                    New drip");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Save Changes";
    			t4 = space();
    			div2 = element("div");
    			img = element("img");
    			t5 = space();
    			div6 = element("div");
    			div5 = element("div");
    			if_block1.c();
    			attr_dev(div0, "class", "col-12 col-md-6 offset-md-3");
    			attr_dev(div0, "id", "original-drip");
    			add_location(div0, file$2, 113, 8, 3783);
    			attr_dev(i, "class", "fa fa-chevron-left");
    			add_location(i, file$2, 138, 32, 4868);
    			attr_dev(a, "href", "/");
    			add_location(a, file$2, 138, 20, 4856);
    			add_location(h3, file$2, 137, 16, 4830);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			attr_dev(button, "id", "upload-new-image");
    			set_style(button, "display", "none");
    			set_style(button, "position", "absolute");
    			set_style(button, "top", "5px");
    			set_style(button, "right", "15px");
    			add_location(button, file$2, 141, 16, 4977);
    			add_location(div1, file$2, 136, 12, 4807);
    			attr_dev(img, "id", "preview");
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "drip");
    			add_location(img, file$2, 144, 16, 5226);
    			attr_dev(div2, "class", "drip-img");
    			add_location(div2, file$2, 143, 12, 5186);
    			attr_dev(div3, "class", "col-12 col-md-6 offset-md-3");
    			attr_dev(div3, "id", "new-drip");
    			set_style(div3, "display", "none");
    			add_location(div3, file$2, 135, 8, 4716);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$2, 112, 4, 3756);
    			attr_dev(div5, "class", "col-12 col-md-6 offset-md-3");
    			add_location(div5, file$2, 149, 8, 5355);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$2, 148, 4, 5328);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$2, 111, 0, 3727);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div4);
    			append_dev(div4, div0);
    			if_block0.m(div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, h3);
    			append_dev(h3, a);
    			append_dev(a, i);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			append_dev(div1, button);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div7, t5);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			if_block1.m(div5, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", uploadNewImage, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div5, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			if_block0.d();
    			if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function loadFile(e) {
    	if (e.target.files) {
    		jQuery("#original-drip").hide();
    		jQuery("#new-drip").show();
    		jQuery("#upload-new-image").show();
    		let imageFile = e.target.files[0];
    		var reader = new FileReader();

    		reader.onload = function (e) {
    			var img = document.createElement("img");

    			img.onload = function (event) {
    				var MAX_WIDTH = 512;
    				var MAX_HEIGHT = 512;
    				var width = img.width;
    				var height = img.height;

    				// Change the resizing logic
    				if (width > height) {
    					if (width > MAX_WIDTH) {
    						height = height * (MAX_WIDTH / width);
    						width = MAX_WIDTH;
    					}
    				} else {
    					if (height > MAX_HEIGHT) {
    						width = width * (MAX_HEIGHT / height);
    						height = MAX_HEIGHT;
    					}
    				}

    				var canvas = document.createElement("canvas");
    				canvas.width = width;
    				canvas.height = height;
    				var ctx = canvas.getContext("2d");
    				ctx.drawImage(img, 0, 0, width, height);

    				// Show resized image in preview element
    				var dataurl = canvas.toDataURL(imageFile.type);

    				document.getElementById("preview").src = dataurl;
    			};

    			img.src = e.target.result;
    		};

    		reader.readAsDataURL(imageFile);
    	}
    }

    async function uploadNewImage() {
    	var resizedImage = dataURLToBlob(document.getElementById("preview").src);
    	var data = new FormData();
    	data.append('drip', resizedImage);
    	jQuery("#upload-new-image").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Loading...');

    	jQuery.ajax({
    		url: "/api/drip/save",
    		data,
    		cache: false,
    		contentType: false,
    		processData: false,
    		type: 'POST',
    		success() {
    			window.location.reload();
    		},
    		error() {
    			alert("Upload failed");
    			window.location.reload();
    		}
    	});
    }

    /* Utility function to convert a canvas to a BLOB */
    function dataURLToBlob(dataURL) {
    	var BASE64_MARKER = ';base64,';

    	if (dataURL.indexOf(BASE64_MARKER) == -1) {
    		var parts = dataURL.split(',');
    		var contentType = parts[0].split(':')[1];
    		var raw = parts[1];
    		return new Blob([raw], { type: contentType });
    	}

    	var parts = dataURL.split(BASE64_MARKER);
    	var contentType = parts[0].split(':')[1];
    	var raw = window.atob(parts[1]);
    	var rawLength = raw.length;
    	var uInt8Array = new Uint8Array(rawLength);

    	for (var i = 0; i < rawLength; ++i) {
    		uInt8Array[i] = raw.charCodeAt(i);
    	}

    	return new Blob([uInt8Array], { type: contentType });
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Drip', slots, []);
    	let { userdata = {} } = $$props;
    	let { location = "" } = $$props;
    	let dripdata = {};

    	onMount(async () => {
    		$$invalidate(0, dripdata = await getDrip());
    	});

    	const writable_props = ['userdata', 'location'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Drip> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('userdata' in $$props) $$invalidate(1, userdata = $$props.userdata);
    		if ('location' in $$props) $$invalidate(2, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getDrip,
    		userdata,
    		location,
    		dripdata,
    		loadFile,
    		uploadNewImage,
    		dataURLToBlob
    	});

    	$$self.$inject_state = $$props => {
    		if ('userdata' in $$props) $$invalidate(1, userdata = $$props.userdata);
    		if ('location' in $$props) $$invalidate(2, location = $$props.location);
    		if ('dripdata' in $$props) $$invalidate(0, dripdata = $$props.dripdata);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dripdata, userdata, location];
    }

    class Drip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { userdata: 1, location: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drip",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get userdata() {
    		throw new Error("<Drip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userdata(value) {
    		throw new Error("<Drip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<Drip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Drip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const searchTemplates = async (searchTerm) => {
        let url = new URL(window.location.origin + "/api/templates/all");

        url.search = new URLSearchParams({ q: searchTerm });

        return (await fetch(url)).json();
    };

    const deleteTemplate = async (slot) => {
        await fetch("/api/templates/delete", {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ slot })
        });
    };

    /**
     * Fuse.js v6.5.3 - Lightweight fuzzy-search (http://fusejs.io)
     *
     * Copyright (c) 2021 Kiro Risk (http://kiro.me)
     * All Rights Reserved. Apache Software License 2.0
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     */

    function isArray(value) {
      return !Array.isArray
        ? getTag(value) === '[object Array]'
        : Array.isArray(value)
    }

    // Adapted from: https://github.com/lodash/lodash/blob/master/.internal/baseToString.js
    const INFINITY = 1 / 0;
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value
      }
      let result = value + '';
      return result == '0' && 1 / value == -INFINITY ? '-0' : result
    }

    function toString(value) {
      return value == null ? '' : baseToString(value)
    }

    function isString(value) {
      return typeof value === 'string'
    }

    function isNumber(value) {
      return typeof value === 'number'
    }

    // Adapted from: https://github.com/lodash/lodash/blob/master/isBoolean.js
    function isBoolean(value) {
      return (
        value === true ||
        value === false ||
        (isObjectLike(value) && getTag(value) == '[object Boolean]')
      )
    }

    function isObject(value) {
      return typeof value === 'object'
    }

    // Checks if `value` is object-like.
    function isObjectLike(value) {
      return isObject(value) && value !== null
    }

    function isDefined(value) {
      return value !== undefined && value !== null
    }

    function isBlank(value) {
      return !value.trim().length
    }

    // Gets the `toStringTag` of `value`.
    // Adapted from: https://github.com/lodash/lodash/blob/master/.internal/getTag.js
    function getTag(value) {
      return value == null
        ? value === undefined
          ? '[object Undefined]'
          : '[object Null]'
        : Object.prototype.toString.call(value)
    }

    const EXTENDED_SEARCH_UNAVAILABLE = 'Extended search is not available';

    const INCORRECT_INDEX_TYPE = "Incorrect 'index' type";

    const LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY = (key) =>
      `Invalid value for key ${key}`;

    const PATTERN_LENGTH_TOO_LARGE = (max) =>
      `Pattern length exceeds max of ${max}.`;

    const MISSING_KEY_PROPERTY = (name) => `Missing ${name} property in key`;

    const INVALID_KEY_WEIGHT_VALUE = (key) =>
      `Property 'weight' in key '${key}' must be a positive integer`;

    const hasOwn = Object.prototype.hasOwnProperty;

    class KeyStore {
      constructor(keys) {
        this._keys = [];
        this._keyMap = {};

        let totalWeight = 0;

        keys.forEach((key) => {
          let obj = createKey(key);

          totalWeight += obj.weight;

          this._keys.push(obj);
          this._keyMap[obj.id] = obj;

          totalWeight += obj.weight;
        });

        // Normalize weights so that their sum is equal to 1
        this._keys.forEach((key) => {
          key.weight /= totalWeight;
        });
      }
      get(keyId) {
        return this._keyMap[keyId]
      }
      keys() {
        return this._keys
      }
      toJSON() {
        return JSON.stringify(this._keys)
      }
    }

    function createKey(key) {
      let path = null;
      let id = null;
      let src = null;
      let weight = 1;

      if (isString(key) || isArray(key)) {
        src = key;
        path = createKeyPath(key);
        id = createKeyId(key);
      } else {
        if (!hasOwn.call(key, 'name')) {
          throw new Error(MISSING_KEY_PROPERTY('name'))
        }

        const name = key.name;
        src = name;

        if (hasOwn.call(key, 'weight')) {
          weight = key.weight;

          if (weight <= 0) {
            throw new Error(INVALID_KEY_WEIGHT_VALUE(name))
          }
        }

        path = createKeyPath(name);
        id = createKeyId(name);
      }

      return { path, id, weight, src }
    }

    function createKeyPath(key) {
      return isArray(key) ? key : key.split('.')
    }

    function createKeyId(key) {
      return isArray(key) ? key.join('.') : key
    }

    function get(obj, path) {
      let list = [];
      let arr = false;

      const deepGet = (obj, path, index) => {
        if (!isDefined(obj)) {
          return
        }
        if (!path[index]) {
          // If there's no path left, we've arrived at the object we care about.
          list.push(obj);
        } else {
          let key = path[index];

          const value = obj[key];

          if (!isDefined(value)) {
            return
          }

          // If we're at the last value in the path, and if it's a string/number/bool,
          // add it to the list
          if (
            index === path.length - 1 &&
            (isString(value) || isNumber(value) || isBoolean(value))
          ) {
            list.push(toString(value));
          } else if (isArray(value)) {
            arr = true;
            // Search each item in the array.
            for (let i = 0, len = value.length; i < len; i += 1) {
              deepGet(value[i], path, index + 1);
            }
          } else if (path.length) {
            // An object. Recurse further.
            deepGet(value, path, index + 1);
          }
        }
      };

      // Backwards compatibility (since path used to be a string)
      deepGet(obj, isString(path) ? path.split('.') : path, 0);

      return arr ? list : list[0]
    }

    const MatchOptions = {
      // Whether the matches should be included in the result set. When `true`, each record in the result
      // set will include the indices of the matched characters.
      // These can consequently be used for highlighting purposes.
      includeMatches: false,
      // When `true`, the matching function will continue to the end of a search pattern even if
      // a perfect match has already been located in the string.
      findAllMatches: false,
      // Minimum number of characters that must be matched before a result is considered a match
      minMatchCharLength: 1
    };

    const BasicOptions = {
      // When `true`, the algorithm continues searching to the end of the input even if a perfect
      // match is found before the end of the same input.
      isCaseSensitive: false,
      // When true, the matching function will continue to the end of a search pattern even if
      includeScore: false,
      // List of properties that will be searched. This also supports nested properties.
      keys: [],
      // Whether to sort the result list, by score
      shouldSort: true,
      // Default sort function: sort by ascending score, ascending index
      sortFn: (a, b) =>
        a.score === b.score ? (a.idx < b.idx ? -1 : 1) : a.score < b.score ? -1 : 1
    };

    const FuzzyOptions = {
      // Approximately where in the text is the pattern expected to be found?
      location: 0,
      // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match
      // (of both letters and location), a threshold of '1.0' would match anything.
      threshold: 0.6,
      // Determines how close the match must be to the fuzzy location (specified above).
      // An exact letter match which is 'distance' characters away from the fuzzy location
      // would score as a complete mismatch. A distance of '0' requires the match be at
      // the exact location specified, a threshold of '1000' would require a perfect match
      // to be within 800 characters of the fuzzy location to be found using a 0.8 threshold.
      distance: 100
    };

    const AdvancedOptions = {
      // When `true`, it enables the use of unix-like search commands
      useExtendedSearch: false,
      // The get function to use when fetching an object's properties.
      // The default will search nested paths *ie foo.bar.baz*
      getFn: get,
      // When `true`, search will ignore `location` and `distance`, so it won't matter
      // where in the string the pattern appears.
      // More info: https://fusejs.io/concepts/scoring-theory.html#fuzziness-score
      ignoreLocation: false,
      // When `true`, the calculation for the relevance score (used for sorting) will
      // ignore the field-length norm.
      // More info: https://fusejs.io/concepts/scoring-theory.html#field-length-norm
      ignoreFieldNorm: false,
      // The weight to determine how much field length norm effects scoring.
      fieldNormWeight: 1
    };

    var Config = {
      ...BasicOptions,
      ...MatchOptions,
      ...FuzzyOptions,
      ...AdvancedOptions
    };

    const SPACE = /[^ ]+/g;

    // Field-length norm: the shorter the field, the higher the weight.
    // Set to 3 decimals to reduce index size.
    function norm(weight = 1, mantissa = 3) {
      const cache = new Map();
      const m = Math.pow(10, mantissa);

      return {
        get(value) {
          const numTokens = value.match(SPACE).length;

          if (cache.has(numTokens)) {
            return cache.get(numTokens)
          }

          // Default function is 1/sqrt(x), weight makes that variable
          const norm = 1 / Math.pow(numTokens, 0.5 * weight);

          // In place of `toFixed(mantissa)`, for faster computation
          const n = parseFloat(Math.round(norm * m) / m);

          cache.set(numTokens, n);

          return n
        },
        clear() {
          cache.clear();
        }
      }
    }

    class FuseIndex {
      constructor({
        getFn = Config.getFn,
        fieldNormWeight = Config.fieldNormWeight
      } = {}) {
        this.norm = norm(fieldNormWeight, 3);
        this.getFn = getFn;
        this.isCreated = false;

        this.setIndexRecords();
      }
      setSources(docs = []) {
        this.docs = docs;
      }
      setIndexRecords(records = []) {
        this.records = records;
      }
      setKeys(keys = []) {
        this.keys = keys;
        this._keysMap = {};
        keys.forEach((key, idx) => {
          this._keysMap[key.id] = idx;
        });
      }
      create() {
        if (this.isCreated || !this.docs.length) {
          return
        }

        this.isCreated = true;

        // List is Array<String>
        if (isString(this.docs[0])) {
          this.docs.forEach((doc, docIndex) => {
            this._addString(doc, docIndex);
          });
        } else {
          // List is Array<Object>
          this.docs.forEach((doc, docIndex) => {
            this._addObject(doc, docIndex);
          });
        }

        this.norm.clear();
      }
      // Adds a doc to the end of the index
      add(doc) {
        const idx = this.size();

        if (isString(doc)) {
          this._addString(doc, idx);
        } else {
          this._addObject(doc, idx);
        }
      }
      // Removes the doc at the specified index of the index
      removeAt(idx) {
        this.records.splice(idx, 1);

        // Change ref index of every subsquent doc
        for (let i = idx, len = this.size(); i < len; i += 1) {
          this.records[i].i -= 1;
        }
      }
      getValueForItemAtKeyId(item, keyId) {
        return item[this._keysMap[keyId]]
      }
      size() {
        return this.records.length
      }
      _addString(doc, docIndex) {
        if (!isDefined(doc) || isBlank(doc)) {
          return
        }

        let record = {
          v: doc,
          i: docIndex,
          n: this.norm.get(doc)
        };

        this.records.push(record);
      }
      _addObject(doc, docIndex) {
        let record = { i: docIndex, $: {} };

        // Iterate over every key (i.e, path), and fetch the value at that key
        this.keys.forEach((key, keyIndex) => {
          // console.log(key)
          let value = this.getFn(doc, key.path);

          if (!isDefined(value)) {
            return
          }

          if (isArray(value)) {
            let subRecords = [];
            const stack = [{ nestedArrIndex: -1, value }];

            while (stack.length) {
              const { nestedArrIndex, value } = stack.pop();

              if (!isDefined(value)) {
                continue
              }

              if (isString(value) && !isBlank(value)) {
                let subRecord = {
                  v: value,
                  i: nestedArrIndex,
                  n: this.norm.get(value)
                };

                subRecords.push(subRecord);
              } else if (isArray(value)) {
                value.forEach((item, k) => {
                  stack.push({
                    nestedArrIndex: k,
                    value: item
                  });
                });
              } else ;
            }
            record.$[keyIndex] = subRecords;
          } else if (!isBlank(value)) {
            let subRecord = {
              v: value,
              n: this.norm.get(value)
            };

            record.$[keyIndex] = subRecord;
          }
        });

        this.records.push(record);
      }
      toJSON() {
        return {
          keys: this.keys,
          records: this.records
        }
      }
    }

    function createIndex(
      keys,
      docs,
      { getFn = Config.getFn, fieldNormWeight = Config.fieldNormWeight } = {}
    ) {
      const myIndex = new FuseIndex({ getFn, fieldNormWeight });
      myIndex.setKeys(keys.map(createKey));
      myIndex.setSources(docs);
      myIndex.create();
      return myIndex
    }

    function parseIndex(
      data,
      { getFn = Config.getFn, fieldNormWeight = Config.fieldNormWeight } = {}
    ) {
      const { keys, records } = data;
      const myIndex = new FuseIndex({ getFn, fieldNormWeight });
      myIndex.setKeys(keys);
      myIndex.setIndexRecords(records);
      return myIndex
    }

    function computeScore$1(
      pattern,
      {
        errors = 0,
        currentLocation = 0,
        expectedLocation = 0,
        distance = Config.distance,
        ignoreLocation = Config.ignoreLocation
      } = {}
    ) {
      const accuracy = errors / pattern.length;

      if (ignoreLocation) {
        return accuracy
      }

      const proximity = Math.abs(expectedLocation - currentLocation);

      if (!distance) {
        // Dodge divide by zero error.
        return proximity ? 1.0 : accuracy
      }

      return accuracy + proximity / distance
    }

    function convertMaskToIndices(
      matchmask = [],
      minMatchCharLength = Config.minMatchCharLength
    ) {
      let indices = [];
      let start = -1;
      let end = -1;
      let i = 0;

      for (let len = matchmask.length; i < len; i += 1) {
        let match = matchmask[i];
        if (match && start === -1) {
          start = i;
        } else if (!match && start !== -1) {
          end = i - 1;
          if (end - start + 1 >= minMatchCharLength) {
            indices.push([start, end]);
          }
          start = -1;
        }
      }

      // (i-1 - start) + 1 => i - start
      if (matchmask[i - 1] && i - start >= minMatchCharLength) {
        indices.push([start, i - 1]);
      }

      return indices
    }

    // Machine word size
    const MAX_BITS = 32;

    function search(
      text,
      pattern,
      patternAlphabet,
      {
        location = Config.location,
        distance = Config.distance,
        threshold = Config.threshold,
        findAllMatches = Config.findAllMatches,
        minMatchCharLength = Config.minMatchCharLength,
        includeMatches = Config.includeMatches,
        ignoreLocation = Config.ignoreLocation
      } = {}
    ) {
      if (pattern.length > MAX_BITS) {
        throw new Error(PATTERN_LENGTH_TOO_LARGE(MAX_BITS))
      }

      const patternLen = pattern.length;
      // Set starting location at beginning text and initialize the alphabet.
      const textLen = text.length;
      // Handle the case when location > text.length
      const expectedLocation = Math.max(0, Math.min(location, textLen));
      // Highest score beyond which we give up.
      let currentThreshold = threshold;
      // Is there a nearby exact match? (speedup)
      let bestLocation = expectedLocation;

      // Performance: only computer matches when the minMatchCharLength > 1
      // OR if `includeMatches` is true.
      const computeMatches = minMatchCharLength > 1 || includeMatches;
      // A mask of the matches, used for building the indices
      const matchMask = computeMatches ? Array(textLen) : [];

      let index;

      // Get all exact matches, here for speed up
      while ((index = text.indexOf(pattern, bestLocation)) > -1) {
        let score = computeScore$1(pattern, {
          currentLocation: index,
          expectedLocation,
          distance,
          ignoreLocation
        });

        currentThreshold = Math.min(score, currentThreshold);
        bestLocation = index + patternLen;

        if (computeMatches) {
          let i = 0;
          while (i < patternLen) {
            matchMask[index + i] = 1;
            i += 1;
          }
        }
      }

      // Reset the best location
      bestLocation = -1;

      let lastBitArr = [];
      let finalScore = 1;
      let binMax = patternLen + textLen;

      const mask = 1 << (patternLen - 1);

      for (let i = 0; i < patternLen; i += 1) {
        // Scan for the best match; each iteration allows for one more error.
        // Run a binary search to determine how far from the match location we can stray
        // at this error level.
        let binMin = 0;
        let binMid = binMax;

        while (binMin < binMid) {
          const score = computeScore$1(pattern, {
            errors: i,
            currentLocation: expectedLocation + binMid,
            expectedLocation,
            distance,
            ignoreLocation
          });

          if (score <= currentThreshold) {
            binMin = binMid;
          } else {
            binMax = binMid;
          }

          binMid = Math.floor((binMax - binMin) / 2 + binMin);
        }

        // Use the result from this iteration as the maximum for the next.
        binMax = binMid;

        let start = Math.max(1, expectedLocation - binMid + 1);
        let finish = findAllMatches
          ? textLen
          : Math.min(expectedLocation + binMid, textLen) + patternLen;

        // Initialize the bit array
        let bitArr = Array(finish + 2);

        bitArr[finish + 1] = (1 << i) - 1;

        for (let j = finish; j >= start; j -= 1) {
          let currentLocation = j - 1;
          let charMatch = patternAlphabet[text.charAt(currentLocation)];

          if (computeMatches) {
            // Speed up: quick bool to int conversion (i.e, `charMatch ? 1 : 0`)
            matchMask[currentLocation] = +!!charMatch;
          }

          // First pass: exact match
          bitArr[j] = ((bitArr[j + 1] << 1) | 1) & charMatch;

          // Subsequent passes: fuzzy match
          if (i) {
            bitArr[j] |=
              ((lastBitArr[j + 1] | lastBitArr[j]) << 1) | 1 | lastBitArr[j + 1];
          }

          if (bitArr[j] & mask) {
            finalScore = computeScore$1(pattern, {
              errors: i,
              currentLocation,
              expectedLocation,
              distance,
              ignoreLocation
            });

            // This match will almost certainly be better than any existing match.
            // But check anyway.
            if (finalScore <= currentThreshold) {
              // Indeed it is
              currentThreshold = finalScore;
              bestLocation = currentLocation;

              // Already passed `loc`, downhill from here on in.
              if (bestLocation <= expectedLocation) {
                break
              }

              // When passing `bestLocation`, don't exceed our current distance from `expectedLocation`.
              start = Math.max(1, 2 * expectedLocation - bestLocation);
            }
          }
        }

        // No hope for a (better) match at greater error levels.
        const score = computeScore$1(pattern, {
          errors: i + 1,
          currentLocation: expectedLocation,
          expectedLocation,
          distance,
          ignoreLocation
        });

        if (score > currentThreshold) {
          break
        }

        lastBitArr = bitArr;
      }

      const result = {
        isMatch: bestLocation >= 0,
        // Count exact matches (those with a score of 0) to be "almost" exact
        score: Math.max(0.001, finalScore)
      };

      if (computeMatches) {
        const indices = convertMaskToIndices(matchMask, minMatchCharLength);
        if (!indices.length) {
          result.isMatch = false;
        } else if (includeMatches) {
          result.indices = indices;
        }
      }

      return result
    }

    function createPatternAlphabet(pattern) {
      let mask = {};

      for (let i = 0, len = pattern.length; i < len; i += 1) {
        const char = pattern.charAt(i);
        mask[char] = (mask[char] || 0) | (1 << (len - i - 1));
      }

      return mask
    }

    class BitapSearch {
      constructor(
        pattern,
        {
          location = Config.location,
          threshold = Config.threshold,
          distance = Config.distance,
          includeMatches = Config.includeMatches,
          findAllMatches = Config.findAllMatches,
          minMatchCharLength = Config.minMatchCharLength,
          isCaseSensitive = Config.isCaseSensitive,
          ignoreLocation = Config.ignoreLocation
        } = {}
      ) {
        this.options = {
          location,
          threshold,
          distance,
          includeMatches,
          findAllMatches,
          minMatchCharLength,
          isCaseSensitive,
          ignoreLocation
        };

        this.pattern = isCaseSensitive ? pattern : pattern.toLowerCase();

        this.chunks = [];

        if (!this.pattern.length) {
          return
        }

        const addChunk = (pattern, startIndex) => {
          this.chunks.push({
            pattern,
            alphabet: createPatternAlphabet(pattern),
            startIndex
          });
        };

        const len = this.pattern.length;

        if (len > MAX_BITS) {
          let i = 0;
          const remainder = len % MAX_BITS;
          const end = len - remainder;

          while (i < end) {
            addChunk(this.pattern.substr(i, MAX_BITS), i);
            i += MAX_BITS;
          }

          if (remainder) {
            const startIndex = len - MAX_BITS;
            addChunk(this.pattern.substr(startIndex), startIndex);
          }
        } else {
          addChunk(this.pattern, 0);
        }
      }

      searchIn(text) {
        const { isCaseSensitive, includeMatches } = this.options;

        if (!isCaseSensitive) {
          text = text.toLowerCase();
        }

        // Exact match
        if (this.pattern === text) {
          let result = {
            isMatch: true,
            score: 0
          };

          if (includeMatches) {
            result.indices = [[0, text.length - 1]];
          }

          return result
        }

        // Otherwise, use Bitap algorithm
        const {
          location,
          distance,
          threshold,
          findAllMatches,
          minMatchCharLength,
          ignoreLocation
        } = this.options;

        let allIndices = [];
        let totalScore = 0;
        let hasMatches = false;

        this.chunks.forEach(({ pattern, alphabet, startIndex }) => {
          const { isMatch, score, indices } = search(text, pattern, alphabet, {
            location: location + startIndex,
            distance,
            threshold,
            findAllMatches,
            minMatchCharLength,
            includeMatches,
            ignoreLocation
          });

          if (isMatch) {
            hasMatches = true;
          }

          totalScore += score;

          if (isMatch && indices) {
            allIndices = [...allIndices, ...indices];
          }
        });

        let result = {
          isMatch: hasMatches,
          score: hasMatches ? totalScore / this.chunks.length : 1
        };

        if (hasMatches && includeMatches) {
          result.indices = allIndices;
        }

        return result
      }
    }

    class BaseMatch {
      constructor(pattern) {
        this.pattern = pattern;
      }
      static isMultiMatch(pattern) {
        return getMatch(pattern, this.multiRegex)
      }
      static isSingleMatch(pattern) {
        return getMatch(pattern, this.singleRegex)
      }
      search(/*text*/) {}
    }

    function getMatch(pattern, exp) {
      const matches = pattern.match(exp);
      return matches ? matches[1] : null
    }

    // Token: 'file

    class ExactMatch extends BaseMatch {
      constructor(pattern) {
        super(pattern);
      }
      static get type() {
        return 'exact'
      }
      static get multiRegex() {
        return /^="(.*)"$/
      }
      static get singleRegex() {
        return /^=(.*)$/
      }
      search(text) {
        const isMatch = text === this.pattern;

        return {
          isMatch,
          score: isMatch ? 0 : 1,
          indices: [0, this.pattern.length - 1]
        }
      }
    }

    // Token: !fire

    class InverseExactMatch extends BaseMatch {
      constructor(pattern) {
        super(pattern);
      }
      static get type() {
        return 'inverse-exact'
      }
      static get multiRegex() {
        return /^!"(.*)"$/
      }
      static get singleRegex() {
        return /^!(.*)$/
      }
      search(text) {
        const index = text.indexOf(this.pattern);
        const isMatch = index === -1;

        return {
          isMatch,
          score: isMatch ? 0 : 1,
          indices: [0, text.length - 1]
        }
      }
    }

    // Token: ^file

    class PrefixExactMatch extends BaseMatch {
      constructor(pattern) {
        super(pattern);
      }
      static get type() {
        return 'prefix-exact'
      }
      static get multiRegex() {
        return /^\^"(.*)"$/
      }
      static get singleRegex() {
        return /^\^(.*)$/
      }
      search(text) {
        const isMatch = text.startsWith(this.pattern);

        return {
          isMatch,
          score: isMatch ? 0 : 1,
          indices: [0, this.pattern.length - 1]
        }
      }
    }

    // Token: !^fire

    class InversePrefixExactMatch extends BaseMatch {
      constructor(pattern) {
        super(pattern);
      }
      static get type() {
        return 'inverse-prefix-exact'
      }
      static get multiRegex() {
        return /^!\^"(.*)"$/
      }
      static get singleRegex() {
        return /^!\^(.*)$/
      }
      search(text) {
        const isMatch = !text.startsWith(this.pattern);

        return {
          isMatch,
          score: isMatch ? 0 : 1,
          indices: [0, text.length - 1]
        }
      }
    }

    // Token: .file$

    class SuffixExactMatch extends BaseMatch {
      constructor(pattern) {
        super(pattern);
      }
      static get type() {
        return 'suffix-exact'
      }
      static get multiRegex() {
        return /^"(.*)"\$$/
      }
      static get singleRegex() {
        return /^(.*)\$$/
      }
      search(text) {
        const isMatch = text.endsWith(this.pattern);

        return {
          isMatch,
          score: isMatch ? 0 : 1,
          indices: [text.length - this.pattern.length, text.length - 1]
        }
      }
    }

    // Token: !.file$

    class InverseSuffixExactMatch extends BaseMatch {
      constructor(pattern) {
        super(pattern);
      }
      static get type() {
        return 'inverse-suffix-exact'
      }
      static get multiRegex() {
        return /^!"(.*)"\$$/
      }
      static get singleRegex() {
        return /^!(.*)\$$/
      }
      search(text) {
        const isMatch = !text.endsWith(this.pattern);
        return {
          isMatch,
          score: isMatch ? 0 : 1,
          indices: [0, text.length - 1]
        }
      }
    }

    class FuzzyMatch extends BaseMatch {
      constructor(
        pattern,
        {
          location = Config.location,
          threshold = Config.threshold,
          distance = Config.distance,
          includeMatches = Config.includeMatches,
          findAllMatches = Config.findAllMatches,
          minMatchCharLength = Config.minMatchCharLength,
          isCaseSensitive = Config.isCaseSensitive,
          ignoreLocation = Config.ignoreLocation
        } = {}
      ) {
        super(pattern);
        this._bitapSearch = new BitapSearch(pattern, {
          location,
          threshold,
          distance,
          includeMatches,
          findAllMatches,
          minMatchCharLength,
          isCaseSensitive,
          ignoreLocation
        });
      }
      static get type() {
        return 'fuzzy'
      }
      static get multiRegex() {
        return /^"(.*)"$/
      }
      static get singleRegex() {
        return /^(.*)$/
      }
      search(text) {
        return this._bitapSearch.searchIn(text)
      }
    }

    // Token: 'file

    class IncludeMatch extends BaseMatch {
      constructor(pattern) {
        super(pattern);
      }
      static get type() {
        return 'include'
      }
      static get multiRegex() {
        return /^'"(.*)"$/
      }
      static get singleRegex() {
        return /^'(.*)$/
      }
      search(text) {
        let location = 0;
        let index;

        const indices = [];
        const patternLen = this.pattern.length;

        // Get all exact matches
        while ((index = text.indexOf(this.pattern, location)) > -1) {
          location = index + patternLen;
          indices.push([index, location - 1]);
        }

        const isMatch = !!indices.length;

        return {
          isMatch,
          score: isMatch ? 0 : 1,
          indices
        }
      }
    }

    // ❗Order is important. DO NOT CHANGE.
    const searchers = [
      ExactMatch,
      IncludeMatch,
      PrefixExactMatch,
      InversePrefixExactMatch,
      InverseSuffixExactMatch,
      SuffixExactMatch,
      InverseExactMatch,
      FuzzyMatch
    ];

    const searchersLen = searchers.length;

    // Regex to split by spaces, but keep anything in quotes together
    const SPACE_RE = / +(?=([^\"]*\"[^\"]*\")*[^\"]*$)/;
    const OR_TOKEN = '|';

    // Return a 2D array representation of the query, for simpler parsing.
    // Example:
    // "^core go$ | rb$ | py$ xy$" => [["^core", "go$"], ["rb$"], ["py$", "xy$"]]
    function parseQuery(pattern, options = {}) {
      return pattern.split(OR_TOKEN).map((item) => {
        let query = item
          .trim()
          .split(SPACE_RE)
          .filter((item) => item && !!item.trim());

        let results = [];
        for (let i = 0, len = query.length; i < len; i += 1) {
          const queryItem = query[i];

          // 1. Handle multiple query match (i.e, once that are quoted, like `"hello world"`)
          let found = false;
          let idx = -1;
          while (!found && ++idx < searchersLen) {
            const searcher = searchers[idx];
            let token = searcher.isMultiMatch(queryItem);
            if (token) {
              results.push(new searcher(token, options));
              found = true;
            }
          }

          if (found) {
            continue
          }

          // 2. Handle single query matches (i.e, once that are *not* quoted)
          idx = -1;
          while (++idx < searchersLen) {
            const searcher = searchers[idx];
            let token = searcher.isSingleMatch(queryItem);
            if (token) {
              results.push(new searcher(token, options));
              break
            }
          }
        }

        return results
      })
    }

    // These extended matchers can return an array of matches, as opposed
    // to a singl match
    const MultiMatchSet = new Set([FuzzyMatch.type, IncludeMatch.type]);

    /**
     * Command-like searching
     * ======================
     *
     * Given multiple search terms delimited by spaces.e.g. `^jscript .python$ ruby !java`,
     * search in a given text.
     *
     * Search syntax:
     *
     * | Token       | Match type                 | Description                            |
     * | ----------- | -------------------------- | -------------------------------------- |
     * | `jscript`   | fuzzy-match                | Items that fuzzy match `jscript`       |
     * | `=scheme`   | exact-match                | Items that are `scheme`                |
     * | `'python`   | include-match              | Items that include `python`            |
     * | `!ruby`     | inverse-exact-match        | Items that do not include `ruby`       |
     * | `^java`     | prefix-exact-match         | Items that start with `java`           |
     * | `!^earlang` | inverse-prefix-exact-match | Items that do not start with `earlang` |
     * | `.js$`      | suffix-exact-match         | Items that end with `.js`              |
     * | `!.go$`     | inverse-suffix-exact-match | Items that do not end with `.go`       |
     *
     * A single pipe character acts as an OR operator. For example, the following
     * query matches entries that start with `core` and end with either`go`, `rb`,
     * or`py`.
     *
     * ```
     * ^core go$ | rb$ | py$
     * ```
     */
    class ExtendedSearch {
      constructor(
        pattern,
        {
          isCaseSensitive = Config.isCaseSensitive,
          includeMatches = Config.includeMatches,
          minMatchCharLength = Config.minMatchCharLength,
          ignoreLocation = Config.ignoreLocation,
          findAllMatches = Config.findAllMatches,
          location = Config.location,
          threshold = Config.threshold,
          distance = Config.distance
        } = {}
      ) {
        this.query = null;
        this.options = {
          isCaseSensitive,
          includeMatches,
          minMatchCharLength,
          findAllMatches,
          ignoreLocation,
          location,
          threshold,
          distance
        };

        this.pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
        this.query = parseQuery(this.pattern, this.options);
      }

      static condition(_, options) {
        return options.useExtendedSearch
      }

      searchIn(text) {
        const query = this.query;

        if (!query) {
          return {
            isMatch: false,
            score: 1
          }
        }

        const { includeMatches, isCaseSensitive } = this.options;

        text = isCaseSensitive ? text : text.toLowerCase();

        let numMatches = 0;
        let allIndices = [];
        let totalScore = 0;

        // ORs
        for (let i = 0, qLen = query.length; i < qLen; i += 1) {
          const searchers = query[i];

          // Reset indices
          allIndices.length = 0;
          numMatches = 0;

          // ANDs
          for (let j = 0, pLen = searchers.length; j < pLen; j += 1) {
            const searcher = searchers[j];
            const { isMatch, indices, score } = searcher.search(text);

            if (isMatch) {
              numMatches += 1;
              totalScore += score;
              if (includeMatches) {
                const type = searcher.constructor.type;
                if (MultiMatchSet.has(type)) {
                  allIndices = [...allIndices, ...indices];
                } else {
                  allIndices.push(indices);
                }
              }
            } else {
              totalScore = 0;
              numMatches = 0;
              allIndices.length = 0;
              break
            }
          }

          // OR condition, so if TRUE, return
          if (numMatches) {
            let result = {
              isMatch: true,
              score: totalScore / numMatches
            };

            if (includeMatches) {
              result.indices = allIndices;
            }

            return result
          }
        }

        // Nothing was matched
        return {
          isMatch: false,
          score: 1
        }
      }
    }

    const registeredSearchers = [];

    function register(...args) {
      registeredSearchers.push(...args);
    }

    function createSearcher(pattern, options) {
      for (let i = 0, len = registeredSearchers.length; i < len; i += 1) {
        let searcherClass = registeredSearchers[i];
        if (searcherClass.condition(pattern, options)) {
          return new searcherClass(pattern, options)
        }
      }

      return new BitapSearch(pattern, options)
    }

    const LogicalOperator = {
      AND: '$and',
      OR: '$or'
    };

    const KeyType = {
      PATH: '$path',
      PATTERN: '$val'
    };

    const isExpression = (query) =>
      !!(query[LogicalOperator.AND] || query[LogicalOperator.OR]);

    const isPath = (query) => !!query[KeyType.PATH];

    const isLeaf = (query) =>
      !isArray(query) && isObject(query) && !isExpression(query);

    const convertToExplicit = (query) => ({
      [LogicalOperator.AND]: Object.keys(query).map((key) => ({
        [key]: query[key]
      }))
    });

    // When `auto` is `true`, the parse function will infer and initialize and add
    // the appropriate `Searcher` instance
    function parse(query, options, { auto = true } = {}) {
      const next = (query) => {
        let keys = Object.keys(query);

        const isQueryPath = isPath(query);

        if (!isQueryPath && keys.length > 1 && !isExpression(query)) {
          return next(convertToExplicit(query))
        }

        if (isLeaf(query)) {
          const key = isQueryPath ? query[KeyType.PATH] : keys[0];

          const pattern = isQueryPath ? query[KeyType.PATTERN] : query[key];

          if (!isString(pattern)) {
            throw new Error(LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY(key))
          }

          const obj = {
            keyId: createKeyId(key),
            pattern
          };

          if (auto) {
            obj.searcher = createSearcher(pattern, options);
          }

          return obj
        }

        let node = {
          children: [],
          operator: keys[0]
        };

        keys.forEach((key) => {
          const value = query[key];

          if (isArray(value)) {
            value.forEach((item) => {
              node.children.push(next(item));
            });
          }
        });

        return node
      };

      if (!isExpression(query)) {
        query = convertToExplicit(query);
      }

      return next(query)
    }

    // Practical scoring function
    function computeScore(
      results,
      { ignoreFieldNorm = Config.ignoreFieldNorm }
    ) {
      results.forEach((result) => {
        let totalScore = 1;

        result.matches.forEach(({ key, norm, score }) => {
          const weight = key ? key.weight : null;

          totalScore *= Math.pow(
            score === 0 && weight ? Number.EPSILON : score,
            (weight || 1) * (ignoreFieldNorm ? 1 : norm)
          );
        });

        result.score = totalScore;
      });
    }

    function transformMatches(result, data) {
      const matches = result.matches;
      data.matches = [];

      if (!isDefined(matches)) {
        return
      }

      matches.forEach((match) => {
        if (!isDefined(match.indices) || !match.indices.length) {
          return
        }

        const { indices, value } = match;

        let obj = {
          indices,
          value
        };

        if (match.key) {
          obj.key = match.key.src;
        }

        if (match.idx > -1) {
          obj.refIndex = match.idx;
        }

        data.matches.push(obj);
      });
    }

    function transformScore(result, data) {
      data.score = result.score;
    }

    function format(
      results,
      docs,
      {
        includeMatches = Config.includeMatches,
        includeScore = Config.includeScore
      } = {}
    ) {
      const transformers = [];

      if (includeMatches) transformers.push(transformMatches);
      if (includeScore) transformers.push(transformScore);

      return results.map((result) => {
        const { idx } = result;

        const data = {
          item: docs[idx],
          refIndex: idx
        };

        if (transformers.length) {
          transformers.forEach((transformer) => {
            transformer(result, data);
          });
        }

        return data
      })
    }

    class Fuse {
      constructor(docs, options = {}, index) {
        this.options = { ...Config, ...options };

        if (
          this.options.useExtendedSearch &&
          !true
        ) {
          throw new Error(EXTENDED_SEARCH_UNAVAILABLE)
        }

        this._keyStore = new KeyStore(this.options.keys);

        this.setCollection(docs, index);
      }

      setCollection(docs, index) {
        this._docs = docs;

        if (index && !(index instanceof FuseIndex)) {
          throw new Error(INCORRECT_INDEX_TYPE)
        }

        this._myIndex =
          index ||
          createIndex(this.options.keys, this._docs, {
            getFn: this.options.getFn,
            fieldNormWeight: this.options.fieldNormWeight
          });
      }

      add(doc) {
        if (!isDefined(doc)) {
          return
        }

        this._docs.push(doc);
        this._myIndex.add(doc);
      }

      remove(predicate = (/* doc, idx */) => false) {
        const results = [];

        for (let i = 0, len = this._docs.length; i < len; i += 1) {
          const doc = this._docs[i];
          if (predicate(doc, i)) {
            this.removeAt(i);
            i -= 1;
            len -= 1;

            results.push(doc);
          }
        }

        return results
      }

      removeAt(idx) {
        this._docs.splice(idx, 1);
        this._myIndex.removeAt(idx);
      }

      getIndex() {
        return this._myIndex
      }

      search(query, { limit = -1 } = {}) {
        const {
          includeMatches,
          includeScore,
          shouldSort,
          sortFn,
          ignoreFieldNorm
        } = this.options;

        let results = isString(query)
          ? isString(this._docs[0])
            ? this._searchStringList(query)
            : this._searchObjectList(query)
          : this._searchLogical(query);

        computeScore(results, { ignoreFieldNorm });

        if (shouldSort) {
          results.sort(sortFn);
        }

        if (isNumber(limit) && limit > -1) {
          results = results.slice(0, limit);
        }

        return format(results, this._docs, {
          includeMatches,
          includeScore
        })
      }

      _searchStringList(query) {
        const searcher = createSearcher(query, this.options);
        const { records } = this._myIndex;
        const results = [];

        // Iterate over every string in the index
        records.forEach(({ v: text, i: idx, n: norm }) => {
          if (!isDefined(text)) {
            return
          }

          const { isMatch, score, indices } = searcher.searchIn(text);

          if (isMatch) {
            results.push({
              item: text,
              idx,
              matches: [{ score, value: text, norm, indices }]
            });
          }
        });

        return results
      }

      _searchLogical(query) {

        const expression = parse(query, this.options);

        const evaluate = (node, item, idx) => {
          if (!node.children) {
            const { keyId, searcher } = node;

            const matches = this._findMatches({
              key: this._keyStore.get(keyId),
              value: this._myIndex.getValueForItemAtKeyId(item, keyId),
              searcher
            });

            if (matches && matches.length) {
              return [
                {
                  idx,
                  item,
                  matches
                }
              ]
            }

            return []
          }

          const res = [];
          for (let i = 0, len = node.children.length; i < len; i += 1) {
            const child = node.children[i];
            const result = evaluate(child, item, idx);
            if (result.length) {
              res.push(...result);
            } else if (node.operator === LogicalOperator.AND) {
              return []
            }
          }
          return res
        };

        const records = this._myIndex.records;
        const resultMap = {};
        const results = [];

        records.forEach(({ $: item, i: idx }) => {
          if (isDefined(item)) {
            let expResults = evaluate(expression, item, idx);

            if (expResults.length) {
              // Dedupe when adding
              if (!resultMap[idx]) {
                resultMap[idx] = { idx, item, matches: [] };
                results.push(resultMap[idx]);
              }
              expResults.forEach(({ matches }) => {
                resultMap[idx].matches.push(...matches);
              });
            }
          }
        });

        return results
      }

      _searchObjectList(query) {
        const searcher = createSearcher(query, this.options);
        const { keys, records } = this._myIndex;
        const results = [];

        // List is Array<Object>
        records.forEach(({ $: item, i: idx }) => {
          if (!isDefined(item)) {
            return
          }

          let matches = [];

          // Iterate over every key (i.e, path), and fetch the value at that key
          keys.forEach((key, keyIndex) => {
            matches.push(
              ...this._findMatches({
                key,
                value: item[keyIndex],
                searcher
              })
            );
          });

          if (matches.length) {
            results.push({
              idx,
              item,
              matches
            });
          }
        });

        return results
      }
      _findMatches({ key, value, searcher }) {
        if (!isDefined(value)) {
          return []
        }

        let matches = [];

        if (isArray(value)) {
          value.forEach(({ v: text, i: idx, n: norm }) => {
            if (!isDefined(text)) {
              return
            }

            const { isMatch, score, indices } = searcher.searchIn(text);

            if (isMatch) {
              matches.push({
                score,
                key,
                value: text,
                idx,
                norm,
                indices
              });
            }
          });
        } else {
          const { v: text, n: norm } = value;

          const { isMatch, score, indices } = searcher.searchIn(text);

          if (isMatch) {
            matches.push({ score, key, value: text, norm, indices });
          }
        }

        return matches
      }
    }

    Fuse.version = '6.5.3';
    Fuse.createIndex = createIndex;
    Fuse.parseIndex = parseIndex;
    Fuse.config = Config;

    {
      Fuse.parseQuery = parse;
    }

    {
      register(ExtendedSearch);
    }

    /* src\pages\Templates.svelte generated by Svelte v3.46.3 */
    const file$1 = "src\\pages\\Templates.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (71:0) {#if userdata}
    function create_if_block$1(ctx) {
    	let div7;
    	let show_if = /*templates*/ ctx[1] && /*templates*/ ctx[1].filter(/*func*/ ctx[10]).length < 10;
    	let t0;
    	let div6;
    	let div5;
    	let h3;
    	let t2;
    	let div1;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let span;
    	let t5;
    	let div3;
    	let div2;
    	let label1;
    	let t7;
    	let input1;
    	let t8;
    	let div4;
    	let mounted;
    	let dispose;
    	let if_block0 = show_if && create_if_block_4(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*templates*/ ctx[1]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div6 = element("div");
    			div5 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Pick a Template";
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			t3 = text("Just my templates \r\n                        ");
    			input0 = element("input");
    			t4 = space();
    			span = element("span");
    			t5 = space();
    			div3 = element("div");
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Search";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			div4 = element("div");
    			if_block1.c();
    			add_location(h3, file$1, 117, 12, 4184);
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "class", "svelte-aj5kgd");
    			add_location(input0, file$1, 121, 24, 4385);
    			attr_dev(span, "class", "checkmark svelte-aj5kgd");
    			add_location(span, file$1, 122, 24, 4467);
    			attr_dev(label0, "class", "checkbox-container svelte-aj5kgd");
    			add_location(label0, file$1, 120, 20, 4307);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$1, 119, 16, 4268);
    			attr_dev(div1, "class", "row no-gutters");
    			add_location(div1, file$1, 118, 12, 4222);
    			attr_dev(label1, "for", "search");
    			add_location(label1, file$1, 128, 20, 4671);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$1, 129, 20, 4727);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$1, 127, 16, 4632);
    			attr_dev(div3, "class", "row no-gutters");
    			add_location(div3, file$1, 126, 12, 4586);
    			attr_dev(div4, "class", "row no-gutters");
    			add_location(div4, file$1, 132, 12, 4874);
    			attr_dev(div5, "class", "col");
    			add_location(div5, file$1, 116, 8, 4153);
    			attr_dev(div6, "class", "row");
    			set_style(div6, "margin-top", "14px");
    			add_location(div6, file$1, 115, 4, 4100);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$1, 71, 0, 2015);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			if (if_block0) if_block0.m(div7, null);
    			append_dev(div7, t0);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, h3);
    			append_dev(div5, t2);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, label0);
    			append_dev(label0, t3);
    			append_dev(label0, input0);
    			input0.checked = /*justMyTemplates*/ ctx[2];
    			append_dev(label0, t4);
    			append_dev(label0, span);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t7);
    			append_dev(div2, input1);
    			set_input_value(input1, /*search*/ ctx[4]);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			if_block1.m(div4, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[11]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(input1, "input", /*filterTemplates*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*templates, userdata*/ 3) show_if = /*templates*/ ctx[1] && /*templates*/ ctx[1].filter(/*func*/ ctx[10]).length < 10;

    			if (show_if) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div7, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*justMyTemplates*/ 4) {
    				input0.checked = /*justMyTemplates*/ ctx[2];
    			}

    			if (dirty & /*search*/ 16 && input1.value !== /*search*/ ctx[4]) {
    				set_input_value(input1, /*search*/ ctx[4]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div4, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(71:0) {#if userdata}",
    		ctx
    	});

    	return block;
    }

    // (73:4) {#if templates && templates.filter(t => t.userId === userdata.id).length < 10}
    function create_if_block_4(ctx) {
    	let div12;
    	let div11;
    	let h3;
    	let t1;
    	let form;
    	let div2;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div5;
    	let div3;
    	let label2;
    	let t9;
    	let input2;
    	let t10;
    	let div4;
    	let label3;
    	let t12;
    	let input3;
    	let t13;
    	let div10;
    	let div7;
    	let label4;
    	let t15;
    	let div6;
    	let input4;
    	let t16;
    	let div9;
    	let div8;
    	let button;
    	let t18;
    	let input5;

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div11 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Create a template";
    			t1 = space();
    			form = element("form");
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Search Terms";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div5 = element("div");
    			div3 = element("div");
    			label2 = element("label");
    			label2.textContent = "Friend Code Color";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			div4 = element("div");
    			label3 = element("label");
    			label3.textContent = "Name Color";
    			t12 = space();
    			input3 = element("input");
    			t13 = space();
    			div10 = element("div");
    			div7 = element("div");
    			label4 = element("label");
    			label4.textContent = "Template";
    			t15 = space();
    			div6 = element("div");
    			input4 = element("input");
    			t16 = space();
    			div9 = element("div");
    			div8 = element("div");
    			button = element("button");
    			button.textContent = "Save";
    			t18 = space();
    			input5 = element("input");
    			add_location(h3, file$1, 75, 12, 2186);
    			attr_dev(label0, "for", "name");
    			add_location(label0, file$1, 79, 24, 2417);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "maxlength", "20");
    			add_location(input0, file$1, 80, 24, 2473);
    			attr_dev(div0, "class", "col-12 col-md-4");
    			add_location(div0, file$1, 78, 20, 2362);
    			attr_dev(label1, "for", "name");
    			add_location(label1, file$1, 83, 24, 2647);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "name", "searchTerms");
    			attr_dev(input1, "maxlength", "70");
    			add_location(input1, file$1, 84, 24, 2711);
    			attr_dev(div1, "class", "col-12 col-md-8");
    			add_location(div1, file$1, 82, 20, 2592);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$1, 77, 16, 2323);
    			attr_dev(label2, "for", "name");
    			add_location(label2, file$1, 89, 24, 2951);
    			attr_dev(input2, "type", "color");
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "name", "friendcodecolor");
    			add_location(input2, file$1, 90, 24, 3020);
    			attr_dev(div3, "class", "col-12 col-md-6");
    			add_location(div3, file$1, 88, 20, 2896);
    			attr_dev(label3, "for", "name");
    			add_location(label3, file$1, 93, 24, 3191);
    			attr_dev(input3, "type", "color");
    			attr_dev(input3, "class", "form-control");
    			attr_dev(input3, "name", "namecolor");
    			add_location(input3, file$1, 94, 24, 3253);
    			attr_dev(div4, "class", "col-12 col-md-6");
    			add_location(div4, file$1, 92, 20, 3136);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file$1, 87, 16, 2857);
    			attr_dev(label4, "for", "img");
    			add_location(label4, file$1, 99, 24, 3477);
    			attr_dev(input4, "type", "file");
    			attr_dev(input4, "name", "img");
    			add_location(input4, file$1, 101, 28, 3571);
    			add_location(div6, file$1, 100, 24, 3536);
    			attr_dev(div7, "class", "col-12 col-md-6");
    			add_location(div7, file$1, 98, 20, 3422);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$1, 106, 28, 3819);
    			attr_dev(div8, "class", "save-new svelte-aj5kgd");
    			add_location(div8, file$1, 105, 24, 3767);
    			attr_dev(div9, "class", "col-12 col-md-6");
    			set_style(div9, "position", "relative");
    			add_location(div9, file$1, 104, 20, 3685);
    			attr_dev(div10, "class", "row");
    			add_location(div10, file$1, 97, 16, 3383);
    			attr_dev(input5, "type", "hidden");
    			attr_dev(input5, "name", "slot");
    			input5.value = /*unusedSlot*/ ctx[5];
    			add_location(input5, file$1, 110, 16, 3980);
    			attr_dev(form, "action", "/api/templates/save");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "enctype", "multipart/form-data");
    			add_location(form, file$1, 76, 12, 2226);
    			attr_dev(div11, "class", "col");
    			add_location(div11, file$1, 74, 8, 2155);
    			attr_dev(div12, "class", "row");
    			add_location(div12, file$1, 73, 4, 2128);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div11);
    			append_dev(div11, h3);
    			append_dev(div11, t1);
    			append_dev(div11, form);
    			append_dev(form, div2);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			append_dev(form, t7);
    			append_dev(form, div5);
    			append_dev(div5, div3);
    			append_dev(div3, label2);
    			append_dev(div3, t9);
    			append_dev(div3, input2);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div4, label3);
    			append_dev(div4, t12);
    			append_dev(div4, input3);
    			append_dev(form, t13);
    			append_dev(form, div10);
    			append_dev(div10, div7);
    			append_dev(div7, label4);
    			append_dev(div7, t15);
    			append_dev(div7, div6);
    			append_dev(div6, input4);
    			append_dev(div10, t16);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, button);
    			append_dev(form, t18);
    			append_dev(form, input5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*unusedSlot*/ 32) {
    				prop_dev(input5, "value", /*unusedSlot*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(73:4) {#if templates && templates.filter(t => t.userId === userdata.id).length < 10}",
    		ctx
    	});

    	return block;
    }

    // (173:16) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "You don't have any templates";
    			attr_dev(div, "class", "col");
    			add_location(div, file$1, 173, 16, 7301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(173:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (134:16) {#if templates}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let each_value = /*filteredTemplates*/ ctx[3].filter(/*func_1*/ ctx[13]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*confirmDelete, filteredTemplates, justMyTemplates, userdata, clickTemplate*/ 397) {
    				each_value = /*filteredTemplates*/ ctx[3].filter(/*func_1*/ ctx[13]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(134:16) {#if templates}",
    		ctx
    	});

    	return block;
    }

    // (157:32) {#if keyword}
    function create_if_block_3(ctx) {
    	let div;
    	let t_value = /*keyword*/ ctx[20] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "term svelte-aj5kgd");
    			add_location(div, file$1, 157, 32, 6518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredTemplates, justMyTemplates, userdata*/ 13 && t_value !== (t_value = /*keyword*/ ctx[20] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(157:32) {#if keyword}",
    		ctx
    	});

    	return block;
    }

    // (156:32) {#each template.keywords.split(' ') as keyword}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*keyword*/ ctx[20] && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*keyword*/ ctx[20]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(156:32) {#each template.keywords.split(' ') as keyword}",
    		ctx
    	});

    	return block;
    }

    // (163:24) {#if template.userId === userdata.id}
    function create_if_block_2(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[15](/*template*/ ctx[17]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Delete";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-danger");
    			set_style(button, "width", "100%");
    			add_location(button, file$1, 165, 32, 6928);
    			attr_dev(div0, "class", "col");
    			set_style(div0, "position", "relative");
    			set_style(div0, "margin", "12px");
    			add_location(div0, file$1, 164, 28, 6838);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$1, 163, 24, 6791);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(163:24) {#if template.userId === userdata.id}",
    		ctx
    	});

    	return block;
    }

    // (135:16) {#each filteredTemplates.filter(t => justMyTemplates ? t.userId === userdata.id : true) as template}
    function create_each_block(ctx) {
    	let div7;
    	let div6;
    	let div1;
    	let div0;
    	let h5;
    	let t0_value = /*template*/ ctx[17].name + "";
    	let t0;
    	let t1;
    	let button;
    	let img;
    	let img_src_value;
    	let t2;
    	let div4;
    	let div2;
    	let input0;
    	let input0_value_value;
    	let t3;
    	let t4;
    	let div3;
    	let input1;
    	let input1_value_value;
    	let t5;
    	let t6;
    	let div5;
    	let t7;
    	let t8;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*template*/ ctx[17].keywords.split(' ');
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*template*/ ctx[17]);
    	}

    	let if_block = /*template*/ ctx[17].userId === /*userdata*/ ctx[0].id && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			img = element("img");
    			t2 = space();
    			div4 = element("div");
    			div2 = element("div");
    			input0 = element("input");
    			t3 = text("\r\n                                    Friend Code");
    			t4 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t5 = text("\r\n                                    Name");
    			t6 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			if (if_block) if_block.c();
    			t8 = space();
    			add_location(h5, file$1, 139, 32, 5344);
    			attr_dev(div0, "class", "col-12 no-gutters");
    			add_location(div0, file$1, 138, 28, 5279);
    			attr_dev(div1, "class", "row no-gutters");
    			add_location(div1, file$1, 137, 24, 5221);
    			if (!src_url_equal(img.src, img_src_value = /*template*/ ctx[17].url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "template");
    			set_style(img, "width", "100%");
    			add_location(img, file$1, 143, 28, 5591);
    			attr_dev(input0, "class", "color-display svelte-aj5kgd");
    			attr_dev(input0, "type", "color");
    			input0.readOnly = true;
    			input0.value = input0_value_value = /*template*/ ctx[17].color_friendcode;
    			add_location(input0, file$1, 146, 36, 5812);
    			set_style(div2, "text-align", "left");
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$1, 145, 32, 5733);
    			attr_dev(input1, "class", "color-display svelte-aj5kgd");
    			attr_dev(input1, "type", "color");
    			input1.readOnly = true;
    			input1.value = input1_value_value = /*template*/ ctx[17].color_name;
    			add_location(input1, file$1, 150, 36, 6101);
    			set_style(div3, "text-align", "left");
    			attr_dev(div3, "class", "col");
    			add_location(div3, file$1, 149, 32, 6022);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$1, 144, 28, 5682);
    			attr_dev(div5, "class", "search-terms svelte-aj5kgd");
    			add_location(div5, file$1, 154, 28, 6330);
    			attr_dev(button, "type", "btn btn-primary");
    			attr_dev(button, "class", "template-choice svelte-aj5kgd");
    			add_location(button, file$1, 142, 24, 5462);
    			attr_dev(div6, "class", "floating-card mdc-elevation--z20 svelte-aj5kgd");
    			add_location(div6, file$1, 136, 20, 5149);
    			attr_dev(div7, "class", "col-12 col-md-4");
    			set_style(div7, "position", "relative");
    			add_location(div7, file$1, 135, 16, 5071);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t0);
    			append_dev(div6, t1);
    			append_dev(div6, button);
    			append_dev(button, img);
    			append_dev(button, t2);
    			append_dev(button, div4);
    			append_dev(div4, div2);
    			append_dev(div2, input0);
    			append_dev(div2, t3);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, input1);
    			append_dev(div3, t5);
    			append_dev(button, t6);
    			append_dev(button, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			append_dev(div6, t7);
    			if (if_block) if_block.m(div6, null);
    			append_dev(div7, t8);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*filteredTemplates, justMyTemplates, userdata*/ 13 && t0_value !== (t0_value = /*template*/ ctx[17].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*filteredTemplates, justMyTemplates, userdata*/ 13 && !src_url_equal(img.src, img_src_value = /*template*/ ctx[17].url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*filteredTemplates, justMyTemplates, userdata*/ 13 && input0_value_value !== (input0_value_value = /*template*/ ctx[17].color_friendcode)) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*filteredTemplates, justMyTemplates, userdata*/ 13 && input1_value_value !== (input1_value_value = /*template*/ ctx[17].color_name)) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*filteredTemplates, justMyTemplates, userdata*/ 13) {
    				each_value_1 = /*template*/ ctx[17].keywords.split(' ');
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*template*/ ctx[17].userId === /*userdata*/ ctx[0].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(div6, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(135:16) {#each filteredTemplates.filter(t => justMyTemplates ? t.userId === userdata.id : true) as template}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*userdata*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*userdata*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Templates', slots, []);
    	let { userdata = {} } = $$props;

    	let { setTemplate = template => {
    		
    	} } = $$props;

    	let templates = null;
    	let justMyTemplates = false;
    	let filteredTemplates = null;
    	let fuse;
    	let search = '';
    	let unusedSlot = 0;

    	onMount(async () => {
    		$$invalidate(1, templates = await searchTemplates());

    		$$invalidate(1, templates = templates.sort((t1, t2) => {
    			if (t1.userId === userdata.id && t2.userId === userdata.id) return 0;
    			if (t1.userId !== userdata.id && t2.userId !== userdata.id) return 0;
    			if (t1.userId === userdata.id) return -1;
    			return 1;
    		}));

    		$$invalidate(3, filteredTemplates = templates);

    		const options = {
    			shouldSort: true,
    			threshold: 0.4,
    			keys: ["name", "keywords"]
    		};

    		fuse = new Fuse(templates, options);
    		let sorted = templates.filter(t => t.userId === userdata.id).sort((t1, t2) => parseInt(t1.slot) > parseInt(t2.slot) ? 1 : -1);
    		sorted.forEach(t => unusedSlot === parseInt(t.slot) && $$invalidate(5, unusedSlot++, unusedSlot));
    	});

    	function filterTemplates() {
    		if (search) $$invalidate(3, filteredTemplates = fuse.search(search).map(v => v.item)); else $$invalidate(3, filteredTemplates = templates);
    	}

    	function clickTemplate(id) {
    		setTemplate(id);
    		navigate("/");
    	}

    	async function confirmDelete(name, slot) {
    		const result = confirm(`Are you sure you wish to delete the template ${name}?  This action cannot be undone.`);

    		if (result) {
    			await deleteTemplate(slot);
    			window.location.reload();
    		}
    	}

    	const writable_props = ['userdata', 'setTemplate'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Templates> was created with unknown prop '${key}'`);
    	});

    	const func = t => t.userId === userdata.id;

    	function input0_change_handler() {
    		justMyTemplates = this.checked;
    		$$invalidate(2, justMyTemplates);
    	}

    	function input1_input_handler() {
    		search = this.value;
    		$$invalidate(4, search);
    	}

    	const func_1 = t => justMyTemplates ? t.userId === userdata.id : true;
    	const click_handler = template => clickTemplate(template.id);
    	const click_handler_1 = async template => await confirmDelete(template.name, template.slot);

    	$$self.$$set = $$props => {
    		if ('userdata' in $$props) $$invalidate(0, userdata = $$props.userdata);
    		if ('setTemplate' in $$props) $$invalidate(9, setTemplate = $$props.setTemplate);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		navigate,
    		searchTemplates,
    		deleteTemplate,
    		Fuse,
    		userdata,
    		setTemplate,
    		templates,
    		justMyTemplates,
    		filteredTemplates,
    		fuse,
    		search,
    		unusedSlot,
    		filterTemplates,
    		clickTemplate,
    		confirmDelete
    	});

    	$$self.$inject_state = $$props => {
    		if ('userdata' in $$props) $$invalidate(0, userdata = $$props.userdata);
    		if ('setTemplate' in $$props) $$invalidate(9, setTemplate = $$props.setTemplate);
    		if ('templates' in $$props) $$invalidate(1, templates = $$props.templates);
    		if ('justMyTemplates' in $$props) $$invalidate(2, justMyTemplates = $$props.justMyTemplates);
    		if ('filteredTemplates' in $$props) $$invalidate(3, filteredTemplates = $$props.filteredTemplates);
    		if ('fuse' in $$props) fuse = $$props.fuse;
    		if ('search' in $$props) $$invalidate(4, search = $$props.search);
    		if ('unusedSlot' in $$props) $$invalidate(5, unusedSlot = $$props.unusedSlot);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		userdata,
    		templates,
    		justMyTemplates,
    		filteredTemplates,
    		search,
    		unusedSlot,
    		filterTemplates,
    		clickTemplate,
    		confirmDelete,
    		setTemplate,
    		func,
    		input0_change_handler,
    		input1_input_handler,
    		func_1,
    		click_handler,
    		click_handler_1
    	];
    }

    class Templates extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { userdata: 0, setTemplate: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Templates",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get userdata() {
    		throw new Error("<Templates>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userdata(value) {
    		throw new Error("<Templates>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setTemplate() {
    		throw new Error("<Templates>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setTemplate(value) {
    		throw new Error("<Templates>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.3 */
    const file = "src\\App.svelte";

    // (33:12) {#if userdata.id}
    function create_if_block(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let t0;
    	let div1;
    	let a0;
    	let t2;
    	let div2;
    	let form;
    	let input;
    	let t3;
    	let a1;
    	let t5;
    	let div3;
    	let a2;
    	let t7;
    	let img;
    	let img_src_value;
    	let t8;
    	let a3;
    	let t10;
    	let a4;
    	let t11;
    	let a4_href_value;
    	let t12;
    	let a5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Settings";
    			t2 = space();
    			div2 = element("div");
    			form = element("form");
    			input = element("input");
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "Delete Profile";
    			t5 = space();
    			div3 = element("div");
    			a2 = element("a");
    			a2.textContent = "Logout";
    			t7 = space();
    			img = element("img");
    			t8 = space();
    			a3 = element("a");
    			a3.textContent = "Home";
    			t10 = space();
    			a4 = element("a");
    			t11 = text("Profile");
    			t12 = space();
    			a5 = element("a");
    			a5.textContent = "Templates";
    			set_style(div0, "height", "70px");
    			set_style(div0, "width", "1px");
    			add_location(div0, file, 35, 6, 1138);
    			attr_dev(a0, "href", "/settings");
    			add_location(a0, file, 37, 7, 1215);
    			attr_dev(div1, "class", "item");
    			add_location(div1, file, 36, 6, 1188);
    			attr_dev(input, "type", "hidden");
    			attr_dev(input, "name", "delete");
    			input.value = "YES";
    			add_location(input, file, 43, 8, 1366);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "onclick", "$(this).closest('form').submit();return false;");
    			add_location(a1, file, 44, 8, 1425);
    			attr_dev(form, "action", "/api/delete");
    			attr_dev(form, "method", "post");
    			add_location(form, file, 42, 7, 1315);
    			attr_dev(div2, "class", "item");
    			add_location(div2, file, 41, 6, 1288);
    			attr_dev(a2, "href", "/logout");
    			add_location(a2, file, 50, 7, 1598);
    			attr_dev(div3, "class", "item");
    			add_location(div3, file, 49, 6, 1571);
    			attr_dev(div4, "class", "usermenu");
    			set_style(div4, "display", "none");
    			add_location(div4, file, 34, 5, 1085);
    			if (!src_url_equal(img.src, img_src_value = /*userdata*/ ctx[1].avatar)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			add_location(img, file, 55, 5, 1679);
    			attr_dev(div5, "id", "userinfo");
    			add_location(div5, file, 33, 4, 1059);
    			attr_dev(a3, "class", "btn btn-primary");
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "role", "button");
    			add_location(a3, file, 57, 4, 1767);
    			attr_dev(a4, "class", "btn btn-primary");
    			attr_dev(a4, "href", a4_href_value = "/p/" + /*userdata*/ ctx[1].profileId);
    			attr_dev(a4, "role", "button");
    			add_location(a4, file, 58, 4, 1840);
    			attr_dev(a5, "class", "btn btn-primary");
    			attr_dev(a5, "href", "/templates");
    			attr_dev(a5, "role", "button");
    			add_location(a5, file, 59, 4, 1938);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, a0);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			append_dev(div2, form);
    			append_dev(form, input);
    			append_dev(form, t3);
    			append_dev(form, a1);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, a2);
    			append_dev(div5, t7);
    			append_dev(div5, img);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, a3, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, a4, anchor);
    			append_dev(a4, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, a5, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "click", /*toggleusermenu*/ ctx[2], false, false, false),
    					action_destroyer(link.call(null, a3)),
    					action_destroyer(link.call(null, a4)),
    					action_destroyer(link.call(null, a5))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userdata*/ 2 && !src_url_equal(img.src, img_src_value = /*userdata*/ ctx[1].avatar)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*userdata*/ 2 && a4_href_value !== (a4_href_value = "/p/" + /*userdata*/ ctx[1].profileId)) {
    				attr_dev(a4, "href", a4_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(a3);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(a4);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(a5);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:12) {#if userdata.id}",
    		ctx
    	});

    	return block;
    }

    // (63:8) <Router {url}>
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let t3;
    	let route4;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/templates",
    				component: Templates,
    				userdata: /*userdata*/ ctx[1],
    				setTemplate: /*setTemplate*/ ctx[3]
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/drip",
    				component: Drip,
    				userdata: /*userdata*/ ctx[1]
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/settings",
    				component: Settings,
    				userdata: /*userdata*/ ctx[1]
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/p/:profileId",
    				component: Profile
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "*",
    				component: Home,
    				userdata: /*userdata*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};
    			if (dirty & /*userdata*/ 2) route0_changes.userdata = /*userdata*/ ctx[1];
    			route0.$set(route0_changes);
    			const route1_changes = {};
    			if (dirty & /*userdata*/ 2) route1_changes.userdata = /*userdata*/ ctx[1];
    			route1.$set(route1_changes);
    			const route2_changes = {};
    			if (dirty & /*userdata*/ 2) route2_changes.userdata = /*userdata*/ ctx[1];
    			route2.$set(route2_changes);
    			const route4_changes = {};
    			if (dirty & /*userdata*/ 2) route4_changes.userdata = /*userdata*/ ctx[1];
    			route4.$set(route4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(63:8) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div2;
    	let div1;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let t3;
    	let router;
    	let current;
    	let if_block = /*userdata*/ ctx[1].id && create_if_block(ctx);

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Profile";
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(router.$$.fragment);
    			attr_dev(img, "class", "center-block");
    			if (!src_url_equal(img.src, img_src_value = "/css/img/logo.png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "width", "300px");
    			set_style(img, "height", "auto");
    			set_style(img, "margin-top", "0");
    			attr_dev(img, "alt", "logo");
    			add_location(img, file, 28, 5, 871);
    			attr_dev(a, "href", "https://discord.gg/rsplatoon");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 27, 4, 809);
    			add_location(h1, file, 30, 4, 995);
    			add_location(div0, file, 26, 3, 798);
    			attr_dev(div1, "class", "jumbotron");
    			add_location(div1, file, 25, 2, 770);
    			attr_dev(div2, "class", "container");
    			set_style(div2, "margin-bottom", "100px");
    			set_style(div2, "padding-left", "0");
    			set_style(div2, "padding-right", "0");
    			add_location(div2, file, 24, 1, 683);
    			add_location(main, file, 23, 0, 674);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div2, t3);
    			mount_component(router, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*userdata*/ ctx[1].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope, userdata*/ 18) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { url = '' } = $$props;
    	let userdata = {};
    	onMount(async () => $$invalidate(1, userdata = await userData()));
    	const toggleusermenu = () => jQuery(".usermenu").slideToggle();

    	const setTemplate = id => {
    		$$invalidate(1, userdata.template = id, userdata);
    	};

    	const writable_props = ['url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Router,
    		Route,
    		link,
    		userData,
    		Home,
    		Profile,
    		Settings,
    		Drip,
    		Templates,
    		url,
    		userdata,
    		toggleusermenu,
    		setTemplate
    	});

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    		if ('userdata' in $$props) $$invalidate(1, userdata = $$props.userdata);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, userdata, toggleusermenu, setTemplate];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
