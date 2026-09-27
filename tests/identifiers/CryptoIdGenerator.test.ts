import { CryptoIdGenerator } from '../../src/implementations/identifiers/CryptoIdGenerator';
import { testIdGeneratorContract } from '../../src/testsuite/identifiers/testIdGeneratorContract';

testIdGeneratorContract('CryptoIdGenerator', () => new CryptoIdGenerator());
