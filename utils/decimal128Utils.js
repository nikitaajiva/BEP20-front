const mongoose = require('mongoose');

/**
 * Utility functions for Decimal128 arithmetic since Mongoose Decimal128 doesn't have built-in arithmetic methods
 */

/**
 * Add two Decimal128 values
 * @param {mongoose.Types.Decimal128} a 
 * @param {mongoose.Types.Decimal128} b 
 * @returns {mongoose.Types.Decimal128}
 */
function addDecimal128(a, b) {
  const aValue = parseFloat(a?.toString() || '0');
  const bValue = parseFloat(b?.toString() || '0');
  const result = aValue + bValue;
  return mongoose.Types.Decimal128.fromString(result.toString());
}

/**
 * Subtract two Decimal128 values (a - b)
 * @param {mongoose.Types.Decimal128} a 
 * @param {mongoose.Types.Decimal128} b 
 * @returns {mongoose.Types.Decimal128}
 */
function subtractDecimal128(a, b) {
  const aValue = parseFloat(a?.toString() || '0');
  const bValue = parseFloat(b?.toString() || '0');
  const result = aValue - bValue;
  return mongoose.Types.Decimal128.fromString(result.toString());
}

/**
 * Multiply two Decimal128 values
 * @param {mongoose.Types.Decimal128} a 
 * @param {mongoose.Types.Decimal128} b 
 * @returns {mongoose.Types.Decimal128}
 */
function multiplyDecimal128(a, b) {
  const aValue = parseFloat(a?.toString() || '0');
  const bValue = parseFloat(b?.toString() || '0');
  const result = aValue * bValue;
  return mongoose.Types.Decimal128.fromString(result.toString());
}

/**
 * Compare two Decimal128 values
 * @param {mongoose.Types.Decimal128} a 
 * @param {mongoose.Types.Decimal128} b 
 * @returns {number} -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareDecimal128(a, b) {
  const aValue = parseFloat(a?.toString() || '0');
  const bValue = parseFloat(b?.toString() || '0');
  if (aValue < bValue) return -1;
  if (aValue > bValue) return 1;
  return 0;
}

/**
 * Find minimum of two Decimal128 values
 * @param {mongoose.Types.Decimal128} a 
 * @param {mongoose.Types.Decimal128} b 
 * @returns {mongoose.Types.Decimal128}
 */
function minDecimal128(a, b) {
  return compareDecimal128(a, b) <= 0 ? a : b;
}

/**
 * Find maximum of two Decimal128 values
 * @param {mongoose.Types.Decimal128} a 
 * @param {mongoose.Types.Decimal128} b 
 * @returns {mongoose.Types.Decimal128}
 */
function maxDecimal128(a, b) {
  return compareDecimal128(a, b) >= 0 ? a : b;
}

/**
 * Ensure a value is a proper Decimal128 object
 * @param {any} value 
 * @param {string} defaultValue 
 * @returns {mongoose.Types.Decimal128}
 */
function ensureDecimal128(value, defaultValue = '0.0') {
  if (value instanceof mongoose.Types.Decimal128) {
    return value;
  }
  return mongoose.Types.Decimal128.fromString(value?.toString() || defaultValue);
}

module.exports = {
  addDecimal128,
  subtractDecimal128,
  multiplyDecimal128,
  compareDecimal128,
  minDecimal128,
  maxDecimal128,
  ensureDecimal128
};
