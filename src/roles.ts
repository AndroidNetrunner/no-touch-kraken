export const Roles = {
  PIRATE: "해적",
  SKELETON: "스켈레톤",
} as const;

const roles = {
  4: [Roles.PIRATE, Roles.PIRATE, Roles.PIRATE, Roles.SKELETON, Roles.SKELETON],
  5: [
    Roles.PIRATE,
    Roles.PIRATE,
    Roles.PIRATE,
    Roles.PIRATE,
    Roles.SKELETON,
    Roles.SKELETON,
  ],
  6: [
    Roles.PIRATE,
    Roles.PIRATE,
    Roles.PIRATE,
    Roles.PIRATE,
    Roles.SKELETON,
    Roles.SKELETON,
  ],
};

export default roles;
