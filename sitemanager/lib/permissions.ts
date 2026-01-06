export type UserRole = "manager" | "supervisor" | "user"

export interface Permission {
  canCreateSnag: boolean
  canEditSnag: boolean
  canEditSnagDetails: boolean // title, description, location, priority
  canChangeSnagStatus: boolean
  canAddSnagPhotos: boolean
  canDeleteSnagPhotos: boolean
  canDeleteSnag: boolean
}

export function getPermissions(role: string): Permission {
  switch (role) {
    case "manager":
      return {
        canCreateSnag: true,
        canEditSnag: true,
        canEditSnagDetails: true,
        canChangeSnagStatus: true,
        canAddSnagPhotos: true,
        canDeleteSnagPhotos: true,
        canDeleteSnag: true,
      }
    case "supervisor":
      return {
        canCreateSnag: false, // Supervisors can't create snags, only managers
        canEditSnag: true, // But can edit existing ones
        canEditSnagDetails: false, // Can't change title, description, etc.
        canChangeSnagStatus: true, // Can change status
        canAddSnagPhotos: true, // Can add photos
        canDeleteSnagPhotos: false, // Can't delete photos
        canDeleteSnag: false, // Can't delete snags
      }
    default:
      return {
        canCreateSnag: false,
        canEditSnag: false,
        canEditSnagDetails: false,
        canChangeSnagStatus: false,
        canAddSnagPhotos: false,
        canDeleteSnagPhotos: false,
        canDeleteSnag: false,
      }
  }
}
