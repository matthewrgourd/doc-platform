import {loadNavigationSidebar} from './navigation-contract';

const sidebars = loadNavigationSidebar({
  filePath: 'docs/petstore/navigation.json',
  sidebarId: 'petstoreSidebar',
});

export default sidebars;
