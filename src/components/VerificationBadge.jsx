const VerificationBadge = ({ trustTier, telegramActive }) => {
  let color = "";
  let label = "";

  if (trustTier === "FIELD_VERIFIED") {
    color = "text-primary"; // Level 3 (Premium)
    label = "Field Verified (High Trust)";
  } else if (trustTier === "ID_VERIFIED") {
    color = "text-secondary"; // Level 2
    label = "Identity Verified";
  } else if (telegramActive) {
    color = "text-on_surface_variant/40"; // Level 1 (Entry)
    label = "Telegram Linked";
  } else {
    return null;
  }

  return (
    <span
      className={`material-symbols-outlined ${color} text-lg leading-none drop-shadow-sm cursor-help hover:scale-110 transition-transform`}
      title={label}
    >
      {trustTier === "FIELD_VERIFIED" ? "verified_user" : "verified"}
    </span>
  );
};

export default VerificationBadge;
