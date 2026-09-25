import { CryptoIdGenerator } from '../../src/identifiers/CryptoIdGenerator';
import { testIdGeneratorContract } from '../../src/testsuite/identifiers/testIdGeneratorContract';

testIdGeneratorContract('CryptoIdGenerator', () => new CryptoIdGenerator());
