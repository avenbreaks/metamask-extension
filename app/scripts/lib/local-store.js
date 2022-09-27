import browser from 'webextension-polyfill';
import log from 'loglevel';
import { checkForError } from './util';

/**
 * A wrapper around the extension's storage local API
 */
export default class ExtensionStore {
  constructor() {
    this.isSupported = Boolean(browser.storage?.local);
    if (!this.isSupported) {
      log.error('Storage local API not available.');
    }
  }

  /**
   * Returns all of the keys currently saved
   *
   * This method originally gets all keys,
   * this is not ideal if we want to manage keys outside the state object.
   * The keys needed for state management are passed as defaut arguments ([data, meta])
   * any other implementer can pass in their own key(s).
   *
   * @param key
   * @returns {Promise<*>}
   */
  async get(key = ['data', 'meta']) {
    if (!this.isSupported) {
      return undefined;
    }
    const result = await this._get(key);
    // extension.storage.local always returns an obj
    // if the object is empty, treat it as undefined
    if (isEmpty(result)) {
      return undefined;
    }
    return result;
  }

  /**
   * Sets the key in local state
   *
   * @param {object} state - The state to set
   * @returns {Promise<void>}
   */
  async set(state) {
    return this._set(state);
  }

  /**
   * Returns all of the keys currently saved
   *
   * @param key
   * @private
   * @returns {object} the key-value map from local storage
   */
  _get(key) {
    const { local } = browser.storage;
    return new Promise((resolve, reject) => {
      local.get(key).then((/** @type {any} */ result) => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Sets the key in local state
   *
   * @param {object} obj - The key to set
   * @returns {Promise<void>}
   * @private
   */
  _set(obj) {
    const { local } = browser.storage;
    return new Promise((resolve, reject) => {
      local.set(obj).then(() => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

/**
 * Returns whether or not the given object contains no keys
 *
 * @param {object} obj - The object to check
 * @returns {boolean}
 */
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
