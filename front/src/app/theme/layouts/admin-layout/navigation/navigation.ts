import { environment } from '../../../../../environments/environment';
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
        id: '',
        title: 'User Management',
        type: 'item',
        url: '/users',
        classes: 'nav-item',
        icon: 'chrome',
        hidden: true
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
        id: 'AttendanceManagement',
        title: 'Attendance Management',
        type: 'item',
        url: environment.attendanceManagementPath,
        classes: 'nav-item',
        icon: 'book'
      }
    ]
  }
];
