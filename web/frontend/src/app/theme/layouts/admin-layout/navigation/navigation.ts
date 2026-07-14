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
  roles?: string[];
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    roles: ['ADMIN', 'TEACHER'],
    children: [
      {
        id: 'Dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard',
        icon: 'dashboard',
        breadcrumbs: false,
        roles: ['ADMIN', 'TEACHER']
      }
    ]
  },
  {
    id: 'principal',
    title: 'principal',
    type: 'group',
    icon: 'icon-navigation',
    roles: ['ADMIN', 'TEACHER'],
    children: [
      {
        id: 'user-management',
        title: 'User Management',
        type: 'item',
        url: '/users',
        classes: 'nav-item',
        icon: 'chrome',
        roles: ['ADMIN']
      },
      {
        id: 'attendance-management',
        title: 'Attendance Management',
        type: 'item',
        url: '/attendance',
        classes: 'nav-item',
        icon: 'chrome',
        roles: ['TEACHER']
      },
      {
        id: 'attendance-list',
        title: 'Attendance List',
        type: 'item',
        url: '/list/attendance',
        classes: 'nav-item',
        icon: 'chrome',
        roles: ['ADMIN']
      },
      {
        id: 'Justifications',
        title: 'Justifications',
        type: 'item',
        url: '/justifications',
        classes: 'nav-item',
        icon: 'chrome',
        roles: ['ADMIN']
      }
    ]
  }
];

export function filterNavigationByRole(items: NavigationItem[], userRole: string | null): NavigationItem[] {
  if (!userRole) {
    return [];
  }

  return items
    .map(item => {
      if (item.roles && !item.roles.includes(userRole)) {
        return null;
      }

      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children.filter(child => {
          if (child.hidden) return false;
          return !child.roles || child.roles.includes(userRole);
        });

        if (filteredChildren.length === 0) return null;

        return { ...item, children: filteredChildren };
      }

      return item;
    })
    .filter((item): item is NavigationItem => item !== null);
}
