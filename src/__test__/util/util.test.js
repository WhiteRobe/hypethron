import {generateSalt, hmac} from '../../util/crypto-hash-tool.js';

it('should equal', function () {
  expect(generateSalt(16).length === 16).toBeTruthy();
  let pw = 'password';
  let hash = hmac('key', pw, {alg: "md5", repeat: 1});
  expect(hash === 'a95669c550c0c9cc91ef29a91873ca4f').toBeTruthy();
});