import {loadNavigationSidebar} from './navigation-contract';

const sidebars = loadNavigationSidebar({
  filePath: 'docs/platzi/navigation.json',
  sidebarId: 'platziSidebar',
});

export default sidebars;
