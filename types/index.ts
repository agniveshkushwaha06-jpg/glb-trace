export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "resolved";

export type Profile = {
  id: string;
  name: string;
  roll_no: string | null;
  admission_no: string | null;
  year: string | null;
  section: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export type Item = {
  id: string;
  type: ItemType;
  title: string;
  category: string;
  description: string | null;
  location: string;
  item_date: string;
  image_url: string | null;
  status: ItemStatus;
  reported_by: string;
  created_at: string;
};

export type ItemWithReporter = Item & {
  reporter: Pick<Profile, "id" | "name" | "year" | "section" | "phone" | "email"> | null;
};
