export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'Dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard',
        icon: 'dashboard',
        breadcrumbs: false
      }
    ]
  },

  {
    id: 'principal',
    title: 'principal',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'Projects',
        title: 'Projects',
        type: 'item',
        url: '/projects',
        classes: 'nav-item',
        icon: 'chrome'
      },
      {
        id: 'Entities',
        title: 'Entities',
        type: 'item',
        url: '/entities',
        classes: 'nav-item',
        icon: 'chrome'
      },
      {
        id: 'Attributes',
        title: 'Attributes',
        type: 'item',
        url: '/attributes',
        classes: 'nav-item',
        icon: 'chrome'
      }
    ]
  }
];
