const { Transaction } = require('../src');
const format = require('../src/util/format');

const KEY = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const ADDRESS = '0xfcad0b19bb29d4674531d6f115237e16afce377c';

test('Transaction', () => {
  const tx = new Transaction({
    nonce: 0,
    gasPrice: 1,
    gas: 21000,
    to: '0x0123456789012345678901234567890123456789',
    value: 0,
  });

  expect(tx.nonce).toEqual(0);
  expect(tx.gasPrice).toEqual(1);
  expect(tx.gas).toEqual(21000);
  expect(tx.to).toEqual('0x0123456789012345678901234567890123456789');
  expect(tx.value).toEqual(0);
  expect(tx.data).toEqual(undefined);
  expect(tx.r).toEqual(undefined);
  expect(tx.s).toEqual(undefined);
  expect(tx.v).toEqual(undefined);
  expect(tx.from).toEqual(undefined); // virtual attribute
  expect(tx.hash).toEqual(undefined); // virtual attribute

  tx.sign(KEY);

  expect(format.hex(tx.r)).toEqual('0x489153a772628dd224e516f5231740a526dd4a7af90fe6d9b270286cb8cf2d68');
  expect(format.hex(tx.s)).toEqual('0x40d27551b593ffba7a69a997690fc0461aed760a78236d4ed33e26c9c1a7c97b');
  expect(tx.v).toEqual(0);
  expect(tx.from).toEqual(ADDRESS);
  expect(tx.hash).toEqual('0xe3233c95242fd25af7a87fa5e97a4051146d84d4495c0495a9459fad5bd31907');
  expect(tx.serialize()).toEqual('0xf85f8001825208940123456789012345678901234567890123456789808080a0489153a772628dd224e516f5231740a526dd4a7af90fe6d9b270286cb8cf2d68a040d27551b593ffba7a69a997690fc0461aed760a78236d4ed33e26c9c1a7c97b');

  tx.value = 1;
  expect(tx.from).not.toEqual(ADDRESS);
});
