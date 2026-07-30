export const POLL_CATEGORIES = [
  { value: "dance", label: "Dance" },
  { value: "singing", label: "Singing" },
  { value: "acting", label: "Acting" },
  { value: "comedy", label: "Comedy" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art" },
  { value: "cooking", label: "Cooking" },
  { value: "sports", label: "Sports" },
  { value: "fashion", label: "Fashion" },
  { value: "other", label: "Other" },
] as const;

export const POLL_AGE_GROUPS = [
  { value: "group_a", label: "Group A", description: "5-15 Years" },
  { value: "group_b", label: "Group B", description: "15 Years and Above" },
] as const;

export type PollCategoryValue = (typeof POLL_CATEGORIES)[number]["value"];
export type PollAgeGroupValue = (typeof POLL_AGE_GROUPS)[number]["value"];

export const getPollCategoryLabel = (value?: string) => {
  return POLL_CATEGORIES.find((category) => category.value === value)?.label || "Other";
};

export const getPollAgeGroupLabel = (value?: string) => {
  const ageGroup = POLL_AGE_GROUPS.find((item) => item.value === value) || POLL_AGE_GROUPS[0];
  return `${ageGroup.label} (${ageGroup.description})`;
};