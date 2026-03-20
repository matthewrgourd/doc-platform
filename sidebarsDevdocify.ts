import {loadNavigationSidebar} from './navigation-contract';

const sidebars = loadNavigationSidebar({
  filePath: 'docs/devdocify/navigation.json',
  sidebarId: 'devdocifySidebar',
});

export default sidebars;
