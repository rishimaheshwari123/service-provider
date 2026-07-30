const POLL_CATEGORIES = [
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
];

const POLL_AGE_GROUPS = [
  { value: "group_a", label: "Group A", description: "5-15 Years" },
  { value: "group_b", label: "Group B", description: "15 Years and Above" },
];

const POLL_CATEGORY_VALUES = POLL_CATEGORIES.map((category) => category.value);
const POLL_AGE_GROUP_VALUES = POLL_AGE_GROUPS.map((ageGroup) => ageGroup.value);

const normalizePollCategory = (category) => {
  if (!category) return null;

  const normalized = category.toString().trim().toLowerCase();
  const matchedCategory = POLL_CATEGORIES.find(
    (item) => item.value === normalized || item.label.toLowerCase() === normalized
  );

  return matchedCategory?.value || null;
};

const normalizePollAgeGroup = (ageGroup) => {
  if (!ageGroup) return null;

  const normalized = ageGroup.toString().trim().toLowerCase();
  const matchedAgeGroup = POLL_AGE_GROUPS.find(
    (item) =>
      item.value === normalized ||
      item.label.toLowerCase() === normalized ||
      item.description.toLowerCase() === normalized
  );

  return matchedAgeGroup?.value || null;
};

module.exports = {
  POLL_CATEGORIES,
  POLL_AGE_GROUPS,
  POLL_CATEGORY_VALUES,
  POLL_AGE_GROUP_VALUES,
  normalizePollCategory,
  normalizePollAgeGroup,
};