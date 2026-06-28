import { Mic, Image as ImageIcon, Link2 } from "lucide-react";
import { C, PL } from "../theme";
import { PlatBadge, StatusPill, Thumb } from "./ui";

export default function ContentCard({ item, onClick }) {
  const hasImages = Array.isArray(item.images) && item.images.length > 0;
  return (
    <div onClick={() => onClick(item)} style={{
      background: C.card, borderRadius: 16, padding: "12px 14px",
      marginBottom: 10, cursor: "pointer", display: "flex", gap: 12,
      alignItems: "center", boxShadow: C.sh, border: `1px solid ${C.border}`,
    }}>
      <Thumb platform={item.platform} size={56} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5 }}>
          <PlatBadge platform={item.platform} size={12} />
          <span style={{ fontSize: 11.5, color: C.muted }}>{PL[item.platform]?.label}</span>
          <span style={{ fontSize: 11, color: C.muted }}>· {item.type}</span>
        </div>
        <div style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.3, marginBottom: 7, color: C.text }}>{item.title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <StatusPill status={item.status} />
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {item.audio && <Mic size={13} color={C.muted} />}
            {hasImages && <ImageIcon size={13} color={C.muted} />}
            {item.link && <Link2 size={13} color={C.muted} />}
            <span style={{ fontSize: 12, color: C.muted }}>{item.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
