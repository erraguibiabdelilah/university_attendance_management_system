/**
 * Index des Guards pour la gestion des autorisations
 * 
 * Exports:
 * - authGuard: Vérifie l'authentification de base
 * - adminGuard: Vérifie le rôle ADMIN
 * - teacherGuard: Vérifie les rôles TEACHER ou ADMIN
 * - teacherOnlyGuard: Vérifie le rôle TEACHER uniquement (ADMIN non autorisé)
 */

export { authGuard } from './auth.guard';
export { adminGuard } from './admin.guard';
export { teacherGuard } from './teacher.guard';
export { teacherOnlyGuard } from './teacher-only.guard';
