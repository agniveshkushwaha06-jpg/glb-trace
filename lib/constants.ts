export const CATEGORIES = [
  "ID Card",
  "Books",
  "Wallet",
  "Earphones",
  "Bottle",
  "Keys",
  "Bag",
  "Electronics",
  "Other",
] as const;

export const LOCATIONS = [
  "Library",
  "Canteen",
  "Main Gate",
  "Parking",
  "Classroom Block",
  "Lab Block",
  "Hostel",
  "Ground",
  "Other",
] as const;

export const YEARS = ["1st", "2nd", "3rd", "4th"] as const;

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
