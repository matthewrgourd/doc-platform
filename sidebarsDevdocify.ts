import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  devdocifySidebar: [
    {type: 'doc', id: 'index', label: 'Overview'},
    {
      type: 'category',
      label: 'Tutorials',
      items: [{type: 'doc', id: 'tutorials/index', label: 'Start here'}],
    },
    {
      type: 'category',
      label: 'How-to',
      items: [{type: 'doc', id: 'how-to/index', label: 'Task guides'}],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [{type: 'doc', id: 'reference/index', label: 'Reference hub'}],
    },
    {
      type: 'category',
      label: 'Explanation',
      items: [{type: 'doc', id: 'explanation/index', label: 'Concepts'}],
    },
  ],
};

export default sidebars;
