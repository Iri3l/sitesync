export type UserRole = "director" | "manager" | "supervisor" | "user"

export interface Permission {
  // Snag permissions
  canCreateSnag: boolean
  canEditSnag: boolean
  canEditSnagDetails: boolean // title, description, location, priority
  canChangeSnagStatus: boolean
  canAddSnagPhotos: boolean
  canDeleteSnagPhotos: boolean
  canDeleteSnag: boolean
  // Site permissions
  canCreateSite: boolean
  canEditSite: boolean
  canDeleteSite: boolean
  canViewAllSites: boolean // Director can see all sites including inactive
  // User management permissions
  canManageUsers: boolean
  canChangeUserRoles: boolean
  canResetPasswords: boolean
  // Stock permissions
  canCreateStock: boolean
  canEditStock: boolean
  canDeleteStock: boolean
}

export function getPermissions(role: string): Permission {
  switch (role) {
    case "director":
      return {
        // Full snag permissions
        canCreateSnag: true,
        canEditSnag: true,
        canEditSnagDetails: true,
        canChangeSnagStatus: true,
        canAddSnagPhotos: true,
        canDeleteSnagPhotos: true,
        canDeleteSnag: true,
        // Full site permissions
        canCreateSite: true,
        canEditSite: true,
        canDeleteSite: true,
        canViewAllSites: true,
        // User management
        canManageUsers: true,
        canChangeUserRoles: true,
        canResetPasswords: true,
        // Stock permissions
        canCreateStock: true,
        canEditStock: true,
        canDeleteStock: true,
      }
    case "manager":
      return {
        canCreateSnag: true,
        canEditSnag: true,
        canEditSnagDetails: true,
        canChangeSnagStatus: true,
        canAddSnagPhotos: true,
        canDeleteSnagPhotos: true,
        canDeleteSnag: true,
        // Site permissions - managers can create their own sites
        canCreateSite: true,
        canEditSite: true,
        canDeleteSite: false,
        canViewAllSites: false,
        // No user management
        canManageUsers: false,
        canChangeUserRoles: false,
        canResetPasswords: false,
        // Stock permissions
        canCreateStock: true,
        canEditStock: true,
        canDeleteStock: true,
      }
    case "supervisor":
      return {
        canCreateSnag: false,
        canEditSnag: true,
        canEditSnagDetails: false,
        canChangeSnagStatus: true,
        canAddSnagPhotos: true,
        canDeleteSnagPhotos: false,
        canDeleteSnag: false,
        // No site management
        canCreateSite: false,
        canEditSite: false,
        canDeleteSite: false,
        canViewAllSites: false,
        // No user management
        canManageUsers: false,
        canChangeUserRoles: false,
        canResetPasswords: false,
        // Limited stock permissions
        canCreateStock: false,
        canEditStock: false,
        canDeleteStock: false,
      }
    default: // user
      return {
        canCreateSnag: false,
        canEditSnag: false,
        canEditSnagDetails: false,
        canChangeSnagStatus: false,
        canAddSnagPhotos: false,
        canDeleteSnagPhotos: false,
        canDeleteSnag: false,
        // No site management
        canCreateSite: false,
        canEditSite: false,
        canDeleteSite: false,
        canViewAllSites: false,
        // No user management
        canManageUsers: false,
        canChangeUserRoles: false,
        canResetPasswords: false,
        // No stock permissions
        canCreateStock: false,
        canEditStock: false,
        canDeleteStock: false,
      }
  }
}

// Helper to check if role is admin-level (director)
export function isDirector(role: string): boolean {
  return role === "director"
}

// Helper to check if role can manage content (director or manager)
export function canManageContent(role: string): boolean {
  return role === "director" || role === "manager"
}
