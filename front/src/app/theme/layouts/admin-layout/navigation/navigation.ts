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
      },
      {
        id: 'manage-users',
        title: 'Manage Users',
        type: 'item',
        url: '/admin/manage-users',
        classes: 'nav-item',
        icon: 'users'
      }
,      {
        id: 'attendance-create',
        title: 'Create Attendance',
        type: 'item',
        url: '/attendance/create',
        classes: 'nav-item',
        icon: 'check-circle'
      },
      {
        id: 'attendance-mark',
        title: 'Mark Attendance',
        type: 'item',
        url: '/attendance/mark',
        classes: 'nav-item',
        icon: 'edit'
      },
      {
        id: 'attendance-history',
        title: 'Absence History',
        type: 'item',
        url: '/attendance/history',
        classes: 'nav-item',
        icon: 'clock-circle'
      },
      {
        id: 'attendance-stats',
        title: 'Student Stats',
        type: 'item',
        url: '/attendance/student-stats',
        classes: 'nav-item',
        icon: 'bar-chart'
      }
    ]
  }
];
