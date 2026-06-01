import {registerComponent} from './app-root';
import {Label, Button, Flex} from './components/basic';

export * from './core';
export * from './app-root';
export * from './component';
export * from './utils';
export * from './components/basic';

// 注册初始组件
registerComponent('Label', Label);
registerComponent('Button', Button);
registerComponent('Flex', Flex);
