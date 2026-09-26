import DefaultTimeout from '../../src/execution/DefaultTimeout';
import { testTimeoutContract } from '../../src/testsuite/execution/testTimeoutContract';

testTimeoutContract('DefaultTimeout', () => new DefaultTimeout());
