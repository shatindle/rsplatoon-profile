
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
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.46.3 */

    function create_fragment$6(ctx) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$6.name
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
    function create_if_block$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$3];
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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block$3(ctx) {
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
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$3(ctx) {
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$5(ctx);

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
    					if_block = create_if_block$5(ctx);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$5.name
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

    const userData = async () => (await fetch("/api/user")).json();
    const templateList = async () => (await fetch("/api/templates")).json();

    /* src\pages\Home.svelte generated by Svelte v3.46.3 */

    const { console: console_1$2 } = globals;
    const file$4 = "src\\pages\\Home.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (183:0) {:else}
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
    			add_location(button, file$4, 185, 12, 7728);
    			attr_dev(a, "id", "loginDiscord");
    			attr_dev(a, "href", a_href_value = /*userdata*/ ctx[0].loginUrl);
    			add_location(a, file$4, 184, 8, 7668);
    			attr_dev(div, "class", "nameentry needtologin");
    			add_location(div, file$4, 183, 4, 7623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, button);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userdata, options*/ 3 && a_href_value !== (a_href_value = /*userdata*/ ctx[0].loginUrl)) {
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
    		source: "(183:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (108:0) {#if userdata.id}
    function create_if_block$4(ctx) {
    	let div12;
    	let div1;
    	let div0;
    	let t0;
    	let div11;
    	let div2;
    	let t1;
    	let div10;
    	let form;
    	let div9;
    	let h30;
    	let t3;
    	let input0;
    	let t4;
    	let h31;
    	let t6;
    	let input1;
    	let t7;
    	let div8;
    	let div4;
    	let div3;
    	let h32;
    	let t9;
    	let div7;
    	let div5;
    	let t10;
    	let div6;
    	let img;
    	let img_src_value;
    	let t11;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = /*userdata*/ ctx[0].profileId && create_if_block_3$1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*userdata*/ ctx[0].drip) return create_if_block_2$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*options*/ ctx[1].length > 0 && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div11 = element("div");
    			div2 = element("div");
    			if_block1.c();
    			t1 = space();
    			div10 = element("div");
    			form = element("form");
    			div9 = element("div");
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
    			div8 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Card Template";
    			t9 = space();
    			div7 = element("div");
    			div5 = element("div");
    			if (if_block2) if_block2.c();
    			t10 = space();
    			div6 = element("div");
    			img = element("img");
    			t11 = space();
    			button = element("button");
    			button.textContent = "Save";
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$4, 110, 12, 3769);
    			attr_dev(div1, "class", "row");
    			set_style(div1, "margin-bottom", "14px");
    			add_location(div1, file$4, 109, 8, 3709);
    			attr_dev(div2, "class", "col-12 col-md-6");
    			add_location(div2, file$4, 130, 12, 4863);
    			attr_dev(h30, "for", "name");
    			add_location(h30, file$4, 148, 24, 5736);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "placeholder", "In game name");
    			attr_dev(input0, "maxlength", "10");
    			add_location(input0, file$4, 149, 24, 5790);
    			attr_dev(h31, "for", "friendcode");
    			add_location(h31, file$4, 151, 24, 5975);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "name", "friendcode");
    			attr_dev(input1, "id", "friendcode");
    			attr_dev(input1, "placeholder", "0000-0000-0000");
    			add_location(input1, file$4, 152, 24, 6038);
    			attr_dev(h32, "for", "template");
    			add_location(h32, file$4, 157, 36, 6378);
    			attr_dev(div3, "class", "col");
    			add_location(div3, file$4, 156, 32, 6323);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$4, 155, 28, 6272);
    			attr_dev(div5, "class", "col-12 col-md-6");
    			add_location(div5, file$4, 161, 32, 6572);
    			if (!src_url_equal(img.src, img_src_value = /*userdata*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			set_style(img, "width", "100%");
    			attr_dev(img, "id", "templateimage");
    			attr_dev(img, "alt", "template");
    			add_location(img, file$4, 171, 36, 7219);
    			attr_dev(div6, "class", "col-12 col-md-6");
    			add_location(div6, file$4, 170, 32, 7152);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file$4, 160, 28, 6521);
    			attr_dev(div8, "class", "");
    			add_location(div8, file$4, 154, 24, 6228);
    			attr_dev(button, "id", "submit");
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$4, 176, 24, 7436);
    			attr_dev(div9, "class", "form-group");
    			add_location(div9, file$4, 147, 20, 5686);
    			attr_dev(form, "action", "/api/save");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "id", "save-form");
    			add_location(form, file$4, 146, 16, 5610);
    			attr_dev(div10, "class", "col-12 col-md-6");
    			add_location(div10, file$4, 145, 12, 5563);
    			attr_dev(div11, "class", "row");
    			add_location(div11, file$4, 129, 8, 4832);
    			attr_dev(div12, "class", "container");
    			add_location(div12, file$4, 108, 4, 3676);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div1);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div12, t0);
    			append_dev(div12, div11);
    			append_dev(div11, div2);
    			if_block1.m(div2, null);
    			append_dev(div11, t1);
    			append_dev(div11, div10);
    			append_dev(div10, form);
    			append_dev(form, div9);
    			append_dev(div9, h30);
    			append_dev(div9, t3);
    			append_dev(div9, input0);
    			set_input_value(input0, /*userdata*/ ctx[0].name);
    			append_dev(div9, t4);
    			append_dev(div9, h31);
    			append_dev(div9, t6);
    			append_dev(div9, input1);
    			set_input_value(input1, /*userdata*/ ctx[0].friendCode);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			append_dev(div8, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h32);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			if (if_block2) if_block2.m(div5, null);
    			append_dev(div7, t10);
    			append_dev(div7, div6);
    			append_dev(div6, img);
    			append_dev(div9, t11);
    			append_dev(div9, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*userdata*/ ctx[0].profileId) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
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

    			if (dirty & /*userdata, options*/ 3 && input0.value !== /*userdata*/ ctx[0].name) {
    				set_input_value(input0, /*userdata*/ ctx[0].name);
    			}

    			if (dirty & /*userdata, options*/ 3 && input1.value !== /*userdata*/ ctx[0].friendCode) {
    				set_input_value(input1, /*userdata*/ ctx[0].friendCode);
    			}

    			if (/*options*/ ctx[1].length > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$2(ctx);
    					if_block2.c();
    					if_block2.m(div5, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*userdata, options*/ 3 && !src_url_equal(img.src, img_src_value = /*userdata*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(108:0) {#if userdata.id}",
    		ctx
    	});

    	return block;
    }

    // (112:16) {#if userdata.profileId}
    function create_if_block_3$1(ctx) {
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
    			add_location(label, file$4, 113, 24, 3882);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control");
    			input.value = input_value_value = "" + (/*userdata*/ ctx[0].baseUrl + "/p/" + /*userdata*/ ctx[0].profileId + "?_v=" + new Date().valueOf());
    			attr_dev(input, "id", "copy-input");
    			input.readOnly = true;
    			add_location(input, file$4, 115, 32, 4043);
    			attr_dev(i, "class", "fa fa-copy");
    			add_location(i, file$4, 121, 40, 4592);
    			attr_dev(button, "class", "btn btn-default");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "id", "copy-button");
    			attr_dev(button, "data-toggle", "tooltip");
    			attr_dev(button, "data-placement", "button");
    			attr_dev(button, "title", "Copy to Clipboard");
    			add_location(button, file$4, 118, 32, 4341);
    			attr_dev(span, "class", "input-group-btn");
    			add_location(span, file$4, 117, 32, 4277);
    			attr_dev(div, "class", "input-group");
    			add_location(div, file$4, 114, 24, 3957);
    			add_location(form, file$4, 112, 20, 3850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label);
    			append_dev(form, t1);
    			append_dev(form, div);
    			append_dev(div, input);
    			/*input_binding*/ ctx[5](input);
    			append_dev(div, t2);
    			append_dev(div, span);
    			append_dev(span, button);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*copyToClipboard*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userdata, options*/ 3 && input_value_value !== (input_value_value = "" + (/*userdata*/ ctx[0].baseUrl + "/p/" + /*userdata*/ ctx[0].profileId + "?_v=" + new Date().valueOf())) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			/*input_binding*/ ctx[5](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(112:16) {#if userdata.profileId}",
    		ctx
    	});

    	return block;
    }

    // (138:16) {:else}
    function create_else_block$2(ctx) {
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
    			add_location(h3, file$4, 139, 24, 5281);
    			attr_dev(a, "class", "btn btn-primary edit-drip");
    			attr_dev(a, "href", "/drip");
    			attr_dev(a, "role", "button");
    			add_location(a, file$4, 140, 24, 5323);
    			add_location(div, file$4, 138, 20, 5250);
    			if (!src_url_equal(img.src, img_src_value = "/css/img/nodrip.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "drip");
    			add_location(img, file$4, 142, 20, 5445);
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(138:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (132:16) {#if userdata.drip}
    function create_if_block_2$1(ctx) {
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
    			add_location(h3, file$4, 133, 24, 4982);
    			attr_dev(a, "class", "btn btn-primary edit-drip");
    			attr_dev(a, "href", "/drip");
    			attr_dev(a, "role", "button");
    			add_location(a, file$4, 134, 24, 5026);
    			add_location(div, file$4, 132, 20, 4951);
    			if (!src_url_equal(img.src, img_src_value = /*userdata*/ ctx[0].drip)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "drip");
    			add_location(img, file$4, 136, 20, 5148);
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
    			if (dirty & /*userdata, options*/ 3 && !src_url_equal(img.src, img_src_value = /*userdata*/ ctx[0].drip)) {
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(132:16) {#if userdata.drip}",
    		ctx
    	});

    	return block;
    }

    // (163:36) {#if options.length > 0}
    function create_if_block_1$2(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*options*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "form-control");
    			attr_dev(select, "name", "template");
    			if (/*userdata*/ ctx[0].template === void 0) add_render_callback(() => /*select_change_handler*/ ctx[8].call(select));
    			add_location(select, file$4, 163, 36, 6701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*userdata*/ ctx[0].template);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 2) {
    				each_value = /*options*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*userdata, options*/ 3) {
    				select_option(select, /*userdata*/ ctx[0].template);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(163:36) {#if options.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (165:40) {#each options as option}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[9].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[9].value;
    			option.value = option.__value;
    			add_location(option, file$4, 165, 40, 6888);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 2 && t_value !== (t_value = /*option*/ ctx[9].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*options*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[9].value)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(165:40) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*userdata*/ ctx[0].id) return create_if_block$4;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			add_location(div, file$4, 106, 0, 3646);
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
    		id: create_fragment$4.name,
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let { userdata = {} } = $$props;
    	let { location = "" } = $$props;
    	let options = [], copyInput;

    	onMount(async () => {
    		$$invalidate(1, options = await templateList());

    		jQuery("#save-form").on("submit", function () {
    			jQuery("#submit").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Loading...');
    		});
    	});

    	beforeUpdate(() => {
    		$$invalidate(0, userdata.friendCode = cleanFriendCode(userdata.friendCode), userdata);

    		switch (userdata.template) {
    			case "s3-agent3":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s3_agent3.png", userdata);
    				break;
    			case "s3-marie":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s3_marie.png", userdata);
    				break;
    			case "s2-chaos-order":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s2_chaos_order.png", userdata);
    				break;
    			case "s2-order-chaos":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s2_order_chaos.png", userdata);
    				break;
    			case "s2-octavio":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s2_octavio.png", userdata);
    				break;
    			case "user-coffee-squid":
    				$$invalidate(0, userdata.image = "/css/img/canvas_user_coffee_squid.png", userdata);
    				break;
    			case "s2-black-firefin":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s2_black_firefin.png", userdata);
    				break;
    			case "s2-toni-kensa-inverted":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s2_toni_kensa_inverted.png", userdata);
    				break;
    			case "s2-toni-kensa":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s2_toni_kensa.png", userdata);
    				break;
    			case "s1-blue-orange":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s1_blue_orange.png", userdata);
    				break;
    			case "s1-orange-blue":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s1_orange_blue.png", userdata);
    				break;
    			case "s2-pink-green":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s2_pink_green.png", userdata);
    				break;
    			case "s2-green-pink":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s2_green_pink.png", userdata);
    				break;
    			case "s3-indigo-yellow":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s3_indigo_yellow.png", userdata);
    				break;
    			case "user-black-gold":
    				$$invalidate(0, userdata.image = "/css/img/canvas_user_black_gold.png", userdata);
    				break;
    			case "s3-callie":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s3_callie.png", userdata);
    				break;
    			case "s2-sanitized-pink":
    				$$invalidate(0, userdata.image = "/css/img/canvas_s2_sanitized_pink.png", userdata);
    				break;
    			case "s3-yellow-indigo":
    			default:
    				$$invalidate(0, userdata.image = "/css/img/canvas_s3_yellow_indigo.png", userdata);
    				break;
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
    			$$invalidate(2, copyInput);
    		});
    	}

    	function input0_input_handler() {
    		userdata.name = this.value;
    		$$invalidate(0, userdata);
    		$$invalidate(1, options);
    	}

    	function input1_input_handler() {
    		userdata.friendCode = this.value;
    		$$invalidate(0, userdata);
    		$$invalidate(1, options);
    	}

    	function select_change_handler() {
    		userdata.template = select_value(this);
    		$$invalidate(0, userdata);
    		$$invalidate(1, options);
    	}

    	$$self.$$set = $$props => {
    		if ('userdata' in $$props) $$invalidate(0, userdata = $$props.userdata);
    		if ('location' in $$props) $$invalidate(4, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		beforeUpdate,
    		templateList,
    		userdata,
    		location,
    		options,
    		copyInput,
    		cleanFriendCode,
    		copyToClipboard
    	});

    	$$self.$inject_state = $$props => {
    		if ('userdata' in $$props) $$invalidate(0, userdata = $$props.userdata);
    		if ('location' in $$props) $$invalidate(4, location = $$props.location);
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('copyInput' in $$props) $$invalidate(2, copyInput = $$props.copyInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		userdata,
    		options,
    		copyInput,
    		copyToClipboard,
    		location,
    		input_binding,
    		input0_input_handler,
    		input1_input_handler,
    		select_change_handler
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { userdata: 0, location: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
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
    const file$3 = "src\\pages\\Profile.svelte";

    // (38:12) {:else}
    function create_else_block$1(ctx) {
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
    			add_location(h3, file$3, 39, 20, 1039);
    			add_location(div, file$3, 38, 16, 1012);
    			if (!src_url_equal(img.src, img_src_value = "/css/img/nodrip.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "no drip");
    			add_location(img, file$3, 41, 16, 1097);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(38:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:12) {#if profile.drip}
    function create_if_block$3(ctx) {
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
    			add_location(h3, file$3, 34, 20, 858);
    			add_location(div, file$3, 33, 16, 831);
    			if (!src_url_equal(img.src, img_src_value = /*profile*/ ctx[0].drip)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "drip");
    			add_location(img, file$3, 36, 16, 919);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(33:12) {#if profile.drip}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    		if (/*profile*/ ctx[0].drip) return create_if_block$3;
    		return create_else_block$1;
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
    			add_location(h30, file$3, 27, 12, 605);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$3, 26, 8, 574);
    			attr_dev(div1, "class", "row");
    			set_style(div1, "margin-bottom", "14px");
    			add_location(div1, file$3, 25, 4, 518);
    			attr_dev(div2, "class", "col-12 col-md-6");
    			add_location(div2, file$3, 31, 8, 752);
    			attr_dev(h31, "for", "copy-input");
    			add_location(h31, file$3, 46, 16, 1273);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control");
    			input.value = input_value_value = /*profile*/ ctx[0].friendCode;
    			attr_dev(input, "id", "copy-input");
    			input.readOnly = true;
    			add_location(input, file$3, 48, 22, 1404);
    			attr_dev(i, "class", "fa fa-copy");
    			add_location(i, file$3, 54, 30, 1850);
    			attr_dev(button, "class", "btn btn-default");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "id", "copy-button");
    			attr_dev(button, "data-toggle", "tooltip");
    			attr_dev(button, "data-placement", "button");
    			attr_dev(button, "title", "Copy to Clipboard");
    			add_location(button, file$3, 51, 24, 1625);
    			attr_dev(span, "class", "input-group-btn");
    			add_location(span, file$3, 50, 22, 1569);
    			attr_dev(div3, "class", "input-group");
    			add_location(div3, file$3, 47, 16, 1328);
    			add_location(form, file$3, 45, 12, 1249);
    			attr_dev(div4, "class", "col-12 col-md-6");
    			add_location(div4, file$3, 44, 8, 1206);
    			attr_dev(div5, "class", "row");
    			set_style(div5, "margin-bottom", "14px");
    			add_location(div5, file$3, 30, 4, 696);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$3, 24, 0, 489);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { profileId: 3, location: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$3.name
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

    const file$2 = "src\\pages\\Settings.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[20] = list;
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (41:4) {#if settings.isAdmin}
    function create_if_block_2(ctx) {
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
    	let if_block = /*settings*/ ctx[0].allbots && /*settings*/ ctx[0].allbots.length && create_if_block_3(ctx);

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
    			add_location(h3, file$2, 46, 28, 1321);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "name", "name");
    			input0.value = "";
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "placeholder", "User ID");
    			add_location(input0, file$2, 47, 28, 1400);
    			add_location(div0, file$2, 45, 24, 1286);
    			attr_dev(input1, "class", "form-check-input");
    			attr_dev(input1, "type", "checkbox");
    			input1.value = "getProfile";
    			attr_dev(input1, "name", "permissions");
    			set_style(input1, "width", "auto");
    			add_location(input1, file$2, 50, 28, 1607);
    			attr_dev(label0, "class", "form-check-label");
    			attr_dev(label0, "for", "flexCheckDefault");
    			add_location(label0, file$2, 51, 28, 1742);
    			attr_dev(div1, "class", "form-check");
    			add_location(div1, file$2, 49, 24, 1553);
    			attr_dev(input2, "class", "form-check-input");
    			attr_dev(input2, "type", "checkbox");
    			input2.value = "saveFriendCode";
    			attr_dev(input2, "name", "permissions");
    			set_style(input2, "width", "auto");
    			add_location(input2, file$2, 56, 28, 1992);
    			attr_dev(label1, "class", "form-check-label");
    			attr_dev(label1, "for", "flexCheckDefault");
    			add_location(label1, file$2, 57, 28, 2131);
    			attr_dev(div2, "class", "form-check");
    			add_location(div2, file$2, 55, 24, 1938);
    			attr_dev(input3, "class", "form-check-input");
    			attr_dev(input3, "type", "checkbox");
    			input3.value = "saveUsername";
    			attr_dev(input3, "name", "permissions");
    			set_style(input3, "width", "auto");
    			add_location(input3, file$2, 62, 28, 2386);
    			attr_dev(label2, "class", "form-check-label");
    			attr_dev(label2, "for", "flexCheckDefault");
    			add_location(label2, file$2, 63, 28, 2523);
    			attr_dev(div3, "class", "form-check");
    			add_location(div3, file$2, 61, 24, 2332);
    			attr_dev(input4, "class", "form-check-input");
    			attr_dev(input4, "type", "checkbox");
    			input4.value = "saveDrip";
    			attr_dev(input4, "name", "permissions");
    			set_style(input4, "width", "auto");
    			add_location(input4, file$2, 68, 28, 2775);
    			attr_dev(label3, "class", "form-check-label");
    			attr_dev(label3, "for", "flexCheckDefault");
    			add_location(label3, file$2, 69, 28, 2908);
    			attr_dev(div4, "class", "form-check");
    			add_location(div4, file$2, 67, 24, 2721);
    			attr_dev(input5, "class", "form-check-input");
    			attr_dev(input5, "type", "checkbox");
    			input5.value = "deleteProfile";
    			attr_dev(input5, "name", "permissions");
    			set_style(input5, "width", "auto");
    			add_location(input5, file$2, 74, 28, 3156);
    			attr_dev(label4, "class", "form-check-label");
    			attr_dev(label4, "for", "flexCheckDefault");
    			add_location(label4, file$2, 75, 28, 3294);
    			attr_dev(div5, "class", "form-check");
    			add_location(div5, file$2, 73, 24, 3102);
    			attr_dev(button, "id", "submit");
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$2, 79, 24, 3493);
    			attr_dev(div6, "class", "form-group");
    			add_location(div6, file$2, 44, 20, 1236);
    			attr_dev(form, "action", "/api/settings/grantkey");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "id", "save-form");
    			add_location(form, file$2, 43, 16, 1147);
    			attr_dev(div7, "class", "col");
    			add_location(div7, file$2, 42, 12, 1112);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file$2, 41, 8, 1081);
    			attr_dev(th0, "scope", "col");
    			add_location(th0, file$2, 92, 40, 4089);
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$2, 93, 40, 4156);
    			attr_dev(th2, "scope", "col");
    			add_location(th2, file$2, 94, 40, 4230);
    			attr_dev(th3, "scope", "col");
    			add_location(th3, file$2, 95, 40, 4300);
    			attr_dev(th4, "scope", "col");
    			add_location(th4, file$2, 96, 40, 4372);
    			attr_dev(th5, "scope", "col");
    			add_location(th5, file$2, 97, 40, 4444);
    			attr_dev(th6, "scope", "col");
    			add_location(th6, file$2, 98, 40, 4521);
    			attr_dev(th7, "scope", "col");
    			add_location(th7, file$2, 99, 40, 4594);
    			attr_dev(th8, "scope", "col");
    			add_location(th8, file$2, 100, 40, 4669);
    			attr_dev(th9, "scope", "col");
    			add_location(th9, file$2, 101, 40, 4739);
    			attr_dev(th10, "scope", "col");
    			add_location(th10, file$2, 102, 40, 4808);
    			attr_dev(th11, "scope", "col");
    			add_location(th11, file$2, 103, 40, 4876);
    			add_location(tr, file$2, 91, 36, 4043);
    			add_location(thead, file$2, 90, 32, 3998);
    			add_location(tbody, file$2, 106, 32, 5024);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$2, 89, 28, 3929);
    			attr_dev(div9, "class", "col");
    			add_location(div9, file$2, 88, 24, 3882);
    			attr_dev(div10, "class", "row no-gutters");
    			add_location(div10, file$2, 87, 20, 3828);
    			attr_dev(div11, "class", "container");
    			set_style(div11, "padding", "0");
    			add_location(div11, file$2, 86, 16, 3765);
    			attr_dev(div12, "class", "col");
    			add_location(div12, file$2, 85, 12, 3730);
    			attr_dev(div13, "class", "row no-gutters");
    			set_style(div13, "margin-top", "14px");
    			add_location(div13, file$2, 84, 8, 3663);
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
    					if_block = create_if_block_3(ctx);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(41:4) {#if settings.isAdmin}",
    		ctx
    	});

    	return block;
    }

    // (108:36) {#if settings.allbots && settings.allbots.length}
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let each_value = /*settings*/ ctx[0].allbots;
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
    			if (dirty & /*revokeKey, settings, resetKey, saveRow*/ 29) {
    				each_value = /*settings*/ ctx[0].allbots;
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(108:36) {#if settings.allbots && settings.allbots.length}",
    		ctx
    	});

    	return block;
    }

    // (109:36) {#each settings.allbots as bot}
    function create_each_block(ctx) {
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
    			add_location(input0, file$2, 112, 44, 5391);
    			attr_dev(th, "scope", "row");
    			add_location(th, file$2, 110, 40, 5271);
    			attr_dev(input1, "type", "hidden");
    			attr_dev(input1, "name", "getProfile");
    			input1.value = "0";
    			add_location(input1, file$2, 116, 48, 5658);
    			attr_dev(input2, "class", "form-check-input");
    			attr_dev(input2, "type", "checkbox");
    			input2.__value = "1";
    			input2.value = input2.__value;
    			attr_dev(input2, "name", "getProfile");
    			set_style(input2, "width", "auto");
    			add_location(input2, file$2, 117, 48, 5759);
    			attr_dev(div0, "class", "form-check");
    			add_location(div0, file$2, 115, 44, 5584);
    			add_location(td0, file$2, 114, 40, 5534);
    			attr_dev(input3, "type", "hidden");
    			attr_dev(input3, "name", "saveFriendCode");
    			input3.value = "0";
    			add_location(input3, file$2, 122, 48, 6149);
    			attr_dev(input4, "class", "form-check-input");
    			attr_dev(input4, "type", "checkbox");
    			input4.__value = "1";
    			input4.value = input4.__value;
    			attr_dev(input4, "name", "saveFriendCode");
    			set_style(input4, "width", "auto");
    			add_location(input4, file$2, 123, 48, 6254);
    			attr_dev(div1, "class", "form-check");
    			add_location(div1, file$2, 121, 44, 6075);
    			add_location(td1, file$2, 120, 40, 6025);
    			attr_dev(input5, "type", "hidden");
    			attr_dev(input5, "name", "saveUsername");
    			input5.value = "0";
    			add_location(input5, file$2, 128, 48, 6652);
    			attr_dev(input6, "class", "form-check-input");
    			attr_dev(input6, "type", "checkbox");
    			input6.__value = "1";
    			input6.value = input6.__value;
    			attr_dev(input6, "name", "saveUsername");
    			set_style(input6, "width", "auto");
    			add_location(input6, file$2, 129, 48, 6755);
    			attr_dev(div2, "class", "form-check");
    			add_location(div2, file$2, 127, 44, 6578);
    			add_location(td2, file$2, 126, 40, 6528);
    			attr_dev(input7, "type", "hidden");
    			attr_dev(input7, "name", "saveDrip");
    			input7.value = "0";
    			add_location(input7, file$2, 134, 48, 7149);
    			attr_dev(input8, "class", "form-check-input");
    			attr_dev(input8, "type", "checkbox");
    			input8.__value = "1";
    			input8.value = input8.__value;
    			attr_dev(input8, "name", "saveDrip");
    			set_style(input8, "width", "auto");
    			add_location(input8, file$2, 135, 48, 7248);
    			attr_dev(div3, "class", "form-check");
    			add_location(div3, file$2, 133, 44, 7075);
    			add_location(td3, file$2, 132, 40, 7025);
    			attr_dev(input9, "type", "hidden");
    			attr_dev(input9, "name", "deleteProfile");
    			input9.value = "0";
    			add_location(input9, file$2, 140, 48, 7634);
    			attr_dev(input10, "class", "form-check-input");
    			attr_dev(input10, "type", "checkbox");
    			input10.__value = "1";
    			input10.value = input10.__value;
    			attr_dev(input10, "name", "deleteProfile");
    			set_style(input10, "width", "auto");
    			add_location(input10, file$2, 141, 48, 7738);
    			attr_dev(div4, "class", "form-check");
    			add_location(div4, file$2, 139, 44, 7560);
    			add_location(td4, file$2, 138, 40, 7510);
    			attr_dev(input11, "type", "hidden");
    			attr_dev(input11, "name", "teamQuery");
    			input11.value = "0";
    			add_location(input11, file$2, 146, 48, 8134);
    			attr_dev(input12, "class", "form-check-input");
    			attr_dev(input12, "type", "checkbox");
    			input12.__value = "1";
    			input12.value = input12.__value;
    			attr_dev(input12, "name", "teamQuery");
    			set_style(input12, "width", "auto");
    			add_location(input12, file$2, 147, 48, 8234);
    			attr_dev(div5, "class", "form-check");
    			add_location(div5, file$2, 145, 44, 8060);
    			add_location(td5, file$2, 144, 40, 8010);
    			attr_dev(input13, "type", "hidden");
    			attr_dev(input13, "name", "teamWebhook");
    			input13.value = "0";
    			add_location(input13, file$2, 152, 48, 8622);
    			attr_dev(input14, "class", "form-check-input");
    			attr_dev(input14, "type", "checkbox");
    			input14.__value = "1";
    			input14.value = input14.__value;
    			attr_dev(input14, "name", "teamWebhook");
    			set_style(input14, "width", "auto");
    			add_location(input14, file$2, 153, 48, 8724);
    			attr_dev(div6, "class", "form-check");
    			add_location(div6, file$2, 151, 44, 8548);
    			add_location(td6, file$2, 150, 40, 8498);
    			add_location(td7, file$2, 156, 40, 8992);
    			attr_dev(i0, "class", "fa fa-cloud-upload");
    			add_location(i0, file$2, 160, 139, 9287);
    			attr_dev(button0, "class", "btn btn-primary");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$2, 160, 44, 9192);
    			add_location(td8, file$2, 159, 40, 9142);
    			attr_dev(i1, "class", "fa fa-refresh");
    			add_location(i1, file$2, 163, 140, 9585);
    			attr_dev(button1, "class", "btn btn-primary");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$2, 163, 44, 9489);
    			attr_dev(td9, "class", "text-center");
    			add_location(td9, file$2, 162, 40, 9419);
    			attr_dev(i2, "class", "fa fa-times");
    			add_location(i2, file$2, 166, 141, 9879);
    			attr_dev(button2, "class", "btn btn-primary");
    			attr_dev(button2, "type", "button");
    			add_location(button2, file$2, 166, 44, 9782);
    			attr_dev(td10, "class", "text-center");
    			add_location(td10, file$2, 165, 40, 9712);
    			add_location(tr, file$2, 109, 36, 5225);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(109:36) {#each settings.allbots as bot}",
    		ctx
    	});

    	return block;
    }

    // (180:4) {#if settings.botKey}
    function create_if_block$2(ctx) {
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
    	let if_block = /*settings*/ ctx[0].teamWebhookAllowed && create_if_block_1$1(ctx);

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
    			add_location(label, file$2, 183, 20, 10466);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control");
    			input.value = input_value_value = /*settings*/ ctx[0].botKey;
    			attr_dev(input, "id", "copy-input");
    			input.readOnly = true;
    			add_location(input, file$2, 185, 26, 10613);
    			attr_dev(i0, "class", "fa fa-copy");
    			add_location(i0, file$2, 191, 34, 11080);
    			attr_dev(button0, "class", "btn btn-default");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "id", "copy-button");
    			attr_dev(button0, "data-toggle", "tooltip");
    			attr_dev(button0, "data-placement", "button");
    			attr_dev(button0, "title", "Copy to Clipboard");
    			add_location(button0, file$2, 188, 28, 10843);
    			attr_dev(span, "class", "input-group-btn");
    			add_location(span, file$2, 187, 26, 10783);
    			attr_dev(div0, "class", "input-group");
    			attr_dev(div0, "onclick", "copyToClipboard()");
    			add_location(div0, file$2, 184, 20, 10532);
    			add_location(form0, file$2, 182, 16, 10438);
    			attr_dev(div1, "class", "col-11");
    			add_location(div1, file$2, 181, 12, 10400);
    			attr_dev(i1, "class", "fa fa-refresh");
    			add_location(i1, file$2, 199, 104, 11458);
    			attr_dev(button1, "class", "btn btn-primary");
    			attr_dev(button1, "type", "submit");
    			set_style(button1, "bottom", "4px");
    			set_style(button1, "position", "absolute");
    			add_location(button1, file$2, 199, 20, 11374);
    			attr_dev(form1, "action", "/settings/resetkey");
    			attr_dev(form1, "method", "post");
    			add_location(form1, file$2, 198, 16, 11304);
    			attr_dev(div2, "class", "col-1");
    			add_location(div2, file$2, 197, 12, 11267);
    			attr_dev(div3, "class", "row");
    			set_style(div3, "margin-top", "14px");
    			add_location(div3, file$2, 180, 8, 10344);
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
    					if_block = create_if_block_1$1(ctx);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(180:4) {#if settings.botKey}",
    		ctx
    	});

    	return block;
    }

    // (204:8) {#if settings.teamWebhookAllowed}
    function create_if_block_1$1(ctx) {
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
    			add_location(label, file$2, 207, 28, 11821);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "name", "webhook");
    			input.value = input_value_value = /*settings*/ ctx[0].teamWebhookUrl;
    			attr_dev(input, "id", "webhook");
    			attr_dev(input, "placeholder", "Your webhook URL");
    			add_location(input, file$2, 208, 28, 11895);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$2, 206, 24, 11774);
    			attr_dev(div1, "class", "row");
    			set_style(div1, "margin-top", "14px");
    			add_location(div1, file$2, 205, 16, 11706);
    			attr_dev(button, "class", "btn btn-primary");
    			attr_dev(button, "type", "submit");
    			set_style(button, "float", "right");
    			add_location(button, file$2, 213, 24, 12209);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$2, 212, 20, 12166);
    			attr_dev(div3, "class", "row");
    			set_style(div3, "margin-top", "14px");
    			add_location(div3, file$2, 211, 16, 12102);
    			attr_dev(form, "action", "/api/settings/saveteamwebhook");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "id", "save-form");
    			add_location(form, file$2, 204, 12, 11614);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(204:8) {#if settings.teamWebhookAllowed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t;
    	let if_block0 = /*settings*/ ctx[0].isAdmin && create_if_block_2(ctx);
    	let if_block1 = /*settings*/ ctx[0].botKey && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "container");
    			add_location(div, file$2, 39, 0, 1020);
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
    					if_block0 = create_if_block_2(ctx);
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
    					if_block1 = create_if_block$2(ctx);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { userdata: 5, location: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$2.name
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
    const file$1 = "src\\pages\\Drip.svelte";

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
    			add_location(img, file$1, 131, 20, 4569);
    			attr_dev(div, "class", "drip-img");
    			add_location(div, file$1, 130, 16, 4525);
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
    function create_if_block_1(ctx) {
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
    			add_location(i0, file$1, 117, 36, 3949);
    			attr_dev(a, "href", "/");
    			add_location(a, file$1, 117, 24, 3937);
    			add_location(h3, file$1, 116, 20, 3907);
    			add_location(div0, file$1, 115, 16, 3880);
    			if (!src_url_equal(img.src, img_src_value = /*dripdata*/ ctx[0].drip)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "drip");
    			add_location(img, file$1, 122, 20, 4135);
    			attr_dev(i1, "class", "fa fa-close");
    			add_location(i1, file$1, 125, 28, 4371);
    			attr_dev(button, "type", "submit");
    			button.value = "submit";
    			add_location(button, file$1, 124, 24, 4304);
    			attr_dev(form, "action", "/api/drip/delete");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "class", "delete-drip");
    			add_location(form, file$1, 123, 20, 4212);
    			attr_dev(div1, "class", "drip-img");
    			add_location(div1, file$1, 121, 16, 4091);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(115:12) {#if dripdata.drip}",
    		ctx
    	});

    	return block;
    }

    // (154:12) {:else}
    function create_else_block(ctx) {
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
    			add_location(input, file$1, 154, 16, 5605);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(154:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (151:12) {#if dripdata.blockupload}
    function create_if_block$1(ctx) {
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
    			add_location(h2, file$1, 151, 16, 5440);
    			add_location(div, file$1, 152, 16, 5487);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(151:12) {#if dripdata.blockupload}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
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
    		if (/*dripdata*/ ctx[0].drip) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*dripdata*/ ctx[0].blockupload) return create_if_block$1;
    		return create_else_block;
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
    			add_location(div0, file$1, 113, 8, 3769);
    			attr_dev(i, "class", "fa fa-chevron-left");
    			add_location(i, file$1, 138, 32, 4854);
    			attr_dev(a, "href", "/");
    			add_location(a, file$1, 138, 20, 4842);
    			add_location(h3, file$1, 137, 16, 4816);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			attr_dev(button, "id", "upload-new-image");
    			set_style(button, "display", "none");
    			set_style(button, "position", "absolute");
    			set_style(button, "top", "5px");
    			set_style(button, "right", "15px");
    			add_location(button, file$1, 141, 16, 4963);
    			add_location(div1, file$1, 136, 12, 4793);
    			attr_dev(img, "id", "preview");
    			attr_dev(img, "class", "drip-pic");
    			attr_dev(img, "alt", "drip");
    			add_location(img, file$1, 144, 16, 5212);
    			attr_dev(div2, "class", "drip-img");
    			add_location(div2, file$1, 143, 12, 5172);
    			attr_dev(div3, "class", "col-12 col-md-6 offset-md-3");
    			attr_dev(div3, "id", "new-drip");
    			set_style(div3, "display", "none");
    			add_location(div3, file$1, 135, 8, 4702);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$1, 112, 4, 3742);
    			attr_dev(div5, "class", "col-12 col-md-6 offset-md-3");
    			add_location(div5, file$1, 149, 8, 5341);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$1, 148, 4, 5314);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$1, 111, 0, 3713);
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
    				dispose = listen_dev(button, "click", /*uploadNewImage*/ ctx[1], false, false, false);
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
    		id: create_fragment$1.name,
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Drip', slots, []);
    	let { userdata = {} } = $$props;
    	let { location = "" } = $$props;
    	let dripdata = {};

    	onMount(async () => {
    		$$invalidate(0, dripdata = await getDrip());
    	});

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
    				location.reload();
    			},
    			error() {
    				alert("Upload failed");
    				location.reload();
    			}
    		});
    	}

    	const writable_props = ['userdata', 'location'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Drip> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('userdata' in $$props) $$invalidate(2, userdata = $$props.userdata);
    		if ('location' in $$props) $$invalidate(3, location = $$props.location);
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
    		if ('userdata' in $$props) $$invalidate(2, userdata = $$props.userdata);
    		if ('location' in $$props) $$invalidate(3, location = $$props.location);
    		if ('dripdata' in $$props) $$invalidate(0, dripdata = $$props.dripdata);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dripdata, uploadNewImage, userdata, location];
    }

    class Drip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { userdata: 2, location: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drip",
    			options,
    			id: create_fragment$1.name
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

    /* src\App.svelte generated by Svelte v3.46.3 */
    const file = "src\\App.svelte";

    // (28:12) {#if userdata.id}
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
    			set_style(div0, "height", "70px");
    			set_style(div0, "width", "1px");
    			add_location(div0, file, 30, 6, 1015);
    			attr_dev(a0, "href", "/settings");
    			add_location(a0, file, 32, 7, 1092);
    			attr_dev(div1, "class", "item");
    			add_location(div1, file, 31, 6, 1065);
    			attr_dev(input, "type", "hidden");
    			attr_dev(input, "name", "delete");
    			input.value = "YES";
    			add_location(input, file, 38, 8, 1243);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "onclick", "$(this).closest('form').submit();return false;");
    			add_location(a1, file, 39, 8, 1302);
    			attr_dev(form, "action", "/api/delete");
    			attr_dev(form, "method", "post");
    			add_location(form, file, 37, 7, 1192);
    			attr_dev(div2, "class", "item");
    			add_location(div2, file, 36, 6, 1165);
    			attr_dev(a2, "href", "/logout");
    			add_location(a2, file, 45, 7, 1475);
    			attr_dev(div3, "class", "item");
    			add_location(div3, file, 44, 6, 1448);
    			attr_dev(div4, "class", "usermenu");
    			set_style(div4, "display", "none");
    			add_location(div4, file, 29, 5, 962);
    			if (!src_url_equal(img.src, img_src_value = /*userdata*/ ctx[1].avatar)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			add_location(img, file, 50, 5, 1556);
    			attr_dev(div5, "id", "userinfo");
    			add_location(div5, file, 28, 4, 936);
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

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*toggleusermenu*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userdata*/ 2 && !src_url_equal(img.src, img_src_value = /*userdata*/ ctx[1].avatar)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(28:12) {#if userdata.id}",
    		ctx
    	});

    	return block;
    }

    // (56:8) <Router {url}>
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/drip",
    				component: Drip,
    				userdata: /*userdata*/ ctx[1]
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/settings",
    				component: Settings,
    				userdata: /*userdata*/ ctx[1]
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/p/:profileId",
    				component: Profile
    			},
    			$$inline: true
    		});

    	route3 = new Route({
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
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};
    			if (dirty & /*userdata*/ 2) route0_changes.userdata = /*userdata*/ ctx[1];
    			route0.$set(route0_changes);
    			const route1_changes = {};
    			if (dirty & /*userdata*/ 2) route1_changes.userdata = /*userdata*/ ctx[1];
    			route1.$set(route1_changes);
    			const route3_changes = {};
    			if (dirty & /*userdata*/ 2) route3_changes.userdata = /*userdata*/ ctx[1];
    			route3.$set(route3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(56:8) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div2;
    	let div1;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let t3;
    	let a1;
    	let t5;
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
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Profile";
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "Home";
    			t5 = space();
    			create_component(router.$$.fragment);
    			attr_dev(img, "class", "center-block");
    			if (!src_url_equal(img.src, img_src_value = "/css/img/logo.png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "width", "300px");
    			set_style(img, "height", "auto");
    			set_style(img, "margin-top", "0");
    			attr_dev(img, "alt", "logo");
    			add_location(img, file, 23, 5, 748);
    			attr_dev(a0, "href", "https://discord.gg/rsplatoon");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file, 22, 4, 686);
    			add_location(h1, file, 25, 4, 872);
    			add_location(div0, file, 21, 3, 675);
    			attr_dev(a1, "class", "btn btn-primary");
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "role", "button");
    			add_location(a1, file, 53, 3, 1662);
    			attr_dev(div1, "class", "jumbotron");
    			add_location(div1, file, 20, 2, 647);
    			attr_dev(div2, "class", "container");
    			set_style(div2, "margin-bottom", "100px");
    			set_style(div2, "padding-left", "0");
    			set_style(div2, "padding-right", "0");
    			add_location(div2, file, 19, 1, 560);
    			add_location(main, file, 18, 0, 551);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, a1);
    			append_dev(div2, t5);
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
    					if_block.m(div1, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope, userdata*/ 10) {
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
    		userData,
    		Home,
    		Profile,
    		Settings,
    		Drip,
    		url,
    		userdata,
    		toggleusermenu
    	});

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    		if ('userdata' in $$props) $$invalidate(1, userdata = $$props.userdata);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, userdata, toggleusermenu];
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
