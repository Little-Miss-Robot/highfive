import { DefaultRetryPolicy } from '../../src/implementations/execution/DefaultRetryPolicy';
import { testRetryPolicyContract } from '../../src/testsuite/execution/testRetryPolicyContract';

testRetryPolicyContract('DefaultRetryPolicy', () => new DefaultRetryPolicy());
