export default class Collection {
    _state = reactive({});
    _defaults = reactive({});
    constructor(data = {}) {
        if (!_isNil(data)) {
            _merge(this._state, data);
        }
        this._setDefaults(data);
        this._reset();

        const proxy = new Proxy(this, {
            ownKeys(target) {
                return Reflect.ownKeys(target);
            },
            _has(target, key) {
                return Reflect.has(target._state, key);
            },
            get(target, key, receiver) {
                if (_has(target._state, key)) {
                    return _get(target._state, key);
                }

                if (Reflect.has(target, key)) {
                    const prop = Reflect.get(target, key, receiver);

                    return isRef(prop) ? prop.value : prop;
                }
            },
            set(target, key, value, receiver) {
                if (_has(target._state, key)) {
                    return _set(target._state, key, value);
                }

                if (Reflect.has(target, key)) {
                    const prop = Reflect.get(target, key, receiver);

                    return isRef(prop)
                        ? _set(prop, 'value', value || null)
                        : Reflect.set(target, key, value, receiver);
                }
                return _set(target._state, key, value);
            }
        });
        return proxy;
    }

    _setDefaults(attributes) {
        _merge(this._defaults, _cloneDeep(attributes));

        return this;
    }

    _reset(attrs = this._defaults) {
        _assign(this._state, _cloneDeep(attrs));

        return this;
    }

    _get(key, defaultValue = null) {
        return_get(this._state, key, defaultValue);
    }

    _set(key, value = null) {
        if (typeof key === 'object') {
            this._state = key;
        } else {
            _set(this._state, key, value);
        }

        return this;
    }

    _merge(attributes = {}) {
        if (_isArray(attributes) && !_isArray(this._state)) {
            if (_isArray(this._state)) {
                this._state = reactive([...this._state, ...attributes]);
            }
            this._state = reactive([...attributes]);
        } else _merge(this._state, attributes);

        return this;
    }

    _only(...keys) {
        return _pick(this._toObject, keys);
    }

    get _toObject() {
        const reducerFn = (acc, value, key) => {
            _set(acc, key, value);

            return acc;
        };

        const obj = _reduce(this._state, reducerFn, {});
        return obj;
    }

    get _toJson() {
        return JSON.stringify(this._toObject);
    }
}
