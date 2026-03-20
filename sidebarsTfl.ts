import {loadNavigationSidebar} from './navigation-contract';

const sidebars = loadNavigationSidebar({
  filePath: 'docs/tfl/navigation.json',
  sidebarId: 'tflSidebar',
});

export default sidebars;
