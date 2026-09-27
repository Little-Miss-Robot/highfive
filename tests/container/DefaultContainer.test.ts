import { DefaultContainer } from '../../src/implementations/container/DefaultContainer';
import { testContainerContract } from '../../src/testsuite';

testContainerContract('InteropContainer', () => new DefaultContainer());
