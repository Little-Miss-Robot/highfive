import DefaultTimeout from '../../src/implementations/execution/DefaultTimeout';
import { testTimeoutContract } from '../../src/testsuite/execution/testTimeoutContract';

testTimeoutContract('DefaultTimeout', () => new DefaultTimeout());
