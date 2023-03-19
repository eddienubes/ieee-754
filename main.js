// Bits: 0  1  2  3  4  5  6  7  8  9  10  11  12  13  14  15
// Type: S  E  E  E  E  E  E  E  E  E  M   M   M   M   M   M
// S - sign
// E - exponent
// M - mantissa
// 16-bit system overall
// Floating point number bitwise:
// N = sign * 2 ^ exponent * mantissa

const EXP_BITS = 5;
const MANTISSA_BITS = 10;
const NON_SIGN_BITS = EXP_BITS + MANTISSA_BITS;

/**
 * Encodes a number into a binary system
 * @param n
 */
const encode = (n) => {
    const sign = Math.sign(n) === -1 ? 1 : 0;

    if (n === 0) {
        return sign === 0 ? 0 : (1 << NON_SIGN_BITS);
    }


    // We calculate the power we have to raise base 2 in order to get the closest lower number to N
    // As per formula: log2(n) = log(any base)(n) / log(any base)(2)
    let exponent = Math.floor(Math.log(Math.abs(n)) / Math.log(2));

    // Here we calculate numerical value interval bounds
    // where exponent's step is always one
    const lower = 2 ** exponent;
    const upper = 2 ** (exponent + 1);

    // adding bias to our exponent as per 16-bit system
    // Then using masking to make sure we fit the value into 5 bits
    exponent = (exponent + 15) & 0b11111;

    // Normalise value within its numerical range and calculate Mantissa!
    // 1024 is the max value for 10 bits available for Mantissa
    const percentage = (Math.abs(n) + lower) / (upper - lower);
    const mantissa = 1024 * percentage;

    // 1 000000000000000 - after shifting sign to the left
    // 1 11111 0000000000 - after shifting exponent to the left and leaving some space for Mantissa
    return (sign << NON_SIGN_BITS) | (exponent << MANTISSA_BITS) | mantissa;
}

const decode = (n) => {
    const sign = (n & 0b1000000000000000) >> NON_SIGN_BITS;
    const exponent = (n & 0b0111110000000000) >> MANTISSA_BITS;
    const mantissa = (n & 0b0000001111111111);

    if (exponent === 0 && mantissa === 0) {
        return sign === 1 ? -0 : 0;
    }

    if (exponent === 0b11111) {
        if (mantissa === 0) {
            return sign === 1 ? -Infinity : Infinity;
        } else {
            return NaN;
        }
    }

    const wholePart = exponent === 0 ? 0 : 1;

    // 1024 - max value of 10 bits Mantissa
    const percentage = mantissa / 1024;

    return (-1) ** sign * (wholePart + percentage) * 2 ** (exponent - 15);
}

const original = 12.52571;
const encoded = encode(original);
const decoded = decode(encoded);
const infinityCheck = decode(0b0111110000000000);
const minusInfinityCheck = decode(0b1111110000000000);
const nanCheck = decode(0b1111110000000001);

console.log(`Original: ${original}, encoded: ${encoded}`);
console.log(`Decoded: ${decoded}`);
console.log(`Infinity: ${infinityCheck}`);
console.log(`Minus infinity: ${minusInfinityCheck}`);
console.log(`NaN: ${nanCheck}`);

// Output:
// Original: 12.52571, encoded: 19011
// Decoded: 12.5234375

/**
 * Encoded number does not equal the original because of the way we store our floating point number.
 * We sort of made our own Floating-Point system inside javascript thus we have to handle encoding/decoding ourselves.
 */