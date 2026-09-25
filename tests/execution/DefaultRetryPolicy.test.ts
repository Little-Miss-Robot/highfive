import { DefaultRetryPolicy } from '../../src/execution/DefaultRetryPolicy';
import { testRetryPolicyContract } from '../../src/testsuite/execution/testRetryPolicyContract';

testRetryPolicyContract('DefaultRetryPolicy', () => new DefaultRetryPolicy());
