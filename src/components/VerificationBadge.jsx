const VerificationBadge = ({ trustTier, telegramActive }) => {
  let color = "";
  let label = "";

  if (trustTier === "FIELD_VERIFIED") {
    color = "text-green-500"; // Level 3
    label = "Field Verified";
  } else if (trustTier === "ID_VERIFIED") {
    color = "text-orange-500"; // Level 2
    label = "ID Verified";
  } else if (telegramActive) {
    color = "text-gray-500"; // Level 1 (darker silver)
    label = "Telegram Verified";
  } else {
    return null;
  }

  return (
    <span
      className={`material-symbols-outlined ${color} text-lg leading-none drop-shadow-sm`}
      title={label}
    >
      verified
    </span>
  );
};

export default VerificationBadge;
