import { InteropContainer } from '../../src/implementations/container/InteropContainer';
import { testContainerContract } from '../../src/testsuite';

testContainerContract('InteropContainer', () => new InteropContainer());
